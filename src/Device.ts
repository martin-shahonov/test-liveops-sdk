export type DeviceTier = 'low' | 'high'

type OrientationListener = (isLandscape: boolean) => void

interface NavigatorWithMemory extends Navigator {
  deviceMemory?: number
}

/**
 * Device specific information. Static only, values are read lazily from the browser
 * (and are safe to import in a non-browser environment).
 */
export class Device {
  protected static tierOverride?: DeviceTier
  protected static listeners = new Set<OrientationListener>()
  protected static lastIsLandscape?: boolean

  // ---- Platform ----------------------------------------------------------

  static get userAgent(): string {
    return typeof navigator === 'undefined' ? '' : navigator.userAgent
  }

  static get isIOS(): boolean {
    return /iPhone|iPod|iPad/i.test(Device.userAgent) || Device.isIPadOS
  }

  static get isAndroid(): boolean {
    return /Android/i.test(Device.userAgent)
  }

  /** iPadOS 13+ reports itself as a Mac, the only tell is the touch support. */
  protected static get isIPadOS(): boolean {
    return typeof navigator !== 'undefined' && navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1
  }

  static get isTablet(): boolean {
    const ua = Device.userAgent
    return /iPad/i.test(ua) || Device.isIPadOS || (Device.isAndroid && !/Mobile/i.test(ua))
  }

  /** Phones and tablets. */
  static get isMobile(): boolean {
    return Device.isIOS || Device.isAndroid || /Mobi|IEMobile|Opera Mini/i.test(Device.userAgent)
  }

  static get isDesktop(): boolean {
    return !Device.isMobile
  }

  static get isTouch(): boolean {
    return typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0
  }

  // ---- Browser -----------------------------------------------------------

  static get isSafari(): boolean {
    return /^((?!chrome|android|crios|fxios|edg).)*safari/i.test(Device.userAgent)
  }

  static get isChrome(): boolean {
    return /Chrome|CriOS/i.test(Device.userAgent) && !/Edg/i.test(Device.userAgent)
  }

  static get isFirefox(): boolean {
    return /Firefox|FxiOS/i.test(Device.userAgent)
  }

  /** Running as an installed PWA / home screen app. */
  static get isStandalone(): boolean {
    if (typeof window === 'undefined') {
      return false
    }
    return (
      window.matchMedia?.('(display-mode: standalone)').matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true
    )
  }

  // ---- Screen ------------------------------------------------------------

  static get width(): number {
    return typeof window === 'undefined' ? 0 : window.innerWidth
  }

  static get height(): number {
    return typeof window === 'undefined' ? 0 : window.innerHeight
  }

  static get pixelRatio(): number {
    return typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1
  }

  static get isLandscape(): boolean {
    return Device.width >= Device.height
  }

  /**
   * Subscribes to landscape <-> portrait changes (fires only when the orientation flips,
   * not on every resize). Returns an unsubscribe function.
   */
  static onOrientationChange(listener: OrientationListener): () => void {
    if (typeof window === 'undefined') {
      return () => { }
    }

    if (Device.listeners.size === 0) {
      Device.lastIsLandscape = Device.isLandscape
      window.addEventListener('resize', Device.handleResize)
      window.addEventListener('orientationchange', Device.handleResize)
    }
    Device.listeners.add(listener)

    return () => {
      Device.listeners.delete(listener)
      if (Device.listeners.size === 0) {
        window.removeEventListener('resize', Device.handleResize)
        window.removeEventListener('orientationchange', Device.handleResize)
      }
    }
  }

  protected static handleResize = (): void => {
    const isLandscape = Device.isLandscape
    if (isLandscape === Device.lastIsLandscape) {
      return
    }
    Device.lastIsLandscape = isLandscape
    Device.listeners.forEach((listener) => listener(isLandscape))
  }

  // ---- Performance -------------------------------------------------------

  /** Logical CPU cores, 4 when unknown. */
  static get cpuCores(): number {
    return typeof navigator === 'undefined' ? 4 : navigator.hardwareConcurrency || 4
  }

  /** Approximate RAM in GB (Chromium only, capped at 8 by the browser), undefined when unknown. */
  static get memory(): number | undefined {
    return typeof navigator === 'undefined' ? undefined : (navigator as NavigatorWithMemory).deviceMemory
  }

  /**
   * Performance tier, used by Game to decide which asset set to load.
   * Heuristic based on RAM and CPU cores; can be forced with `Device.setTier()`.
   */
  static get tier(): DeviceTier {
    if (Device.tierOverride) {
      return Device.tierOverride
    }

    const { memory, cpuCores } = Device
    if ((memory !== undefined && memory <= 4) || cpuCores <= 4) {
      return 'low'
    }
    return 'high'
  }

  /** Forces the tier (e.g. from a URL param, config or runtime FPS detection). Pass undefined to reset. */
  static setTier(tier: DeviceTier | undefined): void {
    Device.tierOverride = tier
  }

  static get isLowEnd(): boolean {
    return Device.tier === 'low'
  }
}
