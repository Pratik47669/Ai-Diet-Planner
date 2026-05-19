import { useState, useEffect } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PwaInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(
    localStorage.getItem('pwa-banner-dismissed') === 'true'
  );
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    window.addEventListener('appinstalled', () => {
      setIsInstallable(false);
      setInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  const handleDismissBanner = () => {
    setBannerDismissed(true);
    localStorage.setItem('pwa-banner-dismissed', 'true');
  };

  // If already installed or not installable, show nothing
  if (!isInstallable || installed) return null;

  return (
    <>
      {/* Full Banner (shown first time) */}
      <AnimatePresence>
        {!bannerDismissed && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-0 left-0 right-0 md:bottom-4 md:left-auto md:right-4 md:w-96 bg-white dark:bg-slate-800 p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.15)] md:rounded-2xl z-[100] border-t md:border border-slate-200 dark:border-slate-700"
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 rounded-xl shrink-0">
                <Smartphone className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-800 dark:text-slate-200">Install NutriPlan AI</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Add to your home screen for fast, offline access.
                </p>
              </div>
              <button
                onClick={handleDismissBanner}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleDismissBanner}
                className="flex-1 py-2 px-4 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition"
              >
                Not Now
              </button>
              <button
                onClick={handleInstallClick}
                className="flex-1 py-2 px-4 rounded-xl text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-600 shadow-md shadow-emerald-500/20 transition-all active:scale-95"
              >
                Install Free
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Persistent Floating Button (shown after banner is dismissed) */}
      <AnimatePresence>
        {bannerDismissed && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            onClick={handleInstallClick}
            title="Install NutriPlan AI App"
            className="fixed bottom-6 left-4 z-[99] flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-2xl shadow-lg shadow-emerald-500/30 transition-all hover:scale-105 active:scale-95"
          >
            <Download className="w-4 h-4" />
            Install App
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
};

export default PwaInstallPrompt;

