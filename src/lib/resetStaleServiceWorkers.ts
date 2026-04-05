const SW_RESET_KEY = "skyvoyai-sw-reset";

export const resetStaleServiceWorkers = async () => {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return;
  }

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    if (!registrations.length) {
      sessionStorage.removeItem(SW_RESET_KEY);
      return;
    }

    const hadController = Boolean(navigator.serviceWorker.controller);

    await Promise.all(
      registrations.map((registration) => registration.unregister()),
    );

    if ("caches" in window) {
      const cacheKeys = await caches.keys();
      await Promise.all(cacheKeys.map((cacheKey) => caches.delete(cacheKey)));
    }

    const alreadyReloaded = sessionStorage.getItem(SW_RESET_KEY) === "1";

    if (hadController && !alreadyReloaded) {
      sessionStorage.setItem(SW_RESET_KEY, "1");
      window.location.reload();
      return;
    }

    sessionStorage.removeItem(SW_RESET_KEY);
  } catch (error) {
    console.warn("Failed to reset stale service workers", error);
  }
};
