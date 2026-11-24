import { Application, type ApplicationOptions } from 'pixi.js'
import { gsap } from 'gsap'
import { sound } from '@pixi/sound'

import type { View } from './view/View.js'
import { DI, type DIConfig } from './DI.js'
import { Controller } from './Controller.js'
import { Device, type DeviceTier } from './Device.js'
import { lifecycle, LifecycleEvents } from './Lifecycle.js'

export interface GameConfig extends DIConfig {
    app?: Partial<ApplicationOptions>
    container?: HTMLElement
    tier?: DeviceTier
}

export class Game {
    readonly app = new Application()

    protected _di: DI
    protected _views: View[] = []
    protected _controller?: Controller
    protected _started = false
    protected _paused = false

    constructor(protected _config: GameConfig) {
        this._di = new DI(_config)
    }

    protected _preparing?: Promise<void>
    protected _asleep = false

    /**
     * Everything but the play: the canvas made, the assets loaded, the views drawn. The
     * machine stays in `idle` until `start()`. A host prepares a game out of sight (staged),
     * so its `start()` shows it at once. Called once; later calls wait for the first.
     */
    prepare(onProgress?: (progress: number) => void): Promise<void> {
        this._preparing ??= this.load(onProgress)
        return this._preparing
    }

    protected async load(onProgress?: (progress: number) => void): Promise<void> {
        const { app: appOptions, container = document.body, tier } = this._config

        const { controller, views, gameAssets } = this._di.launch()
        this._views = views
        this._controller = controller

        if (tier) {
            Device.setTier(tier)
        }

        await this.app.init({
            resizeTo: window,
            resolution: Math.min(Device.pixelRatio, 2),
            autoDensity: true,
            ...appOptions
        })
        container.appendChild(this.app.canvas)

        await gameAssets.load(Device.tier, onProgress)
        this._views.forEach(view => this.app.stage.addChild(view))

        this._views.forEach((view) => view.render())
        this.resize()
        this.app.renderer.on('resize', this.resize)
        document.addEventListener('visibilitychange', this.handleVisibility)
        // Drawn once now: the textures go up to the GPU and the shaders compile before the game is seen.
        this.app.render()
    }

    /** Prepares the game if it is not yet, and starts its play: the machine leaves `idle`. */
    async start(onProgress?: (progress: number) => void) {
        await this.prepare(onProgress)
        if (this._started) {
            return
        }
        this._started = true
        this.wake()
        this._controller!.start()
    }

    get started(): boolean {
        return this._started
    }

    /**
     * Stops drawing (the ticker), and nothing else: for a game prepared out of sight, which
     * keeps its last frame. Unlike `pause()`, it leaves GSAP and the sounds, which every
     * game on the page shares.
     */
    sleep(): void {
        if (this._asleep) return
        this._asleep = true
        this.app.ticker?.stop()
    }

    /** Draws again after `sleep()`. */
    wake(): void {
        if (!this._asleep) return
        this._asleep = false
        if (!this._paused) this.app.ticker?.start()
    }

    get paused(): boolean {
        return this._paused
    }

    pause(): void {
        if (!this._started || this._paused) {
            return
        }

        this._paused = true
        this.app.ticker.stop()
        gsap.globalTimeline.pause()
        sound.pauseAll()
        lifecycle.emit(LifecycleEvents.pause)
    }

    resume(): void {
        if (!this._started || !this._paused) {
            return
        }
        
        this._paused = false
        gsap.globalTimeline.resume()
        sound.resumeAll()
        lifecycle.emit(LifecycleEvents.resume)
        if (!this._asleep) this.app.ticker.start()
    }

    /** Lays the views out again at the same size: after something they read changed (the safe area). */
    relayout(): void {
        if (this._preparing && this.app.renderer) this.resize()
    }

    protected resize = (): void => {
        const { width, height } = this.app.screen
        this._views.forEach((view) => view.resize(width, height))
    }

    protected handleVisibility = (): void => {
        if (document.hidden) {
            this.pause()
        } else {
            this.resume()
        }
    }

    /** Tears the game down: its canvas, views and machine. A game still loading goes once it has loaded. */
    destroy(): void {
        if (!this._preparing || this._destroyed) {
            return
        }
        this._destroyed = true
        void this._preparing.catch(() => {}).then(() => this.teardown())
    }

    protected _destroyed = false

    protected teardown(): void {
        document.removeEventListener('visibilitychange', this.handleVisibility)
        this._controller?.destroy()
        Object.values(this._views).forEach((view) => view.destroy())
        // Not `destroy(true)`: that also releases Pixi's global pools (batches, textures, canvases),
        // which every other game on the page still draws with: the next to render crashes.
        this.app.destroy({ removeView: true }, { children: true })

        this._started = false
    }
}
