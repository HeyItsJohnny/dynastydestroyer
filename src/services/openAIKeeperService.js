const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;
const OPENAI_CHAT_COMPLETIONS_URL = "https://api.openai.com/v1/chat/completions";

export const buildFallbackKeeperNotes = (recommendations = []) => ({
  summary:
    "Recommendations are ranked by the local keeper score using tier, rank, value, projections, scarcity, and budget impact.",
  notes: recommendations.map((recommendation, index) => {
    const { player, recommendationLabel, valueMetrics } = recommendation;
    const rankText = player.positionRank
      ? `#${player.positionRank} ${player.position}`
      : player.position || "unranked";

    return {
      playerId: player.id || player.playerId,
      note: `Ranked #${index + 1} as a ${recommendationLabel}: ${rankText}, Tier ${
        player.tier ?? "-"
      }, with a ${formatSignedCurrency(
        valueMetrics.marketProfit
      )} market profit and ${formatSignedCurrency(
        valueMetrics.hardMaxGap
      )} hard max cushion.`,
    };
  }),
});

const formatSignedCurrency = (value) => {
  const parsed = Number(value) || 0;
  const sign = parsed > 0 ? "+" : parsed < 0 ? "-" : "";

  return `${sign}$${Math.abs(Math.round(parsed))}`;
};

const buildPromptPayload = (recommendations) =>
  recommendations.map((recommendation, index) => ({
    rank: index + 1,
    playerId: recommendation.player.id || recommendation.player.playerId,
    name: recommendation.player.fullName || recommendation.player.name,
    position: recommendation.player.position,
    team: recommendation.player.team || recommendation.player.nflTeam,
    positionRank: recommendation.player.positionRank,
    tier: recommendation.player.tier,
    keeperScore: recommendation.keeperScore,
    recommendationLabel: recommendation.recommendationLabel,
    keeperCost: recommendation.player.keeperCost,
    auctionValue: recommendation.player.auctionValue,
    maxAuctionValue: recommendation.player.maxAuctionValue,
    hardMaxAuctionValue: recommendation.player.hardMaxAuctionValue,
    projectedPoints: recommendation.player.projectedPoints,
    valueMetrics: recommendation.valueMetrics,
    scoreBreakdown: recommendation.scoreBreakdown,
  }));

export const getOpenAIKeeperNotes = async (recommendations = []) => {
  if (!OPENAI_API_KEY) {
    throw new Error("Missing REACT_APP_OPENAI_API_KEY");
  }

  // Development-only frontend call. Production should move this request to a backend
  // or Firebase Cloud Function so the OpenAI API key is never exposed to users.
  const response = await fetch(OPENAI_CHAT_COMPLETIONS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You write short fantasy football keeper recommendation notes. Do not change the rankings. Do not recalculate the scores. Do not reorder the players. Only explain why each player was ranked where they were ranked using the provided data.",
        },
        {
          role: "user",
          content: JSON.stringify({
            instructions:
              'Return JSON exactly like {"notes":[{"playerId":"abc123","note":"This player is recommended because..."}],"summary":"Overall keeper strategy..."}. Keep each note to one sentence.',
            recommendations: buildPromptPayload(recommendations),
          }),
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `OpenAI request failed with ${response.status}`;

    try {
      const parsedError = JSON.parse(errorText);

      if (parsedError?.error?.message) {
        errorMessage = parsedError.error.message;
      }
    } catch (error) {
      if (errorText) {
        errorMessage = errorText;
      }
    }

    throw new Error(errorMessage);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("OpenAI response did not include content");
  }

  return JSON.parse(content);
};
