"use client";

// ----- Customer Login / Sign Up Page -----
// Two tabs: sign in and sign up. Uses Supabase Auth.

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import Header from "@/components/global/Header/Header";
import styles from "./AccountLogin.module.scss";

export default function AccountLogin() {
  // -- Active tab --
  const [tab, setTab] = useState<"login" | "signup">("login");

  // -- Form state --
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // -- Handle login --
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError("Wrong email or password. Try again.");
      setLoading(false);
      return;
    }

    toast.success("Welcome back! 🍔");
    window.location.href = "/account";
  };

  // -- Handle sign up --
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("We need your name!");
      return;
    }

    setLoading(true);

    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    toast.success("Account created! Welcome to Smash'd 🍔");
    window.location.href = "/account";
  };

  return (
    <div className={styles.loginPage}>
      {/* -- Header -- */}
      <div className={styles.headerWrap}>
        <Header />
      </div>

      <div className={styles.content}>
        <div className={styles.card}>
          {/* -- Tabs -- */}
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${tab === "login" ? styles.active : ""}`}
              onClick={() => { setTab("login"); setError(""); }}
            >
              Sign In
            </button>
            <button
              className={`${styles.tab} ${tab === "signup" ? styles.active : ""}`}
              onClick={() => { setTab("signup"); setError(""); }}
            >
              Sign Up
            </button>
          </div>

          {/* -- Form -- */}
          <form
            onSubmit={tab === "login" ? handleLogin : handleSignUp}
            className={styles.form}
          >
            {/* -- Name field (sign up only) -- */}
            {tab === "signup" && (
              <label className={styles.label}>
                Name
                <input
                  className={styles.input}
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </label>
            )}

            {/* -- Email -- */}
            <label className={styles.label}>
              Email
              <input
                className={styles.input}
                type="email"
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>

            {/* -- Password -- */}
            <label className={styles.label}>
              Password
              <input
                className={styles.input}
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </label>

            {/* -- Error message -- */}
            {error && <p className={styles.error}>{error}</p>}

            {/* -- Submit -- */}
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loading}
            >
              {loading
                ? "Loading..."
                : tab === "login"
                  ? "Sign In 🍔"
                  : "Create Account 🍔"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}