"use client";

/**
 * Displays one media item and provides its detail view, edit, save,
 * validation, and delete-confirmation interface.
 */

import { useState } from "react";
import { authenticatedFetch } from "../lib/api";

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
  activeMode,
  onStartEditing,
  onStartDeleting,
  onCloseAction,
}) {
  const [saving, setSaving] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [adjustingProgress, setAdjustingProgress] = useState(false);
  const [progressError, setProgressError] = useState("");

  const [editedStatus, setEditedStatus] = useState("");
  const [editedProgress, setEditedProgress] = useState(1);
  const [editedTotalUnits, setEditedTotalUnits] = useState("");
  const [editedSeasonNumber, setEditedSeasonNumber] = useState("");
  const [editedRating, setEditedRating] = useState("");
  const [editedNotes, setEditedNotes] = useState("");
  const [editError, setEditError] = useState("");

  const isDeleting = deletingId === item.id;
  const confirmingDelete = activeMode === "delete";
  const editing = activeMode === "edit";
  const trackingLabels = getTrackingLabels(item.category);
  const formatLabel = item.format.replace("_", " ");

  function startEditing() {
    onStartEditing(item.id);
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
    setEditedStatus("");
    setEditedProgress(1);
    setEditedTotalUnits("");
    setEditedSeasonNumber("");
    setEditedRating("");
    setEditedNotes("");
    setEditError("");

    onCloseAction(item.id, "edit");
  }

  function cancelDelete() {
    onCloseAction(item.id, "delete");
  }

  function preventNumberInputScroll(event) {
    event.currentTarget.blur();
  }

  async function adjustProgress(amount) {
    const currentProgress = Number(item.progress) || 0;
    const nextProgress = Math.max(0, currentProgress + amount);

    if (
      item.total_units !== null &&
      nextProgress > item.total_units
    ) {
      return;
    }

    if (nextProgress === currentProgress) {
      return;
    }

    setAdjustingProgress(true);
    setProgressError("");

    try {
      const response = await authenticatedFetch(`/media/${item.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          progress: nextProgress,
        }),
      });

      if (!response.ok) {
        throw new Error("Could not update progress.");
      }

      const updatedMedia = await response.json();

      onUpdated(updatedMedia);
    } catch (error) {
      setProgressError(error.message);
    } finally {
      setAdjustingProgress(false);
    }
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
        setEditError("Total must be a whole number that is at least one.");
        return;
      }

      if (progressNumber > totalUnitsNumber) {
        setEditError("Progress cannot be greater than the total.");
        return;
      }
    }

    let seasonNumber = null;

    if (trackingLabels.showSeason && editedSeasonNumber !== "") {
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

      const isTenthPoint = Number.isInteger(ratingNumber * 10);

      if (ratingNumber < 1 || ratingNumber > 10 || !isTenthPoint) {
        setEditError("Rating must be from 1 to 10 in 0.1 increments.");
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
      const response = await authenticatedFetch(`/media/${item.id}`, {
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
    <>
      <article className="relative isolate overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 transition hover:border-ultramarine-700">
        {item.backdrop_url && (
          <img
            src={item.backdrop_url}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-20 h-full w-full object-cover opacity-30"
          />
        )}

        {item.backdrop_url && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-950/75"
          />
        )}

        <button
          type="button"
          onClick={() => setIsDetailOpen(true)}
          className="flex w-full gap-4 p-4 text-left outline-none transition hover:bg-zinc-800/30 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ultramarine-400"
          aria-label={`Open details for ${item.title}`}
        >
          {item.poster_url ? (
            <img
              src={item.poster_url}
              alt={`Poster for ${item.title}`}
              className="h-32 w-24 shrink-0 rounded-lg border border-ultramarine-800 object-cover shadow-lg shadow-black/40"
            />
          ) : (
            <div className="flex h-32 w-24 shrink-0 items-center justify-center rounded-lg border border-ultramarine-800 bg-gradient-to-br from-ultramarine-700 via-ultramarine-950 to-zinc-950 p-2 text-center text-xs font-black uppercase tracking-wider text-ultramarine-200 shadow-lg shadow-ultramarine-950/40">
              {formatLabel}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex items-start gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ultramarine-400">
                  {item.category.replace("_", " ")}
                </p>

                <h3 className="group relative mt-1 text-lg font-bold text-zinc-100">
                  <span className="block truncate">{item.title}</span>

                  <span className="pointer-events-none absolute left-0 top-full z-30 mt-2 hidden w-max max-w-xs rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm font-medium text-zinc-100 shadow-xl shadow-black/50 group-hover:block">
                    {item.title}
                  </span>
                </h3>
              </div>

              <span className="shrink-0 rounded-full bg-ultramarine-950 px-2.5 py-1 text-xs font-semibold capitalize text-ultramarine-300">
                {getStatusLabel(item.status)}
              </span>
            </div>

            {item.progress > 0 && (
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
            )}

            {item.rating !== null && (
              <p className="mt-1 text-sm font-medium text-ultramarine-300">
                ★ {item.rating} / 10
              </p>
            )}

            {item.notes !== null && item.notes !== "" && (
              <p className="mt-2 line-clamp-2 text-sm text-zinc-400">
                {item.notes}
              </p>
            )}
          </div>
        </button>

        {confirmingDelete ? (
          <div className="flex flex-wrap items-center gap-3 border-t border-zinc-800 bg-zinc-900/80 px-4 py-3 backdrop-blur-sm">
            <span className="text-sm text-zinc-300">Delete this item?</span>

            <button
              type="button"
              onClick={cancelDelete}
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
          <div className="flex gap-3 border-t border-zinc-800 bg-zinc-900/80 px-4 py-3 backdrop-blur-sm">
            <button
              type="button"
              onClick={startEditing}
              className="rounded-md border border-ultramarine-500 px-3 py-1 text-sm text-ultramarine-300 transition hover:bg-ultramarine-950"
            >
              Edit
            </button>

            <button
              type="button"
              onClick={() => onStartDeleting(item.id)}
              className="rounded-md border border-red-500 px-3 py-1 text-sm text-red-400"
            >
              Delete
            </button>
          </div>
        )}

        {editing && (
          <div className="mt-4 grid gap-4 bg-zinc-800/95 p-4 backdrop-blur-sm">
            <p className="text-sm text-zinc-300">Editing {item.title}</p>

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
                onChange={(event) => setEditedTotalUnits(event.target.value)}
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
                  onChange={(event) => setEditedSeasonNumber(event.target.value)}
                  onWheel={preventNumberInputScroll}
                  className="rounded-md bg-zinc-700 px-3 py-2"
                />
              </label>
            )}

            <label className="grid gap-2 text-sm">
              <span>Rating (1–10, tenths allowed)</span>
              <input
                type="number"
                min="1"
                max="10"
                step="0.1"
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

      {isDetailOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            onClick={() => setIsDetailOpen(false)}
            aria-label="Close title details"
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          <section
            role="dialog"
            aria-modal="true"
            aria-label={`${item.title} details`}
            className="relative isolate max-h-[90vh] w-full max-w-3xl overflow-y-auto overflow-hidden rounded-2xl border border-zinc-700 bg-zinc-900 shadow-2xl shadow-black"
          >
            {item.backdrop_url && (
              <img
                src={item.backdrop_url}
                alt=""
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -z-20 h-80 w-full object-cover opacity-35"
              />
            )}

            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-80 bg-gradient-to-b from-zinc-950/40 via-zinc-900/90 to-zinc-900"
            />

            <div className="relative p-6 sm:p-8">
              <button
                type="button"
                onClick={() => setIsDetailOpen(false)}
                className="absolute right-4 top-4 rounded-md border border-zinc-700 bg-zinc-950/80 px-3 py-1.5 text-sm font-medium text-zinc-200 transition hover:border-ultramarine-500 hover:text-white"
              >
                Close
              </button>

              <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
                {item.poster_url ? (
                  <img
                    src={item.poster_url}
                    alt={`Poster for ${item.title}`}
                    className="h-64 w-44 shrink-0 rounded-xl border border-ultramarine-700 object-cover shadow-xl shadow-black/50"
                  />
                ) : (
                  <div className="flex h-64 w-44 shrink-0 items-center justify-center rounded-xl border border-ultramarine-700 bg-gradient-to-br from-ultramarine-700 via-ultramarine-950 to-zinc-950 p-4 text-center text-sm font-black uppercase tracking-wider text-ultramarine-200">
                    {formatLabel}
                  </div>
                )}

                <div className="min-w-0 pb-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ultramarine-300">
                    {item.category.replace("_", " ")}
                  </p>

                  <h2 className="mt-2 pr-12 text-3xl font-black tracking-tight text-zinc-50 sm:text-4xl">
                    {item.title}
                  </h2>

                  <p className="mt-3 capitalize text-zinc-300">
                    {formatLabel}
                  </p>

                  <span className="mt-4 inline-flex rounded-full bg-ultramarine-950 px-3 py-1.5 text-sm font-semibold capitalize text-ultramarine-300">
                    {getStatusLabel(item.status)}
                  </span>
                </div>
              </div>

              <div className="mt-8 grid gap-4 border-t border-zinc-700 pt-6 sm:grid-cols-2">
                <div className="rounded-xl border border-zinc-700 bg-zinc-950/65 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ultramarine-300">
                    Your progress
                  </p>

                  <div className="mt-4 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => adjustProgress(-1)}
                      disabled={adjustingProgress || item.progress <= 0}
                      aria-label={`Decrease ${trackingLabels.progress.toLowerCase()}`}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-zinc-600 text-lg font-bold text-zinc-200 transition hover:border-ultramarine-500 hover:text-ultramarine-300 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      −
                    </button>

                    <p className="min-w-0 flex-1 text-center text-sm font-semibold text-zinc-100">
                      {item.progress > 0 ? (
                        <>
                          {trackingLabels.showSeason &&
                            item.season_number !== null && (
                              <>Season {item.season_number} · </>
                            )}

                          {trackingLabels.progress} {item.progress}

                          {item.total_units !== null && (
                            <> / {item.total_units}</>
                          )}
                        </>
                      ) : (
                        "Not started"
                      )}
                    </p>

                    <button
                      type="button"
                      onClick={() => adjustProgress(1)}
                      disabled={
                        adjustingProgress ||
                        (item.total_units !== null &&
                          item.progress >= item.total_units)
                      }
                      aria-label={`Increase ${trackingLabels.progress.toLowerCase()}`}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-ultramarine-600 text-lg font-bold text-ultramarine-300 transition hover:bg-ultramarine-950 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>

                  {progressError && (
                    <p className="mt-3 text-sm text-red-400" aria-live="polite">
                      {progressError}
                    </p>
                  )}
                </div>

                <div className="rounded-xl border border-zinc-700 bg-zinc-950/65 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ultramarine-300">
                    Your rating
                  </p>

                  {item.rating !== null ? (
                    <p className="mt-3 text-lg font-bold text-ultramarine-300">
                      ★ {item.rating} / 10
                    </p>
                  ) : (
                    <p className="mt-3 text-zinc-400">Not rated yet.</p>
                  )}
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-zinc-700 bg-zinc-950/65 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ultramarine-300">
                  Your notes
                </p>

                <p className="mt-3 whitespace-pre-wrap leading-7 text-zinc-300">
                  {item.notes !== null && item.notes !== ""
                    ? item.notes
                    : "No personal notes yet."}
                </p>
              </div>
            </div>
          </section>
        </div>
      )}
    </>
  );
}