import { Assets } from 'pixi.js'
import { Device, type DeviceTier } from './Device.js'
import type { AssetDefinition, ViewAssets } from './view/ViewAssets.js'

export class GameAssets {
  protected readonly _definitions = new Map<string, AssetDefinition>()
  protected readonly _registered = new Set<string>()

  constructor(viewAssets: readonly ViewAssets[] = []) {
    viewAssets.forEach((assets) => this.add(assets))
  }

  add(viewAssets: ViewAssets): this {
    for (const asset of viewAssets.assets) {
      const existing = this._definitions.get(asset.alias)

      if (!existing) {
        this._definitions.set(asset.alias, asset)
      } else if (existing.src !== asset.src || existing.lowSrc !== asset.lowSrc) {
        throw new Error(`Asset "${asset.alias}" in "${viewAssets.name}" conflicts with an already declared asset`)
      }
    }

    return this
  }

  get aliases(): string[] {
    return [...this._definitions.keys()]
  }

  async load(tier: DeviceTier = Device.tier, onProgress?: (progress: number) => void): Promise<void> {
    for (const [alias, asset] of this._definitions) {
      // Another game on the page (or this one's last instance) may have declared it already.
      if (!this._registered.has(alias) && !Assets.resolver.hasKey(alias)) {
        Assets.add({ alias, src: this.resolveAssetSrc(asset, tier) })
      }
      this._registered.add(alias)
    }
    await Assets.load(this.aliases, onProgress)
  }

  protected resolveAssetSrc(asset: AssetDefinition, tier: DeviceTier): string {
    if (tier === 'low' && asset.lowSrc) {
      return asset.lowSrc
    }
    return asset.src
  }
}
