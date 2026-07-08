const cors = require("cors");
const dotenv = require("dotenv");
const express = require("express");
const admin = require("firebase-admin");

dotenv.config();

const PORT = Number(process.env.PORT || 3001);
const SERVICE_NAME = "dynasty-destroyer-local-api";
const DEFAULT_EVENT_SOURCE = "yahoo_draft_room_extension";
const HIGH_CONFIDENCE_THRESHOLD = 0.92;
const TEAM_HIGH_CONFIDENCE_THRESHOLD = 0.9;
const MOCK_DRAFT_COLLECTION = "mockdraft";

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.warn(
    "GOOGLE_APPLICATION_CREDENTIALS is not set. Firebase Admin will fail until a service account path is provided."
  );
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: process.env.FIREBASE_PROJECT_ID || undefined,
  });
}

const db = admin.firestore();
db.settings({ ignoreUndefinedProperties: true });
const app = express();

const normalizePosition = (value) => {
  const normalized = `${value || ""}`.trim().toUpperCase();
  if (normalized === "D/ST") return "DST";
  return normalized;
};

const normalizeName = (value) =>
  `${value || ""}`
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\b(jr|sr|ii|iii|iv|v)\b\.?/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const compactName = (value) => normalizeName(value).replace(/\s+/g, "");

const getPlayerDisplayName = (player) =>
  player.FullName || player.fullName || player.name || player.SearchFullName || "";

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const buildSafeDocId = (value) =>
  compactName(value)
    .slice(0, 120)
    .replace(/[^a-z0-9]/g, "") || `event_${Date.now()}`;

const getNowField = () => admin.firestore.FieldValue.serverTimestamp();

const getPlayerNameCandidates = (player) =>
  [
    player.FullName,
    player.fullName,
    player.name,
    player.SearchFullName,
    player.searchFullName,
    `${player.FirstName || ""} ${player.LastName || ""}`,
  ].filter(Boolean);

const getTokenOverlapScore = (detectedName, candidateName) => {
  const detectedTokens = normalizeName(detectedName).split(" ").filter(Boolean);
  const candidateTokens = normalizeName(candidateName).split(" ").filter(Boolean);

  if (!detectedTokens.length || !candidateTokens.length) {
    return 0;
  }

  const candidateTokenSet = new Set(candidateTokens);
  const matches = detectedTokens.filter((token) => candidateTokenSet.has(token)).length;

  return matches / Math.max(detectedTokens.length, candidateTokens.length);
};

const scoreNameMatch = (detectedName, candidateName) => {
  const detectedNormalized = normalizeName(detectedName);
  const candidateNormalized = normalizeName(candidateName);

  if (!detectedNormalized || !candidateNormalized) {
    return 0;
  }

  if (detectedNormalized === candidateNormalized) {
    return 0.97;
  }

  if (compactName(detectedName) === compactName(candidateName)) {
    return 0.95;
  }

  const detectedParts = detectedNormalized.split(" ");
  const candidateParts = candidateNormalized.split(" ");
  const detectedFirst = detectedParts[0];
  const detectedLast = detectedParts[detectedParts.length - 1];
  const candidateFirst = candidateParts[0];
  const candidateLast = candidateParts[candidateParts.length - 1];

  if (detectedFirst === candidateFirst && detectedLast === candidateLast) {
    return 0.93;
  }

  if (
    (detectedNormalized.includes(candidateNormalized) ||
      candidateNormalized.includes(detectedNormalized)) &&
    Math.abs(detectedNormalized.length - candidateNormalized.length) <= 8
  ) {
    return 0.86;
  }

  return Math.min(0.84, getTokenOverlapScore(detectedName, candidateName));
};

const scorePlayerMatch = ({ detectedName, detectedPosition, player, playerId }) => {
  const playerPosition = normalizePosition(player.Position || player.position);
  const normalizedDetectedPosition = normalizePosition(detectedPosition);
  const bestNameScore = getPlayerNameCandidates(player).reduce(
    (bestScore, candidateName) => Math.max(bestScore, scoreNameMatch(detectedName, candidateName)),
    0
  );

  let score = bestNameScore;
  if (normalizedDetectedPosition && playerPosition === normalizedDetectedPosition) {
    score += 0.03;
  } else if (normalizedDetectedPosition && playerPosition && playerPosition !== normalizedDetectedPosition) {
    score -= 0.08;
  }

  return {
    playerId,
    playerName: getPlayerDisplayName(player),
    playerPosition,
    playerData: player,
    score: Math.max(0, Math.min(1, score)),
  };
};

