import { useState, useEffect, useCallback } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

function getIsStandalone(): boolean {
  if (typeof window === 'undefined') return false
  return Boolean(
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
    document.referrer.includes('android-app://')
  )
}

function getIsIOS(): boolean {
  if (typeof window === 'undefined') return false
  const userAgent = window.navigator.userAgent.toLowerCase()
  return /iphone|ipad|ipod/.test(userAgent)
}

export function usePWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isStandalone, setIsStandalone] = useState<boolean>(getIsStandalone)
  const [isOffline, setIsOffline] = useState<boolean>(() => (typeof navigator !== 'undefined' ? !navigator.onLine : false))
  const [isIOS] = useState<boolean>(getIsIOS)
  const [showIOSPrompt, setShowIOSPrompt] = useState(false)

  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      if (r) {
        // Auto check updates periodically
        setInterval(() => {
          r.update()
        }, 60 * 60 * 1000) // check every 1 hour
      }
    },
    onRegisterError(error) {
      console.error('SW registration error', error)
    },
  })

  useEffect(() => {
    const mediaQuery = window.matchMedia('(display-mode: standalone)')
    const handleMediaChange = () => setIsStandalone(getIsStandalone())
    mediaQuery.addEventListener('change', handleMediaChange)

    // Online / Offline listeners
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Before install prompt listener (Android, Chrome, Edge, Chromium)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    // App installed event
    const handleAppInstalled = () => {
      setDeferredPrompt(null)
      setIsStandalone(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      mediaQuery.removeEventListener('change', handleMediaChange)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const installPWA = useCallback(async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setDeferredPrompt(null)
      }
    } else if (isIOS && !isStandalone) {
      setShowIOSPrompt(true)
    }
  }, [deferredPrompt, isIOS, isStandalone])

  const canInstall = (!isStandalone && Boolean(deferredPrompt)) || (!isStandalone && isIOS)

  return {
    canInstall,
    isStandalone,
    isOffline,
    isIOS,
    showIOSPrompt,
    setShowIOSPrompt,
    offlineReady,
    setOfflineReady,
    needRefresh,
    setNeedRefresh,
    updateServiceWorker,
    installPWA,
  }
}
