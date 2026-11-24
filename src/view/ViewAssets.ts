export interface AssetDefinition {
  alias: string
  src: string
  lowSrc?: string
}

export class ViewAssets {
  readonly name: string
  readonly assets: readonly AssetDefinition[]

  constructor(name: string, assets: readonly AssetDefinition[] = []) {
    this.name = name
    this.assets = assets
  }
}