const serializeMatchCandidate = (candidate) => ({
  playerId: candidate.playerId,
  playerName: candidate.playerName,
  playerPosition: candidate.playerPosition,
  score: candidate.score,
});

const snapshotToPlayers = (snapshot) =>
  snapshot.docs.map((doc) => ({
    playerId: doc.id,
    player: doc.data(),
  }));

const fetchPlayerCandidates = async () => {
  const allPlayersSnapshot = await db.collection("players").get();
  return snapshotToPlayers(allPlayersSnapshot);
};

const matchLocalPlayer = async ({ playerName, playerPosition }) => {
  if (!playerName) {
    return {
      confidence: 0,
      isHighConfidence: false,
      matchedPlayer: null,
      candidates: [],
      reason: "Missing playerName",
    };
  }

  const candidates = await fetchPlayerCandidates();
  const scoredCandidates = candidates
    .map(({ playerId, player }) =>
      scorePlayerMatch({
        detectedName: playerName,
        detectedPosition: playerPosition,
        player,
        playerId,
      })
    )
    .filter((candidate) => candidate.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  const bestMatch = scoredCandidates[0] || null;
  const secondBestMatch = scoredCandidates[1] || null;
  const hasEnoughMargin =
    !secondBestMatch || bestMatch.score - secondBestMatch.score >= 0.03 || bestMatch.score >= 0.98;
  const isHighConfidence =
    Boolean(bestMatch) && bestMatch.score >= HIGH_CONFIDENCE_THRESHOLD && hasEnoughMargin;

  return {
    confidence: bestMatch?.score || 0,
    isHighConfidence,
    matchedPlayer: isHighConfidence ? bestMatch : null,
    candidates: scoredCandidates.map(serializeMatchCandidate),
    reason: isHighConfidence
      ? "High confidence normalized name match"
      : "Low confidence player match",
  };
};

const resolveMockDraftContext = async (mockDraftId) => {
  const syncSnapshot = await db
    .collectionGroup(MOCK_DRAFT_COLLECTION)
    .where("connectionToken", "==", mockDraftId)
    .limit(1)
    .get();

  const syncDoc = syncSnapshot.docs[0];
  const userProfileRef = syncDoc?.ref?.parent?.parent;

  if (!syncDoc || !userProfileRef) {
    return null;
  }

  return {
    uid: userProfileRef.id,
    userProfileRef,
    mockDraftRef: userProfileRef.collection(MOCK_DRAFT_COLLECTION),
    syncRef: syncDoc.ref,
  };
};

const buildAuctionPlayerPayload = (player, playerId) => ({
  Age: player.Age ?? "",
  College: player.College ?? "",
  DepthChartOrder: player.DepthChartOrder ?? "",
  DraftStatus: player.DraftStatus ?? "",
  FirstName: player.FirstName ?? "",
  FullName: player.FullName ?? player.fullName ?? player.name ?? "",
  InjuryNotes: player.InjuryNotes ?? "",
  InjuryStatus: player.InjuryStatus ?? "",
  DatabaseID: player.DatabaseID ?? player.id ?? playerId ?? "",
  KeepTradeCutIdentifier: player.KeepTradeCutIdentifier ?? "",
  LastName: player.LastName ?? "",
  NonSuperFlexValue: player.NonSuperFlexValue ?? 0,
  Position: player.Position ?? player.position ?? "",
  SleeperID: player.SleeperID ?? "",
  SearchFirstName: player.SearchFirstName ?? "",
  SearchFullName: player.SearchFullName ?? "",
  SearchLastName: player.SearchLastName ?? "",
  SearchRank: player.SearchRank ?? "",
  Status: player.Status ?? "",
  SuperFlexValue: player.SuperFlexValue ?? 0,
  Team: player.Team ?? "",
  YearsExperience: player.YearsExperience ?? player.yearsExp ?? player.yearsExperience ?? "",
  Fumbles: player.Fumbles ?? 0,
  PassingYards: player.PassingYards ?? 0,
  PassingTDs: player.PassingTDs ?? 0,
  PassingINT: player.PassingINT ?? 0,
  RushingYDS: player.RushingYDS ?? 0,
  RushingTDs: player.RushingTDs ?? 0,
  ReceivingRec: player.ReceivingRec ?? 0,
  ReceivingYDS: player.ReceivingYDS ?? 0,
  ReceivingTDs: player.ReceivingTDs ?? 0,
  ReceivingTargets: player.ReceivingTargets ?? 0,
  ReceptionPercentage: player.ReceptionPercentage ?? 0,
  RedzoneTargets: player.RedzoneTargets ?? 0,
  RedzoneTouches: player.RedzoneTouches ?? 0,
  PositionRank: player.PositionRank ?? "",
  Tier: player.Tier ?? player.tier ?? "",
  tier: player.tier ?? player.Tier ?? "",
  TotalPoints: player.TotalPoints ?? 0,
  headshotUrl: player.headshotUrl ?? player.media?.headshotUrl ?? "",
  media: {
    ...(player.media ?? {}),
    headshotUrl: player.headshotUrl ?? player.media?.headshotUrl ?? "",
  },
});

const getTeamNameCandidates = (team) =>
  [team.TeamName, team.teamName, team.name, team.OwnerName, team.ownerName].filter(Boolean);

const scoreTeamMatch = ({ detectedTeamName, team, teamId }) => {
  const bestNameScore = getTeamNameCandidates(team).reduce(
    (bestScore, candidateName) =>
      Math.max(bestScore, scoreNameMatch(detectedTeamName, candidateName)),
    0
  );

  return {
    teamId,
    teamName: team.TeamName || team.teamName || team.name || "",
    score: bestNameScore,
  };
};

const fetchMockDraftTeams = async (mockDraftRef) => {
  const snapshot = await mockDraftRef.get();

  return snapshot.docs
    .map((doc) => ({
      teamId: doc.id,
      team: doc.data(),
    }))
    .filter(({ team }) => team.TeamName || team.teamName || team.name);
};

const matchMockDraftTeam = async ({ mockDraftRef, winningTeamName }) => {
  if (!winningTeamName) {
    return {
      confidence: 0,
      isHighConfidence: false,
      matchedTeam: null,
      candidates: [],
      reason: "Missing winningTeamName",
    };
  }

  const teams = await fetchMockDraftTeams(mockDraftRef);
  const scoredTeams = teams
    .map(({ teamId, team }) =>
      scoreTeamMatch({
        detectedTeamName: winningTeamName,
        team,
        teamId,
      })
    )
    .filter((candidate) => candidate.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  const bestMatch = scoredTeams[0] || null;
  const secondBestMatch = scoredTeams[1] || null;
  const hasEnoughMargin =
    !secondBestMatch || bestMatch.score - secondBestMatch.score >= 0.03 || bestMatch.score >= 0.98;
  const isHighConfidence =
    Boolean(bestMatch) && bestMatch.score >= TEAM_HIGH_CONFIDENCE_THRESHOLD && hasEnoughMargin;

  return {
    confidence: bestMatch?.score || 0,
    isHighConfidence,
    matchedTeam: isHighConfidence ? bestMatch : null,
    candidates: scoredTeams,
    reason: isHighConfidence ? "High confidence team match" : "Low confidence team match",
  };
};

const createReviewQueueItem = async ({ mockDraftId, event, eventId, reason, details = {} }) => {
  const reviewRef = db
    .collection("mockDrafts")
    .doc(mockDraftId)
    .collection("extensionReviewQueue")
    .doc();

  await reviewRef.set({
    eventId,
    eventType: event.type,
    reason,
    details,
    detected: {
      playerName: event.playerName || null,
      playerPosition: normalizePosition(event.playerPosition) || null,
      winningTeamName: event.winningTeamName || null,
      finalPrice: event.finalPrice ?? null,
      currentBid: event.currentBid ?? null,
      nominatedByTeamName: event.nominatedByTeamName || null,
      countdown: event.countdown || null,
    },
    rawText: event.rawText || "",
    source: event.source || DEFAULT_EVENT_SOURCE,
    createdAt: getNowField(),
  });

  return reviewRef.id;
};

const processCurrentAuctionUpdate = async ({ mockDraftId, event, eventId }) => {
  const match = await matchLocalPlayer({
    playerName: event.playerName,
    playerPosition: event.playerPosition,
  });

  if (match.isHighConfidence) {
    await db
      .collection("mockDrafts")
      .doc(mockDraftId)
      .collection("auction")
      .doc("current")
      .set(
        {
          playerId: match.matchedPlayer.playerId,
          playerName: event.playerName,
          playerPosition: normalizePosition(event.playerPosition || match.matchedPlayer.playerPosition),
          currentBid: event.currentBid ?? null,
          nominatedByTeamName: event.nominatedByTeamName || null,
          countdown: event.countdown || null,
          source: event.source || DEFAULT_EVENT_SOURCE,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

    console.log("Updated current auction from extension event", {
      mockDraftId,
      eventId,
      playerId: match.matchedPlayer.playerId,
      confidence: match.confidence,
    });

    return {
      processed: true,
      action: "updated_current_auction",
      confidence: match.confidence,
      playerId: match.matchedPlayer.playerId,
    };
  }

  const reviewRef = db
    .collection("mockDrafts")
    .doc(mockDraftId)
    .collection("extensionReviewQueue")
    .doc();

  await reviewRef.set({
    eventId,
    eventType: event.type,
    reason: match.reason,
    confidence: match.confidence,
    candidates: match.candidates,
    detected: {
      playerName: event.playerName || null,
      playerPosition: normalizePosition(event.playerPosition) || null,
      currentBid: event.currentBid ?? null,
      nominatedByTeamName: event.nominatedByTeamName || null,
      countdown: event.countdown || null,
    },
    rawText: event.rawText || "",
    source: event.source || DEFAULT_EVENT_SOURCE,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  console.log("Queued extension event for review", {
    mockDraftId,
    eventId,
    reviewItemId: reviewRef.id,
    confidence: match.confidence,
  });

  return {
    processed: true,
    action: "queued_for_review",
    confidence: match.confidence,
    reviewItemId: reviewRef.id,
  };
};

const getSoldEventKey = ({ playerName, winningTeamName, finalPrice }) =>
  [normalizeName(playerName), normalizeName(winningTeamName), toNumber(finalPrice)].join("|");

const getProcessedSoldEventRef = (mockDraftId, soldEventKey) =>
  db
    .collection("mockDrafts")
    .doc(mockDraftId)
    .collection("processedSoldEvents")
    .doc(buildSafeDocId(soldEventKey));

const findExistingMockAssignment = async ({ mockDraftRef, teams, playerId }) => {
  for (const { teamId, team } of teams) {
    const rosterRef = mockDraftRef.doc(teamId).collection("players").doc(playerId);
    const rosterSnap = await rosterRef.get();

    if (rosterSnap.exists) {
      return {
        rosterRef,
        teamId,
        teamName: team.TeamName || team.teamName || team.name || "",
        data: rosterSnap.data(),
      };
    }
  }

  return null;
};

const isSameAssignment = ({ existingAssignment, teamId, finalPrice }) =>
  existingAssignment.teamId === teamId &&
  toNumber(existingAssignment.data?.DraftAmount) === toNumber(finalPrice);

const recalculateTeamNeeds = async ({ mockDraftId, mockDraftRef, teams }) => {
  const batch = db.batch();

  for (const { teamId, team } of teams) {
    const rosterSnapshot = await mockDraftRef.doc(teamId).collection("players").get();
    const positionCounts = {};
    let totalSpent = 0;

    rosterSnapshot.docs.forEach((playerDoc) => {
      const player = playerDoc.data();
      const position = normalizePosition(player.Position) || "UNKNOWN";
      positionCounts[position] = (positionCounts[position] || 0) + 1;
      totalSpent += toNumber(player.DraftAmount);
    });

    const startingBudget = toNumber(team.StartingTeamAmount, toNumber(team.OriginalTeamAmount, team.TeamAmount));
    const remainingBudget = toNumber(team.TeamAmount, startingBudget - totalSpent);

    batch.set(
      db.collection("mockDrafts").doc(mockDraftId).collection("teamNeeds").doc(teamId),
      {
        teamId,
        teamName: team.TeamName || team.teamName || team.name || "",
        positionCounts,
        rosterCount: rosterSnapshot.size,
        totalSpent,
        startingBudget,
        remainingBudget,
        updatedAt: getNowField(),
      },
      { merge: true }
    );
  }

  await batch.commit();
};

const recalculateMarketInflation = async ({ mockDraftId, mockDraftRef, teams }) => {
  let totalSpent = 0;
  let totalStartingBudget = 0;
  let totalRemainingBudget = 0;
  let draftedCount = 0;

  for (const { teamId, team } of teams) {
    const rosterSnapshot = await mockDraftRef.doc(teamId).collection("players").get();
    draftedCount += rosterSnapshot.size;

    rosterSnapshot.docs.forEach((playerDoc) => {
      totalSpent += toNumber(playerDoc.data().DraftAmount);
    });

    const startingBudget = toNumber(team.StartingTeamAmount, toNumber(team.OriginalTeamAmount, team.TeamAmount));
    totalStartingBudget += startingBudget;
    totalRemainingBudget += toNumber(team.TeamAmount, startingBudget);
  }

  await db.collection("mockDrafts").doc(mockDraftId).collection("market").doc("inflation").set(
    {
      draftedCount,
      totalSpent,
      totalStartingBudget,
      totalRemainingBudget,
      inflationRate:
        totalRemainingBudget > 0 ? Number((totalSpent / totalRemainingBudget).toFixed(4)) : 0,
      updatedAt: getNowField(),
    },
    { merge: true }
  );
};

const requestAiRefreshOnce = async ({ mockDraftId, soldEventKey, eventId }) => {
  const refreshRef = db
    .collection("mockDrafts")
    .doc(mockDraftId)
    .collection("aiRefreshRequests")
    .doc(buildSafeDocId(soldEventKey));

  const refreshSnap = await refreshRef.get();
  if (refreshSnap.exists) {
    return false;
  }

  await refreshRef.set({
    eventId,
    status: "pending",
    reason: "completed_sale_event",
    requestedAt: getNowField(),
  });

  return true;
};

const processPlayerSold = async ({ mockDraftId, event, eventId }) => {
  const finalPrice = Number(event.finalPrice);
  if (!Number.isFinite(finalPrice)) {
    const reviewItemId = await createReviewQueueItem({
      mockDraftId,
      event,
      eventId,
      reason: "Invalid finalPrice for player_sold event",
    });

    return {
      processed: true,
      action: "queued_for_review",
      reviewItemId,
    };
  }

  const context = await resolveMockDraftContext(mockDraftId);
  if (!context) {
    const reviewItemId = await createReviewQueueItem({
      mockDraftId,
      event,
      eventId,
      reason: "Unable to resolve mock draft connection token to user mock draft",
    });

    return {
      processed: true,
      action: "queued_for_review",
      reviewItemId,
    };
  }

  const [playerMatch, teamMatch] = await Promise.all([
    matchLocalPlayer({
      playerName: event.playerName,
      playerPosition: event.playerPosition,
    }),
    matchMockDraftTeam({
      mockDraftRef: context.mockDraftRef,
      winningTeamName: event.winningTeamName,
    }),
  ]);

  if (!playerMatch.isHighConfidence || !teamMatch.isHighConfidence) {
    const reviewItemId = await createReviewQueueItem({
      mockDraftId,
      event,
      eventId,
      reason: "Low confidence player or team match",
      details: {
        playerMatch: {
          confidence: playerMatch.confidence,
          candidates: playerMatch.candidates,
          reason: playerMatch.reason,
        },
        teamMatch: {
          confidence: teamMatch.confidence,
          candidates: teamMatch.candidates,
          reason: teamMatch.reason,
        },
      },
    });

    return {
      processed: true,
      action: "queued_for_review",
      reviewItemId,
      playerConfidence: playerMatch.confidence,
      teamConfidence: teamMatch.confidence,
    };
  }

  const soldEventKey = getSoldEventKey({
    playerName: playerMatch.matchedPlayer.playerName,
    winningTeamName: teamMatch.matchedTeam.teamName,
    finalPrice,
  });
  const processedRef = getProcessedSoldEventRef(mockDraftId, soldEventKey);
  const teams = await fetchMockDraftTeams(context.mockDraftRef);
  const existingAssignment = await findExistingMockAssignment({
    mockDraftRef: context.mockDraftRef,
    teams,
    playerId: playerMatch.matchedPlayer.playerId,
  });

  const processedSnap = await processedRef.get();
  if (processedSnap.exists) {
    return {
      processed: true,
      action: "duplicate_ignored",
      playerId: playerMatch.matchedPlayer.playerId,
      teamId: teamMatch.matchedTeam.teamId,
    };
  }

  if (existingAssignment) {
    if (
      isSameAssignment({
        existingAssignment,
        teamId: teamMatch.matchedTeam.teamId,
        finalPrice,
      })
    ) {
      await Promise.all([
        existingAssignment.rosterRef.set(
          {
            extensionConfirmed: true,
            extensionConfirmedAt: getNowField(),
            extensionEventId: eventId,
            extensionSource: event.source || DEFAULT_EVENT_SOURCE,
          },
          { merge: true }
        ),
        processedRef.set({
          eventId,
          soldEventKey,
          action: "manual_assignment_confirmed",
          playerId: playerMatch.matchedPlayer.playerId,
          teamId: teamMatch.matchedTeam.teamId,
          finalPrice,
          createdAt: getNowField(),
        }),
      ]);

      return {
        processed: true,
        action: "manual_assignment_confirmed",
        playerId: playerMatch.matchedPlayer.playerId,
        teamId: teamMatch.matchedTeam.teamId,
      };
    }

    const reviewItemId = await createReviewQueueItem({
      mockDraftId,
      event,
      eventId,
      reason: "Extension sale conflicts with existing manual assignment",
      details: {
        existingAssignment: {
          teamId: existingAssignment.teamId,
          teamName: existingAssignment.teamName,
          draftAmount: toNumber(existingAssignment.data?.DraftAmount),
        },
        extensionAssignment: {
          teamId: teamMatch.matchedTeam.teamId,
          teamName: teamMatch.matchedTeam.teamName,
          finalPrice,
        },
      },
    });

    return {
      processed: true,
      action: "conflict_queued_for_review",
      reviewItemId,
    };
  }

  const playerId = playerMatch.matchedPlayer.playerId;
  const teamId = teamMatch.matchedTeam.teamId;
  const teamName = teamMatch.matchedTeam.teamName;
  const playerData = playerMatch.matchedPlayer.playerData;
  const rosterRef = context.mockDraftRef.doc(teamId).collection("players").doc(playerId);
  const teamRef = context.mockDraftRef.doc(teamId);
  const targetedPlayerRef = context.userProfileRef.collection("targetedPlayers").doc(playerId);
  const currentAuctionRef = context.mockDraftRef.doc("currentauction");
  const draftEventRef = db
    .collection("mockDrafts")
    .doc(mockDraftId)
    .collection("draftEvents")
    .doc(buildSafeDocId(soldEventKey));
  const logRef = db.collection("mockDrafts").doc(mockDraftId).collection("draftLog").doc();

  await db.runTransaction(async (transaction) => {
    const duplicateSnap = await transaction.get(processedRef);
    if (duplicateSnap.exists) {
      return;
    }
    const teamSnap = await transaction.get(teamRef);
    const teamData = teamSnap.exists ? teamSnap.data() : {};
    const teamBudgetPatch = {
      TeamAmount: admin.firestore.FieldValue.increment(-finalPrice),
      LastExtensionSaleEventId: eventId,
      UpdatedAt: getNowField(),
    };

    if (teamData.StartingTeamAmount === undefined && teamData.OriginalTeamAmount === undefined) {
      teamBudgetPatch.StartingTeamAmount = toNumber(teamData.TeamAmount);
    }

    transaction.set(processedRef, {
      eventId,
      soldEventKey,
      action: "player_sold_processed",
      playerId,
      teamId,
      finalPrice,
      createdAt: getNowField(),
    });

    transaction.set(
      rosterRef,
      {
        ...buildAuctionPlayerPayload(playerData, playerId),
        DraftAmount: finalPrice,
        DraftedTeamId: teamId,
        DraftedTeamName: teamName,
        DraftedAt: getNowField(),
        DraftedByExtension: true,
        extensionEventId: eventId,
        extensionConfirmed: true,
        extensionConfirmedAt: getNowField(),
      },
      { merge: true }
    );

    transaction.set(
      targetedPlayerRef,
      {
        mockdraft: teamName,
        mockDraft: teamName,
        mockDraftTeam: teamName,
        mockDraftTeamId: teamId,
        mockDraftTeamNumber: teamId,
        mockDraftAmount: finalPrice,
        mockPurchasePrice: finalPrice,
        mockDraftedAt: getNowField(),
        updatedAt: getNowField(),
      },
      { merge: true }
    );

    transaction.set(
      teamRef,
      teamBudgetPatch,
      { merge: true }
    );

    transaction.set(
      draftEventRef,
      {
        type: "player_sold",
        eventId,
        playerId,
        playerName: playerMatch.matchedPlayer.playerName,
        playerPosition: normalizePosition(event.playerPosition || playerMatch.matchedPlayer.playerPosition),
        teamId,
        teamName,
        finalPrice,
        source: event.source || DEFAULT_EVENT_SOURCE,
        createdAt: getNowField(),
      },
      { merge: true }
    );

    transaction.set(logRef, {
      type: "player_sold",
      message: `${playerMatch.matchedPlayer.playerName} sold to ${teamName} for $${finalPrice}`,
      eventId,
      playerId,
      playerName: playerMatch.matchedPlayer.playerName,
      teamId,
      teamName,
      finalPrice,
      source: event.source || DEFAULT_EVENT_SOURCE,
      createdAt: getNowField(),
    });

    transaction.delete(currentAuctionRef);
  });

  const refreshedTeams = await fetchMockDraftTeams(context.mockDraftRef);
  await Promise.all([
    recalculateTeamNeeds({
      mockDraftId,
      mockDraftRef: context.mockDraftRef,
      teams: refreshedTeams,
    }),
    recalculateMarketInflation({
      mockDraftId,
      mockDraftRef: context.mockDraftRef,
      teams: refreshedTeams,
    }),
    requestAiRefreshOnce({
      mockDraftId,
      soldEventKey,
      eventId,
    }),
    context.syncRef.set(
      {
        lastSoldPlayer: playerMatch.matchedPlayer.playerName,
        lastSoldPlayerName: playerMatch.matchedPlayer.playerName,
        extensionLastEventAt: getNowField(),
        extensionStatus: "connected",
        updatedAt: getNowField(),
      },
      { merge: true }
    ),
  ]);

  console.log("Processed player_sold extension event", {
    mockDraftId,
    eventId,
    playerId,
    teamId,
    finalPrice,
  });

  return {
    processed: true,
    action: "player_sold_processed",
    playerId,
    teamId,
    finalPrice,
  };
};

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: SERVICE_NAME,
  });
});

app.post("/api/mockDrafts/:mockDraftId/live-draft-room-event", async (req, res, next) => {
  try {
    const { mockDraftId } = req.params;
    const eventBody = req.body || {};

    if (!eventBody.type) {
      return res.status(400).json({
        ok: false,
        error: "Missing required field: type",
      });
    }

    const eventRef = db
      .collection("mockDrafts")
      .doc(mockDraftId)
      .collection("extensionEvents")
      .doc();

    const event = {
      ...eventBody,
      source: eventBody.source || DEFAULT_EVENT_SOURCE,
      receivedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    console.log("Received extension event", {
      mockDraftId,
      eventId: eventRef.id,
      type: event.type,
      source: event.source,
      event,
    });

    await eventRef.set(event);

    let processingResult = {
      processed: false,
      action: "stored_event",
    };

    if (event.type === "current_auction_update") {
      processingResult = await processCurrentAuctionUpdate({
        mockDraftId,
        event,
        eventId: eventRef.id,
      });
    } else if (event.type === "player_sold") {
      processingResult = await processPlayerSold({
        mockDraftId,
        event,
        eventId: eventRef.id,
      });
    }

    return res.status(201).json({
      ok: true,
      mockDraftId,
      eventId: eventRef.id,
      ...processingResult,
    });
  } catch (error) {
    return next(error);
  }
});

app.use((error, _req, res, _next) => {
  console.error("Local API error", error);

  res.status(500).json({
    ok: false,
    error: "Internal server error",
  });
});

app.listen(PORT, () => {
  console.log(`${SERVICE_NAME} listening at http://localhost:${PORT}`);
});
