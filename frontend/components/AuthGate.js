"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export default function AuthGate({ children }) {
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mode, setMode] = useState("sign_in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      const { data, error } = await supabase.auth.getSession();

      if (!isMounted) {
        return;
      }

      if (error) {
        setErrorMessage(error.message);
      } else {
        setSession(data.session);
      }

      setIsLoading(false);
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  function switchMode(nextMode) {
    setMode(nextMode);
    setMessage("");
    setErrorMessage("");
    setPassword("");
    setConfirmPassword("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setErrorMessage("");

    if (mode === "sign_up" && password !== confirmPassword) {
      setErrorMessage("Your passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    if (mode === "sign_up") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) {
        setErrorMessage(error.message);
      } else if (!data.session) {
        setMessage(
          "Check your email to confirm your account, then come back and sign in."
        );
      } else {
        setMessage("Your account is ready.");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMessage(error.message);
      }
    }

    setIsSubmitting(false);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    setEmail("");
    setPassword("");
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 text-zinc-300">
        Loading MVault…
      </main>
    );
  }

  if (session) {
    return (
      <AuthContext.Provider
        value={{
          userEmail: session.user.email ?? "Signed-in user",
          onSignOut: handleSignOut,
        }}
      >
        {children}
      </AuthContext.Provider>
    );
  }

  const isSignUp = mode === "sign_up";

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 py-12 text-zinc-100">
      <section className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/70 p-7 shadow-2xl shadow-black sm:p-9">
        <div className="mb-8">
          <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-violet-800 text-sm font-black text-white">
            MV
          </div>

          <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-400">
            Media tracker
          </p>

          <h1 className="mt-3 text-3xl font-black tracking-tight">
            {isSignUp ? "Create your vault." : "Welcome back."}
          </h1>

          <p className="mt-3 text-sm leading-6 text-zinc-400">
            {isSignUp
              ? "Create an account to start building your personal library."
              : "Sign in to continue tracking your favorite titles."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <label className="block text-sm font-medium text-zinc-200">
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
              className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-violet-500"
              placeholder="you@example.com"
            />
          </label>

          <label className="block text-sm font-medium text-zinc-200">
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete={isSignUp ? "new-password" : "current-password"}
              minLength="6"
              required
              className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-violet-500"
              placeholder="At least 6 characters"
            />
          </label>

          {isSignUp && (
            <label className="block text-sm font-medium text-zinc-200">
              Confirm password
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                autoComplete="new-password"
                minLength="6"
                required
                className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-violet-500"
                placeholder="Enter your password again"
              />
            </label>
          )}

          {errorMessage && (
            <p
              className="rounded-lg border border-red-900/80 bg-red-950/30 px-3 py-2 text-sm text-red-300"
              role="alert"
            >
              {errorMessage}
            </p>
          )}

          {message && (
            <p className="rounded-lg border border-emerald-900/80 bg-emerald-950/30 px-3 py-2 text-sm text-emerald-300">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-violet-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-violet-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting
              ? "Please wait…"
              : isSignUp
                ? "Create account"
                : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-400">
          {isSignUp ? "Already have an account?" : "New to MVault?"}{" "}
          <button
            type="button"
            onClick={() => switchMode(isSignUp ? "sign_in" : "sign_up")}
            className="font-semibold text-violet-300 transition hover:text-violet-200"
          >
            {isSignUp ? "Sign in" : "Create an account"}
          </button>
        </p>
      </section>
    </main>
  );
}