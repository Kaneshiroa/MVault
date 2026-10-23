"use client";

/**
 * Collects a title's basic information and creates it in the library.
 * It is displayed inside the dashboard's Add media drawer.
 */

import { useState } from "react";
import { authenticatedFetch } from "../lib/api";

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

function getMediaTypeLabel(mediaType) {
  const labels = {
    movie: "Movie",
    tv: "Series",
    anime: "Anime",
    manga: "Manga",
  };

  return labels[mediaType] ?? "Title";
}

export default function AddMediaForm({ onMediaAdded, onClose }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("animated");
  const [format, setFormat] = useState("anime");
  const [message, setMessage] = useState("");
  const [searchMessage, setSearchMessage] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const formats = formatsByCategory[category];

  function handleCategoryChange(event) {
    const nextCategory = event.target.value;

    setCategory(nextCategory);
    setFormat(formatsByCategory[nextCategory][0].value);
  }

  function handleTitleChange(event) {
    setTitle(event.target.value);
    setSelectedResult(null);
  }

  async function handleSearch() {
    const query = title.trim();

    if (query.length < 2) {
      setSearchMessage("Enter at least two characters to search TMDB.");
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setSearchMessage("");
    setSearchResults([]);
    setSelectedResult(null);

    try {
      const response = await authenticatedFetch(
        `/metadata/search?query=${encodeURIComponent(query)}`
      );

      if (!response.ok) {
        throw new Error("Could not search TMDB. Please try again.");
      }

      const data = await response.json();

      if (data.results.length === 0) {
        setSearchMessage(
          "No TMDB results found. You can still add this title manually."
        );
        return;
      }

      setSearchResults(data.results);
    } catch (error) {
      setSearchMessage(error.message);
    } finally {
      setIsSearching(false);
    }
  }

  function chooseSearchResult(result) {
    setTitle(result.title);
    setSelectedResult(result);
    setSearchResults([]);

    if (result.source === "anilist") {
      if (result.media_type === "anime") {
        setCategory("animated");
        setFormat("anime");
      } else if (result.media_type === "manga") {
        setCategory("reading");
        setFormat("manga");
      }
    }

    setSearchMessage(
      `Selected ${result.title}. Its artwork will be saved with this title.`
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    const media = {
      title: title.trim(),
      category,
      format,
      status: formData.get("status"),
      poster_url: selectedResult?.poster_url ?? null,
      backdrop_url: selectedResult?.backdrop_url ?? null,
      metadata_source: selectedResult?.source ?? null,
      metadata_id: selectedResult?.source_id ?? null,
    };

    setIsSaving(true);
    setMessage("");

    try {
      const response = await authenticatedFetch("/media/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(media),
      });

      if (!response.ok) {
        throw new Error("Could not add media. Please try again.");
      }

      const createdMedia = await response.json();

      onMediaAdded();
      form.reset();
      setTitle("");
      setCategory("animated");
      setFormat("anime");
      setSearchResults([]);
      setSearchMessage("");
      setSelectedResult(null);

      if (onClose) {
        onClose();
      } else {
        setMessage(`Added ${createdMedia.title} to your library.`);
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ultramarine-400">
            New entry
          </p>

          <h2 className="mt-2 text-2xl font-bold">Add media</h2>

          <p className="mt-2 text-sm text-zinc-400">
            Search TMDB for artwork, or add any title manually.
          </p>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Add media panel"
            className="rounded-md border border-zinc-700 px-3 py-1 text-sm text-zinc-300 transition hover:border-ultramarine-500 hover:text-ultramarine-300"
          >
            Close
          </button>
        )}
      </div>

      <form className="mt-8 grid gap-5" onSubmit={handleSubmit}>
        <div className="grid gap-2">
          <label
            htmlFor="media-title"
            className="text-sm font-medium text-zinc-200"
          >
            Title
          </label>

          <div className="flex gap-2">
            <input
              id="media-title"
              name="title"
              required
              value={title}
              onChange={handleTitleChange}
              placeholder="Solo Leveling"
              className="min-w-0 flex-1 rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-ultramarine-500 focus:ring-2 focus:ring-ultramarine-500/30"
            />

            <button
              type="button"
              onClick={handleSearch}
              disabled={isSearching}
              className="shrink-0 rounded-md border border-ultramarine-600 px-3 py-2 text-sm font-semibold text-ultramarine-300 transition hover:bg-ultramarine-950 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSearching ? "Searching..." : "Search TMDB"}
            </button>
          </div>
        </div>

        {searchMessage && (
          <p className="text-sm text-zinc-400" aria-live="polite">
            {searchMessage}
          </p>
        )}

        {searchResults.length > 0 && (
          <div className="rounded-lg border border-zinc-700 bg-zinc-950 p-3">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-ultramarine-400">
              Choose a result
            </p>

            <div className="grid max-h-64 gap-2 overflow-y-auto pr-1">
              {searchResults.map((result) => (
                <button
                  key={`${result.source}-${result.source_id}`}
                  type="button"
                  onClick={() => chooseSearchResult(result)}
                  className="flex items-center gap-3 rounded-md p-2 text-left transition hover:bg-zinc-800"
                >
                  {result.poster_url ? (
                    <img
                      src={result.poster_url}
                      alt=""
                      className="h-16 w-11 rounded object-cover"
                    />
                  ) : (
                    <div className="flex h-16 w-11 items-center justify-center rounded bg-ultramarine-950 text-[10px] font-bold uppercase text-ultramarine-300">
                      {result.media_type}
                    </div>
                  )}

                  <span className="min-w-0">
                    <span className="block truncate font-semibold text-zinc-100">
                      {result.title}
                    </span>

                    <span className="mt-1 block text-xs capitalize text-zinc-400">
                      {getMediaTypeLabel(result.media_type)}
                      {result.release_year
                        ? ` · ${result.release_year}`
                        : ""}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <label className="grid gap-2">
          <span className="text-sm font-medium text-zinc-200">
            Category
          </span>

          <select
            name="category"
            value={category}
            onChange={handleCategoryChange}
            className="rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2.5 outline-none focus:border-ultramarine-500 focus:ring-2 focus:ring-ultramarine-500/30"
          >
            <option value="animated">Animated</option>
            <option value="reading">Reading</option>
            <option value="live_action">Live action</option>
          </select>
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-zinc-200">Format</span>

          <select
            name="format"
            value={format}
            onChange={(event) => setFormat(event.target.value)}
            className="rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2.5 outline-none focus:border-ultramarine-500 focus:ring-2 focus:ring-ultramarine-500/30"
          >
            {formats.map((formatOption) => (
              <option key={formatOption.value} value={formatOption.value}>
                {formatOption.label}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-zinc-200">Status</span>

          <select
            name="status"
            className="rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2.5 outline-none focus:border-ultramarine-500 focus:ring-2 focus:ring-ultramarine-500/30"
          >
            <option value="planned">Planned</option>
            <option value="in_progress">In progress</option>
            <option value="completed">Completed</option>
          </select>
        </label>

        <button
          type="submit"
          disabled={isSaving}
          className="rounded-md bg-ultramarine-600 px-4 py-3 font-semibold text-white transition hover:bg-ultramarine-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? "Adding..." : "Add to library"}
        </button>

        {message && (
          <p className="text-sm text-red-400" aria-live="polite">
            {message}
          </p>
        )}
      </form>
    </section>
  );
}