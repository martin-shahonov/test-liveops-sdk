import { Spine } from '@esotericsoftware/spine-pixi-v8'
import { Assets, Container, Sprite, type DestroyOptions } from 'pixi.js'

import { Device } from '../Device.js'

export class GameObject extends Container {
    protected _unsubscribe: () => void

    constructor() {
        super()

        this._unsubscribe = Device.onOrientationChange(() => this.onOrientationChanged())
        this.onOrientationChanged()
    }

    /** Destroys it, its children too when `options` say so, and leaves the orientation listeners. */
    override destroy(options?: DestroyOptions): void {
        super.destroy(options)

        this._unsubscribe()
    }

    createSprite(assetName: string): Sprite {
        const texture = Assets.get(assetName)
        const sprite = new Sprite({ texture })
        sprite.anchor.set(0.5)

        return sprite
    }

    createSpine(assetName: string): Spine {
        const atlas = `${assetName}-atlas`
        const skeleton = `${assetName}-skel`

        return new Spine({ skeleton, atlas })
    }

    protected onOrientationChanged(): void { }
}
