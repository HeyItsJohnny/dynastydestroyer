const clamp = (value, min = 0, max = 100) =>
  Math.max(min, Math.min(max, Number(value) || 0));

const toNumber = (value, fallback = 0) => {
  const parsed = Number(`${value ?? ""}`.replace(/[$,]/g, ""));

  return Number.isFinite(parsed) ? parsed : fallback;
};

const firstValue = (...values) =>
  values.find((value) => value !== undefined && value !== null && value !== "");

const normalizePosition = (position) => `${position ?? ""}`.toUpperCase();

const getRankScore = (positionRank) => {
  const rank = toNumber(positionRank, null);

  if (rank == null) return 50;
  if (rank <= 3) return 100;
  if (rank <= 8) return 90;
  if (rank <= 15) return 75;
  if (rank <= 24) return 60;

  return 40;
};

const getTierScore = (tier) => {
  const parsedTier = toNumber(tier, null);

  if (parsedTier == null) return 50;
  if (parsedTier === 1) return 100;
  if (parsedTier === 2) return 90;
  if (parsedTier === 3) return 75;
  if (parsedTier === 4) return 60;

  return 40;
};

const getScarcityScore = (position) => {
  const scarcityScores = {
    RB: 90,
    WR: 85,
    TE: 80,
    QB: 65,
    K: 30,
    DST: 30,
    DEF: 30,
  };

  return scarcityScores[normalizePosition(position)] ?? 50;
};

const getEliteBoost = ({ position, positionRank, tier }) => {
  const parsedTier = toNumber(tier, null);
  const parsedRank = toNumber(positionRank, null);

  if (parsedTier !== 1 || parsedRank == null || parsedRank > 3) {
    return 0;
  }

  if (["RB", "WR"].includes(normalizePosition(position))) return 10;
  if (normalizePosition(position) === "TE") return 8;
  if (normalizePosition(position) === "QB") return 5;

  return 0;
};

const getValueScore = ({
  auctionValue,
  hardMaxGap,
  keeperCost,
  marketProfit,
  maxBidGap,
  positionRank,
  tier,
}) => {
  const valueBase = auctionValue > 0 ? auctionValue : Math.max(keeperCost, 1);
  const marketScore = clamp(50 + (marketProfit / valueBase) * 100);
  const maxBidScore = clamp(50 + (maxBidGap / valueBase) * 80);
  const hardMaxScore = clamp(50 + (hardMaxGap / valueBase) * 70);
  const isElite = toNumber(tier, null) === 1 && toNumber(positionRank, 99) <= 3;
  const eliteTolerance = isElite && hardMaxGap >= 0 ? 10 : 0;
  const hardMaxPenalty = hardMaxGap < 0 ? Math.min(55, Math.abs(hardMaxGap) * 8) : 0;

  return clamp(
    marketScore * 0.45 +
      maxBidScore * 0.3 +
      hardMaxScore * 0.25 +
      eliteTolerance -
      hardMaxPenalty
  );
};

const getMaxBidSafetyScore = (maxBidGap, hardMaxGap, hardMaxAuctionValue) => {
  const base = hardMaxAuctionValue > 0 ? hardMaxAuctionValue : 1;

  if (hardMaxGap < 0) {
    return clamp(35 + (hardMaxGap / base) * 100);
  }

  return clamp(55 + (maxBidGap / base) * 45 + (hardMaxGap / base) * 35);
};

const getBudgetImpactScore = ({ keeperCost, player, settings }) => {
  if (!settings) {
    return 50;
  }

  const totalBudget = toNumber(
    firstValue(settings.totalBudget, settings.Budget, settings.budget),
    200
  );
  const position = normalizePosition(player.position);
  const directPercent = settings[`${position.toLowerCase()}BudgetPercent`];
  const allocationRule = Array.isArray(settings.AllocationRules)
    ? settings.AllocationRules.find((rule) => rule.position === position)
    : null;
  const percent = toNumber(
    firstValue(directPercent, allocationRule?.maxPercent, allocationRule?.minPercent),
    null
  );

  if (!percent || totalBudget <= 0) {
    return 50;
  }

  const positionBudget = (totalBudget * percent) / 100;

  if (positionBudget <= 0) {
    return 50;
  }

  return clamp(100 - (keeperCost / positionBudget) * 65);
};

