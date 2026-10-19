"use client";

/**
 * Loads the user's media library, filters and sorts visible titles,
 * and coordinates updates and deletions from individual media cards.
 */

import { useEffect, useState } from "react";
import MediaCard from "./MediaCard";

const API_URL = "http://127.0.0.1:8000";

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

export default function MediaList({ refreshKey }) {
  const [mediaItems, setMediaItems] = useState([]);
  const [message, setMessage] = useState("Loading library...");
  const [deletingId, setDeletingId] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedFormat, setSelectedFormat] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedSort, setSelectedSort] = useState("newest");

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
      if (
        firstItem.rating === null &&
        secondItem.rating === null
      ) {
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
      if (
        firstItem.rating === null &&
        secondItem.rating === null
      ) {
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

  function handleCategoryFilterChange(event) {
    const newCategory = event.target.value;

    setSelectedCategory(newCategory);

    if (newCategory === "all") {
      return;
    }

    if (selectedFormat === "all") {
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
        setSelectedCategory(category);
        return;
      }
    }
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
      const response = await fetch(`${API_URL}/media/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Could not delete this item.");
      }

      setMediaItems((currentItems) =>
        currentItems.filter((item) => item.id !== id)
      );
    } catch (error) {
      setMessage(error.message);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="mt-10">
      <h2 className="text-2xl font-semibold">Your library</h2>

      <div className="mt-4 grid gap-4 rounded-xl border border-zinc-800 bg-zinc-900 p-4 md:grid-cols-2 xl:grid-cols-4">
        <label className="grid gap-2 text-sm">
          <span className="text-zinc-300">Category</span>
          <select
            value={selectedCategory}
            onChange={handleCategoryFilterChange}
            className="rounded-md bg-zinc-800 px-3 py-2"
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
            className="rounded-md bg-zinc-800 px-3 py-2"
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
            className="rounded-md bg-zinc-800 px-3 py-2"
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
            className="rounded-md bg-zinc-800 px-3 py-2"
          >
            <option value="newest">Recently added</option>
            <option value="title_ascending">Title A–Z</option>
            <option value="title_descending">Title Z–A</option>
            <option value="rating_high">Highest rated</option>
            <option value="rating_low">Lowest rated</option>
          </select>
        </label>
      </div>

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

      {!message &&
        mediaItems.length > 0 &&
        sortedMediaItems.length === 0 && (
          <p className="mt-4 text-zinc-400">
            No titles match these filters.
          </p>
        )}

      <div className="mt-4 grid gap-3">
        {sortedMediaItems.map((item) => (
          <MediaCard
            key={item.id}
            item={item}
            onUpdated={handleUpdatedMedia}
            onDelete={handleDeleteMedia}
            deletingId={deletingId}
          />
        ))}
      </div>
    </section>
  );
}