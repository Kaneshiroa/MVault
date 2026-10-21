"use client";

/**
 * Displays one media item and provides its edit, save,
 * validation, and delete-confirmation interface.
 */

import { useState } from "react";

const API_URL = "http://127.0.0.1:8000";

function getTrackingLabels(category) {
  if (category === "reading") {
    return {
      progress: "Chapter",
      total: "Total chapters",
      showSeason: false,
    };
  }

  return {
    progress: "Episode",
    total: "Total episodes",
    showSeason: true,
  };
}

function getStatusLabel(status) {
  return status.replace("_", " ");
}

export default function MediaCard({
  item,
  onUpdated,
  onDelete,
  deletingId,
}) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  const [editedStatus, setEditedStatus] = useState("");
  const [editedProgress, setEditedProgress] = useState(1);
  const [editedTotalUnits, setEditedTotalUnits] = useState("");
  const [editedSeasonNumber, setEditedSeasonNumber] = useState("");
  const [editedRating, setEditedRating] = useState("");
  const [editedNotes, setEditedNotes] = useState("");
  const [editError, setEditError] = useState("");

  const isDeleting = deletingId === item.id;
  const trackingLabels = getTrackingLabels(item.category);
  const formatLabel = item.format.replace("_", " ");

  function startEditing() {
    setEditing(true);
    setEditError("");

    setEditedStatus(item.status);
    setEditedProgress(item.progress);

    if (item.total_units === null) {
      setEditedTotalUnits("");
    } else {
      setEditedTotalUnits(item.total_units);
    }

    if (trackingLabels.showSeason && item.season_number !== null) {
      setEditedSeasonNumber(item.season_number);
    } else {
      setEditedSeasonNumber("");
    }

    if (item.rating === null) {
      setEditedRating("");
    } else {
      setEditedRating(item.rating);
    }

    if (item.notes === null) {
      setEditedNotes("");
    } else {
      setEditedNotes(item.notes);
    }
  }

  function stopEditing() {
    setEditing(false);
    setEditedStatus("");
    setEditedProgress(1);
    setEditedTotalUnits("");
    setEditedSeasonNumber("");
    setEditedRating("");
    setEditedNotes("");
    setEditError("");
  }

  function preventNumberInputScroll(event) {
    event.currentTarget.blur();
  }

  async function handleSave() {
    const progressNumber = Number(editedProgress);

    if (!Number.isInteger(progressNumber) || progressNumber < 0) {
      setEditError(
        "Progress must be a whole number that is zero or greater."
      );
      return;
    }

    let totalUnitsNumber = null;

    if (editedTotalUnits !== "") {
      totalUnitsNumber = Number(editedTotalUnits);

      if (!Number.isInteger(totalUnitsNumber) || totalUnitsNumber < 1) {
        setEditError(
          "Total must be a whole number that is at least one."
        );
        return;
      }

      if (progressNumber > totalUnitsNumber) {
        setEditError(
          "Progress cannot be greater than the total."
        );
        return;
      }
    }

    let seasonNumber = null;

    if (
      trackingLabels.showSeason &&
      editedSeasonNumber !== ""
    ) {
      seasonNumber = Number(editedSeasonNumber);

      if (!Number.isInteger(seasonNumber) || seasonNumber < 1) {
        setEditError(
          "Season number must be a whole number that is at least one."
        );
        return;
      }
    }

    let ratingNumber = null;

    if (editedRating !== "") {
      ratingNumber = Number(editedRating);

      const isHalfPoint = Number.isInteger(ratingNumber * 2);

      if (
        ratingNumber < 1 ||
        ratingNumber > 10 ||
        !isHalfPoint
      ) {
        setEditError(
          "Rating must be from 1 to 10 in 0.5 increments."
        );
        return;
      }
    }

    const updatedMedia = {
      status: editedStatus,
      progress: progressNumber,
      total_units: totalUnitsNumber,
      season_number: seasonNumber,
      rating: ratingNumber,
      notes: editedNotes.trim() === "" ? null : editedNotes.trim(),
    };

    setSaving(true);
    setEditError("");

    try {
      const response = await fetch(`${API_URL}/media/${item.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedMedia),
      });

      if (!response.ok) {
        throw new Error("Could not save changes.");
      }

      const savedMedia = await response.json();

      onUpdated(savedMedia);
      stopEditing();
    } catch (error) {
      setEditError(error.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <article className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 transition hover:border-violet-700">
      <div className="flex gap-4 p-4">
        <div className="flex h-32 w-24 shrink-0 items-center justify-center rounded-lg border border-violet-800 bg-gradient-to-br from-violet-700 via-violet-950 to-zinc-950 p-2 text-center text-xs font-black uppercase tracking-wider text-violet-200 shadow-lg shadow-violet-950/40">
          {formatLabel}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-400">
                {item.category.replace("_", " ")}
              </p>

              <h3 className="mt-1 truncate text-lg font-bold text-zinc-100">
                {item.title}
              </h3>
            </div>

            <span className="shrink-0 rounded-full bg-violet-950 px-2.5 py-1 text-xs font-semibold capitalize text-violet-300">
              {getStatusLabel(item.status)}
            </span>
          </div>

          <p className="mt-3 text-sm text-zinc-300">
            {trackingLabels.showSeason &&
              item.season_number !== null && (
                <>Season {item.season_number} · </>
              )}

            {trackingLabels.progress} {item.progress}

            {item.total_units !== null && (
              <> / {item.total_units}</>
            )}
          </p>

          {item.rating !== null && (
            <p className="mt-1 text-sm font-medium text-violet-300">
              ★ {item.rating} / 10
            </p>
          )}

          {item.notes !== null && item.notes !== "" && (
            <p className="mt-2 line-clamp-2 text-sm text-zinc-400">
              {item.notes}
            </p>
          )}
        </div>
      </div>

      {confirmingDelete ? (
        <div className="mt-4 flex items-center gap-3">
          <span className="text-sm text-zinc-300">
            Delete this item?
          </span>

          <button
            type="button"
            onClick={() => setConfirmingDelete(false)}
            disabled={isDeleting}
            className="rounded-md border border-zinc-600 px-3 py-1 text-sm text-zinc-200 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => onDelete(item.id)}
            disabled={isDeleting}
            className="rounded-md bg-red-500 px-3 py-1 text-sm font-medium text-black disabled:opacity-50"
          >
            {isDeleting ? "Deleting..." : "Yes, delete"}
          </button>
        </div>
      ) : (
              <div className="flex gap-3 border-t border-zinc-800 px-4 py-3">
          <button
            type="button"
            onClick={startEditing}
                  className="rounded-md border border-violet-500 px-3 py-1 text-sm text-violet-300 transition hover:bg-violet-950"
          >
            Edit
          </button>

          <button
            type="button"
            onClick={() => setConfirmingDelete(true)}
            className="rounded-md border border-red-500 px-3 py-1 text-sm text-red-400"
          >
            Delete
          </button>
        </div>
      )}

      {editing && (
        <div className="mt-4 grid gap-4 rounded-md bg-zinc-800 p-4">
          <p className="text-sm text-zinc-300">
            Editing {item.title}
          </p>

          <label className="grid gap-2 text-sm">
            <span>Status</span>
            <select
              value={editedStatus}
              onChange={(event) => setEditedStatus(event.target.value)}
              className="rounded-md bg-zinc-700 px-3 py-2"
            >
              <option value="planned">Planned</option>
              <option value="in_progress">In progress</option>
              <option value="completed">Completed</option>
            </select>
          </label>

          <label className="grid gap-2 text-sm">
            <span>Current {trackingLabels.progress.toLowerCase()}</span>
            <input
              type="number"
              min="0"
              value={editedProgress}
              onChange={(event) => setEditedProgress(event.target.value)}
              onWheel={preventNumberInputScroll}
              className="rounded-md bg-zinc-700 px-3 py-2"
            />
          </label>

          <label className="grid gap-2 text-sm">
            <span>{trackingLabels.total}</span>
            <input
              type="number"
              min="1"
              value={editedTotalUnits}
              onChange={(event) =>
                setEditedTotalUnits(event.target.value)
              }
              onWheel={preventNumberInputScroll}
              className="rounded-md bg-zinc-700 px-3 py-2"
            />
          </label>

          {trackingLabels.showSeason && (
            <label className="grid gap-2 text-sm">
              <span>Season number</span>
              <input
                type="number"
                min="1"
                value={editedSeasonNumber}
                onChange={(event) =>
                  setEditedSeasonNumber(event.target.value)
                }
                onWheel={preventNumberInputScroll}
                className="rounded-md bg-zinc-700 px-3 py-2"
              />
            </label>
          )}

          <label className="grid gap-2 text-sm">
            <span>Rating (1–10, half points allowed)</span>
            <input
              type="number"
              min="1"
              max="10"
              step="0.5"
              value={editedRating}
              onChange={(event) => setEditedRating(event.target.value)}
              onWheel={preventNumberInputScroll}
              className="rounded-md bg-zinc-700 px-3 py-2"
            />
          </label>

          <label className="grid gap-2 text-sm">
            <span>Notes</span>
            <textarea
              value={editedNotes}
              onChange={(event) => setEditedNotes(event.target.value)}
              placeholder="Add a note..."
              className="min-h-24 rounded-md bg-zinc-700 px-3 py-2"
            />
          </label>

          {editError && (
            <p className="text-sm text-red-400" aria-live="polite">
              {editError}
            </p>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={stopEditing}
              disabled={saving}
              className="rounded-md border border-zinc-600 px-3 py-1 text-sm text-zinc-200 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-md bg-emerald-500 px-3 py-1 text-sm font-medium text-black disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </div>
      )}
    </article>
  );
}
