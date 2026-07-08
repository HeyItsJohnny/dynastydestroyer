const DEFAULT_SETTINGS = {
  apiUrl: "http://localhost:3001",
  mockDraftId: "",
  syncEnabled: false,
};

const apiUrlInput = document.getElementById("apiUrl");
const mockDraftIdInput = document.getElementById("mockDraftId");
const syncEnabledInput = document.getElementById("syncEnabled");
const saveButton = document.getElementById("saveButton");
const status = document.getElementById("status");

const setStatus = (message) => {
  status.textContent = message;
  window.setTimeout(() => {
    if (status.textContent === message) {
      status.textContent = "";
    }
  }, 1800);
};

chrome.storage.sync.get(DEFAULT_SETTINGS, (settings) => {
  apiUrlInput.value = settings.apiUrl || DEFAULT_SETTINGS.apiUrl;
  mockDraftIdInput.value = settings.mockDraftId || "";
  syncEnabledInput.checked = Boolean(settings.syncEnabled);
});

saveButton.addEventListener("click", () => {
  const settings = {
    apiUrl: apiUrlInput.value.trim() || DEFAULT_SETTINGS.apiUrl,
    mockDraftId: mockDraftIdInput.value.trim(),
    syncEnabled: syncEnabledInput.checked,
  };

  chrome.storage.sync.set(settings, () => {
    setStatus("Saved");
  });
});
