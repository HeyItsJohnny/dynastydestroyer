(function () {
  const EXTENSION_NAME = "Dynasty Destroyer Yahoo Sync";
  const DEFAULT_SETTINGS = {
    apiUrl: "http://localhost:3001",
    mockDraftId: "",
    syncEnabled: false,
  };
  const EVENT_SOURCE = "yahoo_draft_room_extension";
  const AUCTION_DEBOUNCE_MS = 750;
  const POSITION_PATTERN = "\\b(QB|RB|WR|TE|K|DEF|DST|D/ST)\\b";
  const NAME_PATTERN = "([A-Z][A-Za-z.'-]+(?:\\s+(?:[A-Z][A-Za-z.'-]+|[A-Z][a-z]+\\.?)){1,4})";
  const IGNORED_NAME_PARTS = [
    "Yahoo Fantasy",
    "Fantasy Football",
    "Dynasty Destroyer",
    "Current Bid",
    "High Bid",
    "Time Left",
    "Draft Room",
    "Auction Draft",
  ];

  let currentSettings = { ...DEFAULT_SETTINGS };
  let lastAuctionEventKey = "";
  const recentSoldEventKeys = new Set();
  let auctionDetectionTimer = null;

  console.log(`${EXTENSION_NAME} loaded on Yahoo Fantasy Football page`, {
    url: window.location.href,
  });

  const buildEventUrl = (apiUrl, mockDraftId) => {
    const trimmedApiUrl = apiUrl.replace(/\/+$/, "");
    const encodedMockDraftId = encodeURIComponent(mockDraftId);

    return `${trimmedApiUrl}/api/mockDrafts/${encodedMockDraftId}/live-draft-room-event`;
  };

  const hasRequiredSettings = (settings) => {
    if (!settings.syncEnabled) {
      return false;
    }

    if (!settings.apiUrl || !settings.mockDraftId) {
      console.warn(`${EXTENSION_NAME} sync is enabled but missing API URL or Mock Draft ID`, {
        hasApiUrl: Boolean(settings.apiUrl),
        hasMockDraftId: Boolean(settings.mockDraftId),
      });
      return false;
    }

    return true;
  };

  const sendEvent = async (event, settings = currentSettings) => {
    if (!hasRequiredSettings(settings)) {
      return null;
    }

    try {
      const response = await fetch(buildEventUrl(settings.apiUrl, settings.mockDraftId), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          source: EVENT_SOURCE,
          observedAt: new Date().toISOString(),
          ...event,
        }),
      });

      if (!response.ok) {
        throw new Error(`Local API responded with ${response.status}`);
      }

      const result = await response.json();

      console.log(`${EXTENSION_NAME} event sent`, {
        mockDraftId: settings.mockDraftId,
        type: event.type,
        result,
      });

      return result;
    } catch (error) {
      console.error(`${EXTENSION_NAME} event failed`, {
        type: event.type,
        error,
      });
      return null;
    }
  };

  const sendExtensionPing = async (settings) => {
    const result = await sendEvent(
      {
        type: "extension_ping",
        rawText: "Extension connected",
      },
      settings
    );

    if (result) {
      console.log(`${EXTENSION_NAME} extension ping sent`, {
        mockDraftId: settings.mockDraftId,
        result,
      });
    }
  };

  const normalizeText = (value) => `${value || ""}`.replace(/\s+/g, " ").trim();

  const isLikelyPlayerName = (value) => {
    const normalized = normalizeText(value);

    if (!normalized || normalized.length < 4 || normalized.length > 60) {
      return false;
    }

    if (IGNORED_NAME_PARTS.some((ignored) => normalized.includes(ignored))) {
      return false;
    }

    return /^[A-Z][A-Za-z.'-]+(?:\s+(?:[A-Z][A-Za-z.'-]+|[A-Z][a-z]+\.?)){1,4}$/.test(
      normalized
    );
  };

  const parseCurrency = (text) => {
    const patterns = [
      /(?:current\s+bid|high\s+bid|winning\s+bid|bid)\s*:?\s*\$?\s*(\d{1,4})/i,
      /\$\s*(\d{1,4})\s*(?:current\s+bid|high\s+bid|bid)?/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return Number(match[1]);
      }
    }

    return null;
  };

  const parseCountdown = (text) => {
    const patterns = [
      /(?:time\s+left|countdown|remaining)\s*:?\s*((?:\d{1,2}:)?\d{1,2}:\d{2}|\d{1,2}:\d{2}|\d{1,3}\s*(?:s|sec|secs|seconds))/i,
      /\b((?:\d{1,2}:)?\d{1,2}:\d{2})\b/,
      /\b(\d{1,3})\s*(?:s|sec|secs|seconds)\b/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return normalizeText(match[1]);
      }
    }

    return null;
  };

  const parseNominatedByTeamName = (text) => {
    const patterns = [
      /(?:nominated\s+by|nom\.?\s+by|nominating\s+team)\s*:?\s*([^\n|•]{2,60})/i,
      /(?:by)\s+([A-Z][^\n|•]{2,60})\s+(?:for|at)\s+\$?\d{1,4}/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return normalizeText(match[1]).replace(/\s+\$?\d{1,4}.*$/, "");
      }
    }

    return null;
  };

  const parseSoldPrice = (text) => {
    const patterns = [
      /(?:sold|won|drafted|purchased|acquired)[^\n$]{0,80}\$\s*(\d{1,4})/i,
      /\$\s*(\d{1,4})[^\n]{0,80}(?:sold|won|drafted|purchased|acquired)/i,
      /(?:for|at)\s+\$?\s*(\d{1,4})/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return Number(match[1]);
      }
    }

    return null;
  };

  const parseWinningTeamName = (text) => {
    const patterns = [
      /(?:sold|won|drafted|purchased|acquired)\s+(?:to|by)\s+([^\n$|•]{2,80})/i,
      /(?:to|by)\s+([^\n$|•]{2,80})\s+(?:for|at)\s+\$?\d{1,4}/i,
      /([^\n$|•]{2,80})\s+(?:won|drafted|purchased|acquired)\s+/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return normalizeText(match[1])
          .replace(/\s+(?:for|at)\s+\$?\d{1,4}.*$/i, "")
          .replace(/\s+(?:with|on)\s+.*$/i, "");
      }
    }

    return null;
  };

  const getAuctionTextWindow = (lines) => {
    const auctionLineIndex = lines.findIndex((line) =>
      /(current\s+bid|high\s+bid|time\s+left|nominated|nom\.?\s+by|auction)/i.test(line)
    );

    if (auctionLineIndex === -1) {
      return lines.slice(0, 80).join("\n");
    }

    return lines
      .slice(Math.max(0, auctionLineIndex - 12), Math.min(lines.length, auctionLineIndex + 20))
      .join("\n");
  };

  const getDraftLogTextWindows = (lines) => {
    const windows = [];

    lines.forEach((line, index) => {
      if (!/(sold|won|drafted|purchased|acquired|winning\s+bid)/i.test(line)) {
        return;
      }

      const windowText = lines
        .slice(Math.max(0, index - 3), Math.min(lines.length, index + 4))
        .join("\n");

      if (!/\$\s*\d{1,4}|\bfor\s+\d{1,4}\b|\bat\s+\d{1,4}\b/i.test(windowText)) {
        return;
      }

      windows.push(windowText);
    });

    return windows;
  };

  const parsePlayerDetails = (textWindow, lines) => {
    const positionRegex = new RegExp(POSITION_PATTERN, "i");
    const nameWithPositionRegex = new RegExp(`${NAME_PATTERN}\\s+${POSITION_PATTERN}`, "i");
    const explicitPlayerRegex = new RegExp(
      `(?:player|nominee|nominated\\s+player)\\s*:?\\s*${NAME_PATTERN}`,
      "i"
    );

    const explicitMatch = textWindow.match(explicitPlayerRegex);
    if (explicitMatch && isLikelyPlayerName(explicitMatch[1])) {
      return {
        playerName: normalizeText(explicitMatch[1]),
        playerPosition: textWindow.match(positionRegex)?.[1] || null,
      };
    }

    const nameWithPositionMatch = textWindow.match(nameWithPositionRegex);
    if (nameWithPositionMatch && isLikelyPlayerName(nameWithPositionMatch[1])) {
      return {
        playerName: normalizeText(nameWithPositionMatch[1]),
        playerPosition: normalizeText(nameWithPositionMatch[2]).replace("D/ST", "DST"),
      };
    }

    for (let index = 0; index < lines.length; index += 1) {
      const line = lines[index];
      const positionMatch = line.match(positionRegex);

      if (!positionMatch) {
        continue;
      }

      const lineNameMatch = line.match(new RegExp(NAME_PATTERN));
      if (lineNameMatch && isLikelyPlayerName(lineNameMatch[1])) {
        return {
          playerName: normalizeText(lineNameMatch[1]),
          playerPosition: normalizeText(positionMatch[1]).replace("D/ST", "DST"),
        };
      }

      const previousLine = lines[index - 1];
      if (isLikelyPlayerName(previousLine)) {
        return {
          playerName: normalizeText(previousLine),
          playerPosition: normalizeText(positionMatch[1]).replace("D/ST", "DST"),
        };
      }
    }

    return {
      playerName: null,
      playerPosition: null,
    };
  };

  const detectCurrentAuctionState = () => {
    const rawText = document.body?.innerText || "";
    const lines = rawText
      .split("\n")
      .map(normalizeText)
      .filter(Boolean);
    const textWindow = getAuctionTextWindow(lines);
    const textForParsing = `${textWindow}\n${rawText}`;
    const { playerName, playerPosition } = parsePlayerDetails(textWindow, lines);

    return {
      playerName,
      playerPosition,
      currentBid: parseCurrency(textForParsing),
      nominatedByTeamName: parseNominatedByTeamName(textForParsing),
      countdown: parseCountdown(textForParsing),
      rawText: normalizeText(textWindow || rawText).slice(0, 4000),
    };
  };

  const detectSoldPlayerEvents = () => {
    const rawText = document.body?.innerText || "";
    const lines = rawText
      .split("\n")
      .map(normalizeText)
      .filter(Boolean);
    const soldTextWindows = getDraftLogTextWindows(lines);

    return soldTextWindows
      .map((textWindow) => {
        const { playerName, playerPosition } = parsePlayerDetails(textWindow, textWindow.split("\n"));
        const finalPrice = parseSoldPrice(textWindow);
        const winningTeamName = parseWinningTeamName(textWindow);

        return {
          playerName,
          playerPosition,
          winningTeamName,
          finalPrice,
          rawText: normalizeText(textWindow).slice(0, 4000),
        };
      })
      .filter(
        (soldEvent) =>
          soldEvent.playerName && soldEvent.winningTeamName && soldEvent.finalPrice !== null
      );
  };

  const isConfidentAuctionState = (auctionState) =>
    Boolean(
      auctionState &&
        auctionState.playerName &&
        (auctionState.currentBid !== null || auctionState.countdown)
    );

  const getAuctionEventKey = (auctionState) =>
    [auctionState.playerName, auctionState.currentBid ?? "", auctionState.countdown || ""].join("|");

  const getSoldEventKey = (soldEvent) =>
    [soldEvent.playerName, soldEvent.winningTeamName, soldEvent.finalPrice].join("|");

  const sendCurrentAuctionUpdate = async () => {
    if (!hasRequiredSettings(currentSettings)) {
      return;
    }

    const auctionState = detectCurrentAuctionState();

    if (!isConfidentAuctionState(auctionState)) {
      return;
    }

    const nextAuctionEventKey = getAuctionEventKey(auctionState);
    if (nextAuctionEventKey === lastAuctionEventKey) {
      return;
    }

    lastAuctionEventKey = nextAuctionEventKey;

    await sendEvent({
      type: "current_auction_update",
      ...auctionState,
    });
  };

  const sendSoldPlayerEvents = async () => {
    if (!hasRequiredSettings(currentSettings)) {
      return;
    }

    const soldEvents = detectSoldPlayerEvents();

    for (const soldEvent of soldEvents) {
      const soldEventKey = getSoldEventKey(soldEvent);

      if (recentSoldEventKeys.has(soldEventKey)) {
        continue;
      }

      recentSoldEventKeys.add(soldEventKey);

      await sendEvent({
        type: "player_sold",
        ...soldEvent,
      });
    }
  };

  const scheduleAuctionDetection = () => {
    if (auctionDetectionTimer) {
      window.clearTimeout(auctionDetectionTimer);
    }

    auctionDetectionTimer = window.setTimeout(() => {
      auctionDetectionTimer = null;
      sendCurrentAuctionUpdate();
      sendSoldPlayerEvents();
    }, AUCTION_DEBOUNCE_MS);
  };

  chrome.storage.sync.get(DEFAULT_SETTINGS, (settings) => {
    currentSettings = {
      apiUrl: (settings.apiUrl || "").trim(),
      mockDraftId: (settings.mockDraftId || "").trim(),
      syncEnabled: Boolean(settings.syncEnabled),
    };

    sendExtensionPing(currentSettings);
    scheduleAuctionDetection();
  });

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "sync") {
      return;
    }

    currentSettings = {
      ...currentSettings,
      apiUrl:
        changes.apiUrl === undefined
          ? currentSettings.apiUrl
          : `${changes.apiUrl.newValue || ""}`.trim(),
      mockDraftId:
        changes.mockDraftId === undefined
          ? currentSettings.mockDraftId
          : `${changes.mockDraftId.newValue || ""}`.trim(),
      syncEnabled:
        changes.syncEnabled?.newValue === undefined
          ? currentSettings.syncEnabled
          : Boolean(changes.syncEnabled.newValue),
    };

    scheduleAuctionDetection();
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

    scheduleAuctionDetection();
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
    if (auctionDetectionTimer) {
      window.clearTimeout(auctionDetectionTimer);
    }
  });
})();
