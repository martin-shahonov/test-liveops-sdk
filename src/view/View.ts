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

  override destroy(options?: DestroyOptions): void {
    if (!this._isInitialized) {
      return
    }

    super.destroy()
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
