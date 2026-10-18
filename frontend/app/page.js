"use client";
import MediaList from "../components/MediaList";
import AddMediaForm from "../components/AddMediaForm";
import { useState } from "react";

export default function Home() {

  const [libraryVersion, setLibraryVersion] = useState(0);

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-12 text-zinc-100">
      <section className="mx-auto max-w-4xl">
        <h1 className="text-4xl font-bold">Media Vault</h1>
        <p className="mt-2 text-zinc-400">
          Track everything you watch and read.
        </p>
        <AddMediaForm
          onMediaAdded={() => setLibraryVersion((current) => current + 1)}
        />
        <MediaList refreshKey={libraryVersion} />
      </section>
    </main>
  );
}