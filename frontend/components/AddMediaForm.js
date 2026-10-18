"use client";

import { useState } from "react";

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

export default function AddMediaForm({ onMediaAdded }) {
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
      const response = await fetch(`${API_URL}/media/`, {
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

      setMessage(`Added ${createdMedia.title} to your library.`);
      form.reset();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="mt-10 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
      <h2 className="text-2xl font-semibold">Add media</h2>

      <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
        <label className="grid gap-2">
          <span>Title</span>
          <input
            name="title"
            required
            placeholder="Solo Leveling"
            className="rounded-md bg-zinc-800 px-3 py-2"
          />
        </label>

        <label className="grid gap-2">
          <span>Category</span>
          <select
            name="category"
            value={category}
            onChange={handleCategoryChange}
            className="rounded-md bg-zinc-800 px-3 py-2"
          >
            <option value="animated">Animated</option>
            <option value="reading">Reading</option>
            <option value="live_action">Live action</option>
          </select>
        </label>

        <label className="grid gap-2">
          <span>Format</span>
          <select
            name="format"
            className="rounded-md bg-zinc-800 px-3 py-2"
          >
            {formats.map((format) => (
              <option key={format.value} value={format.value}>
                {format.label}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2">
          <span>Status</span>
          <select
            name="status"
            className="rounded-md bg-zinc-800 px-3 py-2"
          >
            <option value="planned">Planned</option>
            <option value="in_progress">In progress</option>
            <option value="completed">Completed</option>
          </select>
        </label>

        <button
          type="submit"
          disabled={isSaving}
          className="rounded-md bg-emerald-500 px-4 py-2 font-medium text-black disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? "Adding..." : "Add to library"}
        </button>

        {message && (
          <p className="text-sm text-emerald-400" aria-live="polite">
            {message}
          </p>
        )}
      </form>
    </section>
  );
}