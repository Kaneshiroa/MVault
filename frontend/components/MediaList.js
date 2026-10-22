"use client";

/**
 * Loads the user's media library, filters and sorts visible titles,
 * and coordinates updates, deletions, and active card actions.
 */

import { useEffect, useState } from "react";
import { authenticatedFetch } from "../lib/api";
import LibrarySidebar from "./LibrarySidebar";
import MediaCard from "./MediaCard";

const formatsByCategory = {
  animated: [
    { value: "anime", label: "Anime" },
  ],
  reading: [
    { value: "manga", label: "Manga" },
    { value: "manhwa", label: "Manhwa" },
    { value: "webtoon", label: "Webtoon" },
    { value: "web_novel", label: "Web Novel" },
  ],
  live_action: [
    { value: "kdrama", label: "K-drama" },
    { value: "drama", label: "Drama" },
    { value: "movie", label: "Movie" },
    { value: "tv_show", label: "TV Show" },
  ],
};

export default function MediaList({
  refreshKey,
  selectedCategory,
  onSelectedCategoryChange,
  onAddTitleClick,
}) {
  const [mediaItems, setMediaItems] = useState([]);
  const [message, setMessage] = useState("Loading library...");
  const [deletingId, setDeletingId] = useState(null);
  const [activeCardAction, setActiveCardAction] = useState(null);

  const [selectedFormat, setSelectedFormat] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedSort, setSelectedSort] = useState("newest");

  const hasActiveFilters =
    selectedCategory !== "all" ||
    selectedFormat !== "all" ||
    selectedStatus !== "all" ||
    selectedSort !== "newest";

  let formatOptions = [];

  if (selectedCategory === "all") {
    for (const category in formatsByCategory) {
      for (const format of formatsByCategory[category]) {
        formatOptions.push(format);
      }
    }
  } else {
    formatOptions = formatsByCategory[selectedCategory];
  }

  const visibleMediaItems = [];

  for (const item of mediaItems) {
    const matchesCategory =
      selectedCategory === "all" || item.category === selectedCategory;

    const matchesFormat =
      selectedFormat === "all" || item.format === selectedFormat;

    const matchesStatus =
      selectedStatus === "all" || item.status === selectedStatus;

    if (matchesCategory && matchesFormat && matchesStatus) {
      visibleMediaItems.push(item);
    }
  }

  const sortedMediaItems = visibleMediaItems.slice();

  if (selectedSort === "newest") {
    sortedMediaItems.sort((firstItem, secondItem) => {
      const firstDate = new Date(firstItem.created_at);
      const secondDate = new Date(secondItem.created_at);

      return secondDate - firstDate;
    });
  }

  if (selectedSort === "title_ascending") {
    sortedMediaItems.sort((firstItem, secondItem) => {
      return firstItem.title.localeCompare(secondItem.title);
    });
  }

  if (selectedSort === "title_descending") {
    sortedMediaItems.sort((firstItem, secondItem) => {
      return secondItem.title.localeCompare(firstItem.title);
    });
  }

  if (selectedSort === "rating_high") {
    sortedMediaItems.sort((firstItem, secondItem) => {
      if (firstItem.rating === null && secondItem.rating === null) {
        return 0;
      }

      if (firstItem.rating === null) {
        return 1;
      }

      if (secondItem.rating === null) {
        return -1;
      }

      return secondItem.rating - firstItem.rating;
    });
  }

  if (selectedSort === "rating_low") {
    sortedMediaItems.sort((firstItem, secondItem) => {
      if (firstItem.rating === null && secondItem.rating === null) {
        return 0;
      }

      if (firstItem.rating === null) {
        return 1;
      }

      if (secondItem.rating === null) {
        return -1;
      }

      return firstItem.rating - secondItem.rating;
    });
  }

  useEffect(() => {
    async function loadMedia() {
      try {
        const response = await authenticatedFetch("/media/");

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

  useEffect(() => {
    if (selectedCategory === "all" || selectedFormat === "all") {
      return;
    }

    const allowedFormats = formatsByCategory[selectedCategory];

    const formatMatchesCategory = allowedFormats.some((format) => {
      return format.value === selectedFormat;
    });

    if (!formatMatchesCategory) {
      setSelectedFormat("all");
    }
  }, [selectedCategory, selectedFormat]);

  function handleCategoryFilterChange(event) {
    const newCategory = event.target.value;

    onSelectedCategoryChange(newCategory);

    if (newCategory === "all" || selectedFormat === "all") {
      return;
    }

    const allowedFormats = formatsByCategory[newCategory];

    const formatMatchesCategory = allowedFormats.some((format) => {
      return format.value === selectedFormat;
    });

    if (!formatMatchesCategory) {
      setSelectedFormat("all");
    }
  }

  function handleFormatFilterChange(event) {
    const newFormat = event.target.value;

    setSelectedFormat(newFormat);

    if (newFormat === "all") {
      return;
    }

    for (const category in formatsByCategory) {
      const formats = formatsByCategory[category];

      const formatMatchesCategory = formats.some((format) => {
        return format.value === newFormat;
      });

      if (formatMatchesCategory) {
        onSelectedCategoryChange(category);
        return;
      }
    }
  }

  function clearFilters() {
    onSelectedCategoryChange("all");
    setSelectedFormat("all");
    setSelectedStatus("all");
    setSelectedSort("newest");
  }

  function startEditingCard(id) {
    setActiveCardAction({
      id: id,
      mode: "edit",
    });
  }

  function startDeletingCard(id) {
    setActiveCardAction({
      id: id,
      mode: "delete",
    });
  }

  function closeCardAction(id, mode) {
    setActiveCardAction((currentAction) => {
      if (currentAction === null) {
        return null;
      }

      if (
        currentAction.id === id &&
        currentAction.mode === mode
      ) {
        return null;
      }

      return currentAction;
    });
  }

  function getActiveMode(id) {
    if (activeCardAction === null) {
      return null;
    }

    if (activeCardAction.id === id) {
      return activeCardAction.mode;
    }

    return null;
  }

  function handleUpdatedMedia(updatedMedia) {
    setMediaItems((currentItems) =>
      currentItems.map((item) => {
        if (item.id === updatedMedia.id) {
          return updatedMedia;
        }

        return item;
      })
    );
  }

  async function handleDeleteMedia(id) {
    setDeletingId(id);

    try {
      const response = await authenticatedFetch(`/media/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Could not delete this item.");
      }

      setMediaItems((currentItems) =>
        currentItems.filter((item) => item.id !== id)
      );

      closeCardAction(id, "delete");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="mt-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
            Your catalog
          </p>

          <h2 className="mt-2 text-3xl font-black">Your library</h2>
        </div>

        {!message && mediaItems.length > 0 && (
          <p className="text-sm text-zinc-400">
            {sortedMediaItems.length} of {mediaItems.length} titles shown
          </p>
        )}
      </div>

      <div className="mt-5 grid gap-6 xl:grid-cols-[minmax(0,1fr)_19rem]">
        <div>
          {!message && mediaItems.length > 0 && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-semibold text-zinc-200">
                  Filter your library
                </p>

                <button
                  type="button"
                  onClick={clearFilters}
                  disabled={!hasActiveFilters}
                  className="rounded-md border border-violet-700 px-3 py-1.5 text-sm font-medium text-violet-300 transition hover:bg-violet-950 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Clear filters
                </button>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <label className="grid gap-2 text-sm">
                  <span className="text-zinc-300">Category</span>
                  <select
                    value={selectedCategory}
                    onChange={handleCategoryFilterChange}
                    className="rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 outline-none focus:border-violet-500"
                  >
                    <option value="all">All categories</option>
                    <option value="animated">Animated</option>
                    <option value="reading">Reading</option>
                    <option value="live_action">Live action</option>
                  </select>
                </label>

                <label className="grid gap-2 text-sm">
                  <span className="text-zinc-300">Format</span>
                  <select
                    value={selectedFormat}
                    onChange={handleFormatFilterChange}
                    className="rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 outline-none focus:border-violet-500"
                  >
                    <option value="all">All formats</option>

                    {formatOptions.map((format) => (
                      <option key={format.value} value={format.value}>
                        {format.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="grid gap-2 text-sm">
                  <span className="text-zinc-300">Status</span>
                  <select
                    value={selectedStatus}
                    onChange={(event) => setSelectedStatus(event.target.value)}
                    className="rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 outline-none focus:border-violet-500"
                  >
                    <option value="all">All statuses</option>
                    <option value="planned">Planned</option>
                    <option value="in_progress">In progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </label>

                <label className="grid gap-2 text-sm">
                  <span className="text-zinc-300">Sort by</span>
                  <select
                    value={selectedSort}
                    onChange={(event) => setSelectedSort(event.target.value)}
                    className="rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 outline-none focus:border-violet-500"
                  >
                    <option value="newest">Recently added</option>
                    <option value="title_ascending">Title A–Z</option>
                    <option value="title_descending">Title Z–A</option>
                    <option value="rating_high">Highest rated</option>
                    <option value="rating_low">Lowest rated</option>
                  </select>
                </label>
              </div>
            </div>
          )}

          {message && (
            <p className="mt-4 text-zinc-400" aria-live="polite">
              {message}
            </p>
          )}

          {!message && mediaItems.length === 0 && (
            <div className="mt-5 rounded-xl border border-dashed border-violet-800 bg-violet-950/20 px-6 py-12 text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-400">
                Your first title
              </p>

              <h3 className="mt-3 text-2xl font-bold">
                Your library is empty.
              </h3>

              <p className="mx-auto mt-3 max-w-md text-zinc-400">
                Add your first title to start tracking what you watch and read.
              </p>

              <button
                type="button"
                onClick={onAddTitleClick}
                className="mt-6 rounded-md bg-violet-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-700"
              >
                Add your first title
              </button>
            </div>
          )}

          {!message &&
            mediaItems.length > 0 &&
            sortedMediaItems.length === 0 && (
              <div className="mt-5 rounded-xl border border-dashed border-zinc-700 bg-zinc-900 px-6 py-12 text-center">
                <h3 className="text-2xl font-bold">
                  No titles match these filters.
                </h3>

                <p className="mx-auto mt-3 max-w-md text-zinc-400">
                  Try another category, format, or status to find titles in your
                  library.
                </p>

                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-6 rounded-md border border-violet-700 px-4 py-2 text-sm font-semibold text-violet-300 transition hover:bg-violet-950"
                >
                  Clear filters
                </button>
              </div>
            )}

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {sortedMediaItems.map((item) => (
              <MediaCard
                key={item.id}
                item={item}
                onUpdated={handleUpdatedMedia}
                onDelete={handleDeleteMedia}
                deletingId={deletingId}
                activeMode={getActiveMode(item.id)}
                onStartEditing={startEditingCard}
                onStartDeleting={startDeletingCard}
                onCloseAction={closeCardAction}
              />
            ))}
          </div>
        </div>

        <LibrarySidebar mediaItems={mediaItems} />
      </div>
    </section>
  );
}