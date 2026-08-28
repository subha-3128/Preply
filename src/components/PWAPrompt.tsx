import { ArrowsClockwise, CloudSlash, DownloadSimple, ShareNetwork, X } from '@phosphor-icons/react'
import { usePWA } from '../hooks/usePWA'

export default function PWAPrompt() {
  const {
    needRefresh,
    setNeedRefresh,
    updateServiceWorker,
    isOffline,
    showIOSPrompt,
    setShowIOSPrompt,
  } = usePWA()

  return (
    <>
      {/* Offline Status Toast */}
      {isOffline && (
        <aside
          aria-label="Offline Mode Notification"
          className="fixed bottom-4 left-4 z-50 flex items-center gap-2 px-3.5 py-2 bg-zinc-900/90 text-white rounded-lg text-xs font-body backdrop-blur-md border border-zinc-800 shadow-elevated animate-fade-in"
        >
          <CloudSlash size={15} className="text-amber-400" />
          <span>Offline mode active. Cached data is ready.</span>
        </aside>
      )}

      {/* New Version Ready Toast */}
      {needRefresh && (
        <aside
          aria-label="Update Available Notification"
          className="fixed bottom-4 right-4 z-50 flex items-center gap-3 p-3.5 bg-card rounded-xl border border-border shadow-elevated animate-fade-in max-w-xs"
        >
          <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0">
            <ArrowsClockwise size={16} className="text-primary animate-spin" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-heading font-semibold text-foreground">Update Available</h4>
            <p className="text-[11px] text-muted-foreground font-body">A newer version of Preply is ready.</p>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => updateServiceWorker(true)}
              className="clay-btn-primary text-xs px-2.5 py-1"
            >
              Update
            </button>
            <button
              onClick={() => setNeedRefresh(false)}
              className="p-1 text-muted-foreground hover:text-foreground rounded-md transition-colors"
              aria-label="Dismiss"
            >
              <X size={14} />
            </button>
          </div>
        </aside>
      )}

      {/* iOS Installation Instructions Modal */}
      {showIOSPrompt && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="clay-card p-5 max-w-sm w-full rounded-xl space-y-4 shadow-elevated animate-scale-in bg-card">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <DownloadSimple size={18} className="text-primary" />
                <h3 className="font-heading font-semibold text-sm text-foreground">Install on iOS</h3>
              </div>
              <button
                onClick={() => setShowIOSPrompt(false)}
                className="p-1 text-muted-foreground hover:text-foreground rounded-md"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-2.5 bg-muted/40 p-3.5 rounded-lg text-xs font-body text-foreground">
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-zinc-200 dark:bg-zinc-700 text-foreground font-heading font-bold text-[10px] flex items-center justify-center flex-shrink-0">
                  1
                </span>
                <div className="flex items-center gap-1 flex-wrap">
                  <span>Tap</span>
                  <span className="inline-flex items-center gap-0.5 font-medium bg-card px-1.5 py-0.5 rounded border border-border">
                    <ShareNetwork size={12} /> Share
                  </span>
                  <span>in Safari toolbar</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-zinc-200 dark:bg-zinc-700 text-foreground font-heading font-bold text-[10px] flex items-center justify-center flex-shrink-0">
                  2
                </span>
                <span>Select <strong>"Add to Home Screen"</strong></span>
              </div>

              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-zinc-200 dark:bg-zinc-700 text-foreground font-heading font-bold text-[10px] flex items-center justify-center flex-shrink-0">
                  3
                </span>
                <span>Tap <strong>"Add"</strong> in the top right</span>
              </div>
            </div>

            <button
              onClick={() => setShowIOSPrompt(false)}
              className="clay-btn-primary w-full text-xs py-2"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  )
}
