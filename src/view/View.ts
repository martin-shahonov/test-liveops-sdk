import { Container, type DestroyOptions } from 'pixi.js'

import type { ViewAssets } from './ViewAssets'
import type { ViewConfig } from './ViewConfig'

export abstract class View<S extends ViewConfig = ViewConfig> extends Container {
  protected readonly _store: S
  protected readonly _assets: ViewAssets

  protected _isInitialized = false

  constructor(store: S, assets: ViewAssets) {
    super()

    this._store = store
    this._assets = assets

    this.init()
  }

  /**
   * Destroys the view and, by default, everything in it: each part's own `destroy()` then
   * runs, which stops its tweens and its shared-ticker callbacks and drops its video. Textures
   * are kept (`texture: false`): they belong to the assets cache, shared by the next game.
   */
  override destroy(options: DestroyOptions = { children: true }): void {
    if (!this._isInitialized) {
      return
    }

    super.destroy(options)
    this._isInitialized = false
  }

  render(): void { }

  /** The screen (the canvas) has a new size, in CSS pixels. Called once after `render()` and on every resize. */
  resize(_width: number, _height: number): void { }

  protected init() {
    if (this._isInitialized) {
      return
    }

    this.create()

    this._isInitialized = true
  }

  protected create(): void { }
}