const getRecommendationLabel = (score) => {
  if (score >= 90) return "Must Keep";
  if (score >= 82) return "Elite Keep Candidate";
  if (score >= 74) return "Strong Keep";
  if (score >= 65) return "Good Value";
  if (score >= 55) return "Borderline";

  return "Avoid at Cost";
};

export const normalizeKeeperPlayer = (player) => {
  const auctionValue = toNumber(firstValue(player.auctionValue, player.maxAuctionValue), 0);
  const maxAuctionValue = toNumber(
    firstValue(player.maxAuctionValue, player.maxBid, player.max_bid),
    auctionValue
  );
  const hardMaxAuctionValue = toNumber(
    firstValue(player.hardMaxAuctionValue, player.hardMax, player.hard_max_bid),
    maxAuctionValue
  );
  const keeperCost = toNumber(firstValue(player.keeperCost, player.auctionValue), 0);

  return {
    ...player,
    name: firstValue(player.name, player.fullName, ""),
    fullName: firstValue(player.fullName, player.name, ""),
    team: firstValue(player.team, player.nflTeam, ""),
    headshotUrl: firstValue(player.headshotUrl, player.media?.headshotUrl, ""),
    auctionValue,
    maxAuctionValue,
    hardMaxAuctionValue,
    projectedPoints: toNumber(
      firstValue(player.projectedPoints, player.projected_points),
      0
    ),
    tier: firstValue(player.tier, null),
    positionRank: firstValue(player.positionRank, player.rank, null),
    keeperCost,
  };
};

export const getTopKeeperRecommendations = (players = [], settings = null) => {
  const normalizedPlayers = players.map(normalizeKeeperPlayer);
  const highestProjectedPoints = Math.max(
    ...normalizedPlayers.map((player) => player.projectedPoints),
    0
  );

  return normalizedPlayers
    .map((player) => {
      const rankScore = getRankScore(player.positionRank);
      const tierScore = getTierScore(player.tier);
      const rankTierScore = rankScore * 0.6 + tierScore * 0.4;
      const marketProfit = player.auctionValue - player.keeperCost;
      const maxBidGap = player.maxAuctionValue - player.keeperCost;
      const hardMaxGap = player.hardMaxAuctionValue - player.keeperCost;
      const projectionScore =
        highestProjectedPoints > 0
          ? clamp((player.projectedPoints / highestProjectedPoints) * 100)
          : 50;
      const valueScore = getValueScore({
        auctionValue: player.auctionValue,
        hardMaxGap,
        keeperCost: player.keeperCost,
        marketProfit,
        maxBidGap,
        positionRank: player.positionRank,
        tier: player.tier,
      });
      const maxBidSafetyScore = getMaxBidSafetyScore(
        maxBidGap,
        hardMaxGap,
        player.hardMaxAuctionValue
      );
      const scarcityScore = getScarcityScore(player.position);
      const budgetImpactScore = getBudgetImpactScore({
        keeperCost: player.keeperCost,
        player,
        settings,
      });
      const eliteBoost = getEliteBoost(player);
      const keeperScore = clamp(
        rankTierScore * 0.3 +
          valueScore * 0.25 +
          projectionScore * 0.2 +
          maxBidSafetyScore * 0.1 +
          scarcityScore * 0.1 +
          budgetImpactScore * 0.05 +
          eliteBoost
      );

      return {
        player,
        keeperScore: Math.round(keeperScore),
        scoreBreakdown: {
          rankTierScore: Math.round(rankTierScore),
          valueScore: Math.round(valueScore),
          projectionScore: Math.round(projectionScore),
          maxBidSafetyScore: Math.round(maxBidSafetyScore),
          scarcityScore: Math.round(scarcityScore),
          budgetImpactScore: Math.round(budgetImpactScore),
          eliteBoost,
        },
        valueMetrics: {
          marketProfit,
          maxBidGap,
          hardMaxGap,
        },
        recommendationLabel: getRecommendationLabel(keeperScore),
      };
    })
    .sort((first, second) => {
      if (second.keeperScore !== first.keeperScore) {
        return second.keeperScore - first.keeperScore;
      }

      return first.player.fullName.localeCompare(second.player.fullName);
    })
    .slice(0, 5);
};
