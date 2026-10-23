"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "./AuthGate";

export default function AccountMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const { userEmail, onSignOut } = useAuth();

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  async function handleSignOut() {
    setIsOpen(false);
    await onSignOut();
  }

  const accountInitial = userEmail.charAt(0).toUpperCase();

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((currentValue) => !currentValue)}
        aria-label="Open account menu"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-ultramarine-700 bg-ultramarine-950 text-sm font-black text-ultramarine-200 transition hover:border-ultramarine-500 hover:bg-ultramarine-900"
      >
        {accountInitial}
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-64 rounded-xl border border-zinc-700 bg-zinc-900 p-2 shadow-xl shadow-black"
        >
          <p className="truncate px-3 py-2 text-sm text-zinc-300">
            {userEmail}
          </p>

          <div className="my-1 border-t border-zinc-800" />

          <button
            type="button"
            role="menuitem"
            onClick={handleSignOut}
            className="w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-red-300 transition hover:bg-red-950/40 hover:text-red-200"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}