import React, { useEffect, useState } from "react";

const NotesCard = ({ initialNotes, isPlaceholder, isSaving, onSave }) => {
  const [notes, setNotes] = useState(initialNotes ?? "");

  useEffect(() => {
    setNotes(initialNotes ?? "");
  }, [initialNotes]);

  return (
    <div className="card shadow-sm h-100">
      <div className="card-header fw-bold">
        <span>
          Notes
          {isPlaceholder && (
            <span className="badge bg-warning text-dark ms-2">Placeholder</span>
          )}
        </span>
      </div>
      <div className="card-body">
        <textarea
          className="form-control"
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Add draft notes, nomination strategy, risk flags, or roster fit..."
          rows={5}
          value={notes}
        />
        <div className="d-flex justify-content-end mt-3">
          <button
            className="btn btn-primary"
            disabled={isSaving}
            onClick={() => onSave(notes)}
            type="button"
          >
            {isSaving ? "Saving..." : "Save Notes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotesCard;
