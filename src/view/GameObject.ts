import { Spine } from '@esotericsoftware/spine-pixi-v8'
import { Assets, Container, Sprite } from 'pixi.js'

import { Device } from '../Device.js'

export class GameObject extends Container {
    protected _unsubscribe: () => void

    constructor() {
        super()

        this._unsubscribe = Device.onOrientationChange(() => this.onOrientationChanged())
        this.onOrientationChanged()
    }

    override destroy(): void {
        super.destroy()

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
