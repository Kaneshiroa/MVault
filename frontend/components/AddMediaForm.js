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

export default function AddMediaForm({ onMediaAdded, onClose }) {
  const [category, setCategory] = useState("animated");
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const formats = formatsByCategory[category];

  function handleCategoryChange(event) {
    setCategory(event.target.value);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    const media = {
      title: formData.get("title").trim(),
      category: formData.get("category"),
      format: formData.get("format"),
      status: formData.get("status"),
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
      setCategory("animated");

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
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
            New entry
          </p>

          <h2 className="mt-2 text-2xl font-bold">Add media</h2>

          <p className="mt-2 text-sm text-zinc-400">
            Add a title to your personal collection.
          </p>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Add media panel"
            className="rounded-md border border-zinc-700 px-3 py-1 text-sm text-zinc-300 transition hover:border-violet-500 hover:text-violet-300"
          >
            Close
          </button>
        )}
      </div>

      <form className="mt-8 grid gap-5" onSubmit={handleSubmit}>
        <label className="grid gap-2">
          <span className="text-sm font-medium text-zinc-200">Title</span>
          <input
            name="title"
            required
            placeholder="Solo Leveling"
            className="rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-zinc-200">
            Category
          </span>
          <select
            name="category"
            value={category}
            onChange={handleCategoryChange}
            className="rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2.5 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30"
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
            className="rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2.5 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30"
          >
            {formats.map((format) => (
              <option key={format.value} value={format.value}>
                {format.label}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-zinc-200">Status</span>
          <select
            name="status"
            className="rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2.5 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30"
          >
            <option value="planned">Planned</option>
            <option value="in_progress">In progress</option>
            <option value="completed">Completed</option>
          </select>
        </label>

        <button
          type="submit"
          disabled={isSaving}
          className="rounded-md bg-violet-600 px-4 py-3 font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
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