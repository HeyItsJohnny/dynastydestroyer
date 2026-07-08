const cors = require("cors");
const dotenv = require("dotenv");
const express = require("express");
const admin = require("firebase-admin");

dotenv.config();

const PORT = Number(process.env.PORT || 3001);
const SERVICE_NAME = "dynasty-destroyer-local-api";
const DEFAULT_EVENT_SOURCE = "yahoo_draft_room_extension";

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
const app = express();

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

    return res.status(201).json({
      ok: true,
      mockDraftId,
      eventId: eventRef.id,
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
