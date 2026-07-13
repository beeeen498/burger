"use client";

// ----- Admin Login Page -----
// Email + password form. On success, redirects to /admin.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Header from "@/components/global/Header/Header";
import styles from "./AdminLogin.module.scss";

export default function AdminLogin() {
  const router = useRouter();

  // -- Form state --
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // -- Handle form submission --
  const handleSubmit = async (e: React.FormEvent) => {
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

    console.log("LOGIN SUCCESS");

    // -- Success — go to dashboard --
    window.location.href = "/admin";
  };

  return (
    <div className={styles.loginPage}>
      {/* Header */}
      <div className={styles.headerWrap}>
        <Header />
      </div>

      <div className={styles.adminContent}>
        {/* -- card -- */}
        <div className={styles.card}>
          <h1 className={styles.title}>Admin Login 🔐</h1>
          <p className={styles.subtitle}>Staff only beyond this point.</p>

          {/* -- Login Form -- */}
          <form onSubmit={handleSubmit} className={styles.form}>
            {/* -- Email Field -- */}
            <label className={styles.label}>
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.input}
                placeholder="chef@smashd.com"
                required
              />
            </label>

            {/* -- Password Field -- */}
            <label className={styles.label}>
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.input}
                placeholder="••••••••"
                required
              />
            </label>

            {/* -- Error Message -- */}
            {error && <p className={styles.error}>{error}</p>}

            {/* -- Submit Button -- */}
            <button type="submit" className={styles.button} disabled={loading}>
              {loading ? "Signing in..." : "Let Me Cook 🍳"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
