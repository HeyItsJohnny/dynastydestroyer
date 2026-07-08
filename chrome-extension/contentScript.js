(function () {
  const EXTENSION_NAME = "Dynasty Destroyer Yahoo Sync";

  console.log(`${EXTENSION_NAME} loaded on Yahoo Fantasy Football page`, {
    url: window.location.href,
  });

  let mutationCount = 0;
  let logTimer = null;

  const flushMutationLog = () => {
    if (!mutationCount) return;

    console.log(`${EXTENSION_NAME} observed Yahoo page changes`, {
      mutationCount,
      url: window.location.href,
    });

    mutationCount = 0;
    logTimer = null;
  };

  const observer = new MutationObserver((mutations) => {
    mutationCount += mutations.length;

    if (!logTimer) {
      logTimer = window.setTimeout(flushMutationLog, 1000);
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    characterData: true,
  });

  window.addEventListener("beforeunload", () => {
    observer.disconnect();
    if (logTimer) {
      window.clearTimeout(logTimer);
    }
  });
})();
