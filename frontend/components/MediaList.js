"use client";

import { useEffect, useState } from "react";

const API_URL = "http://127.0.0.1:8000";

export default function MediaList({ refreshKey }) {
  const [mediaItems, setMediaItems] = useState([]);
  const [message, setMessage] = useState("Loading library...");
  const [confirmingId, setConfirmingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [savingId, setSavingId] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [editedStatus, setEditedStatus] = useState("");
  const [editedProgress, setEditedProgress] = useState(0);
  const [editedTotalUnits, setEditedTotalUnits] = useState("");
  const [editedUnitType, setEditedUnitType] = useState("");
  const [editedSeasonNumber, setEditedSeasonNumber] = useState("");
  const [editedRating, setEditedRating] = useState("");
  const [editedNotes, setEditedNotes] = useState("");
  const [editError, setEditError] = useState("");

  useEffect(() => {
    async function loadMedia() {
      try {
        const response = await fetch(`${API_URL}/media/`);

        if (!response.ok) {
          throw new Error("Could not load your library.");
        }

        const data = await response.json();

        setMediaItems(data);
        setMessage("");
      } catch (error) {
        setMessage(error.message);
      }
    }

    loadMedia();
  }, [refreshKey]);

  function startEditing(item) {
    setEditingId(item.id);
    setEditError("");

    setEditedStatus(item.status);
    setEditedProgress(item.progress);

    if (item.total_units === null) {
      setEditedTotalUnits("");
    } else {
      setEditedTotalUnits(item.total_units);
    }

    if (item.unit_type === null) {
      setEditedUnitType("");
    } else {
      setEditedUnitType(item.unit_type);
    }

    if (item.season_number === null) {
      setEditedSeasonNumber("");
    } else {
      setEditedSeasonNumber(item.season_number);
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
    setEditingId(null);
    setEditedStatus("");
    setEditedProgress(0);
    setEditedTotalUnits("");
    setEditedUnitType("");
    setEditedSeasonNumber("");
    setEditedRating("");
    setEditedNotes("");
    setEditError("");
  }

  function handleUnitTypeChange(event) {
    const newUnitType = event.target.value;

    setEditedUnitType(newUnitType);

    if (newUnitType !== "episodes") {
      setEditedSeasonNumber("");
    }
  }

  function preventNumberInputScroll(event) {
    event.currentTarget.blur();
  }

  async function handleSave(id) {
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
          "Total units must be a whole number that is at least one."
        );
        return;
      }

      if (progressNumber > totalUnitsNumber) {
        setEditError(
          "Progress cannot be greater than total units."
        );
        return;
      }
    }

    let seasonNumber = null;

    if (editedSeasonNumber !== "") {
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

    setSavingId(id);
    setEditError("");

    const updatedMedia = {
      status: editedStatus,
      progress: progressNumber,
      total_units: totalUnitsNumber,
      unit_type: editedUnitType === "" ? null : editedUnitType,
      season_number: seasonNumber,
      rating: ratingNumber,
      notes: editedNotes.trim() === "" ? null : editedNotes.trim(),
    };

    try {
      const response = await fetch(`${API_URL}/media/${id}`, {
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

      setMediaItems((currentItems) =>
        currentItems.map((item) => {
          if (item.id === id) {
            return savedMedia;
          }

          return item;
        })
      );

      stopEditing();
    } catch (error) {
      setEditError(error.message);
    } finally {
      setSavingId(null);
    }
  }

  async function handleDelete(id) {
    setDeletingId(id);

    try {
      const response = await fetch(`${API_URL}/media/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Could not delete this item.");
      }

      setMediaItems((currentItems) =>
        currentItems.filter((item) => item.id !== id)
      );

      setConfirmingId(null);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="mt-10">
      <h2 className="text-2xl font-semibold">Your library</h2>

      {message && (
        <p className="mt-4 text-zinc-400" aria-live="polite">
          {message}
        </p>
      )}

      {!message && mediaItems.length === 0 && (
        <p className="mt-4 text-zinc-400">
          Your library is empty. Add your first title above.
        </p>
      )}

      <div className="mt-4 grid gap-3">
        {mediaItems.map((item) => (
          <article
            key={item.id}
            className="rounded-xl border border-zinc-800 bg-zinc-900 p-5"
          >
            <h3 className="text-lg font-semibold">{item.title}</h3>

            <p className="mt-1 text-sm text-zinc-400">
              {item.category.replace("_", " ")} ·{" "}
              {item.format.replace("_", " ")} ·{" "}
              {item.status.replace("_", " ")}
            </p>

            <div className="mt-4 grid gap-2 text-sm text-zinc-300">
              <p>
                <span className="text-zinc-500">Progress:</span>{" "}

                {item.season_number !== null && (
                  <>Season {item.season_number} · </>
                )}

                {item.progress}

                {item.total_units !== null && (
                  <> / {item.total_units}</>
                )}

                {item.unit_type !== null && (
                  <> {item.unit_type}</>
                )}
              </p>

              {item.rating !== null && (
                <p>
                  <span className="text-zinc-500">Rating:</span>{" "}
                  {item.rating} / 10
                </p>
              )}

              {item.notes !== null && item.notes !== "" && (
                <p>
                  <span className="text-zinc-500">Notes:</span>{" "}
                  {item.notes}
                </p>
              )}
            </div>

            {confirmingId === item.id ? (
              <div className="mt-4 flex items-center gap-3">
                <span className="text-sm text-zinc-300">
                  Delete this item?
                </span>

                <button
                  type="button"
                  onClick={() => setConfirmingId(null)}
                  disabled={deletingId === item.id}
                  className="rounded-md border border-zinc-600 px-3 py-1 text-sm text-zinc-200 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  disabled={deletingId === item.id}
                  className="rounded-md bg-red-500 px-3 py-1 text-sm font-medium text-black disabled:opacity-50"
                >
                  {deletingId === item.id ? "Deleting..." : "Yes, delete"}
                </button>
              </div>
            ) : (
              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => startEditing(item)}
                  className="rounded-md border border-emerald-500 px-3 py-1 text-sm text-emerald-400"
                >
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() => setConfirmingId(item.id)}
                  className="rounded-md border border-red-500 px-3 py-1 text-sm text-red-400"
                >
                  Delete
                </button>
              </div>
            )}

            {editingId === item.id && (
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
                  <span>Progress</span>
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
                  <span>Total units</span>
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

                <label className="grid gap-2 text-sm">
                  <span>Unit type</span>
                  <select
                    value={editedUnitType}
                    onChange={handleUnitTypeChange}
                    className="rounded-md bg-zinc-700 px-3 py-2"
                  >
                    <option value="">No unit type</option>
                    <option value="episodes">Episodes</option>
                    <option value="chapters">Chapters</option>
                    <option value="volumes">Volumes</option>
                    <option value="seasons">Seasons</option>
                  </select>
                </label>

                {editedUnitType === "episodes" && (
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
                    disabled={savingId === item.id}
                    className="rounded-md border border-zinc-600 px-3 py-1 text-sm text-zinc-200 disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSave(item.id)}
                    disabled={savingId === item.id}
                    className="rounded-md bg-emerald-500 px-3 py-1 text-sm font-medium text-black disabled:opacity-50"
                  >
                    {savingId === item.id ? "Saving..." : "Save changes"}
                  </button>
                </div>
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}