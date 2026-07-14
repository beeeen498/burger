"use client";

// ----- Admin Challenge Management -----
// Edit record holder, patty count, time to beat, total attempts, hall of fame.

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import styles from "./AdminChallenge.module.scss";

// -- Hall of fame entry --
interface HallOfFameEntry {
  name: string;
  time: string;
  date: string;
}

export default function AdminChallenge() {
  const [loading, setLoading] = useState(true);
  const [challengeId, setChallengeId] = useState<string | null>(null);

  // -- Form state --
  const [recordHolder, setRecordHolder] = useState("");
  const [pattyCount, setPattyCount] = useState("");
  const [timeMinutes, setTimeMinutes] = useState("");
  const [timeSeconds, setTimeSeconds] = useState("");
  const [totalAttempts, setTotalAttempts] = useState("");
  const [hallOfFame, setHallOfFame] = useState<HallOfFameEntry[]>([]);

  // -- New hall of fame entry --
  const [newName, setNewName] = useState("");
  const [newTime, setNewTime] = useState("");
  const [newDate, setNewDate] = useState("");

  // -- Fetch challenge data on mount --
  useEffect(() => {
    const fetchChallenge = async () => {
      const { data } = await supabase.from("challenge").select("*").single();

      if (data) {
        setChallengeId(data.id);
        setRecordHolder(data.record_holder_name ?? "");
        setPattyCount(data.patty_count?.toString() ?? "");
        setTotalAttempts(data.total_attempts?.toString() ?? "0");
        setHallOfFame(data.hall_of_fame ?? []);

        // -- Convert seconds to minutes:seconds --
        const totalSecs = data.time_to_beat_seconds ?? 0;
        setTimeMinutes(Math.floor(totalSecs / 60).toString());
        setTimeSeconds((totalSecs % 60).toString());
      }

      setLoading(false);
    };

    fetchChallenge();
  }, []);

  // -- Save challenge data --
  const saveChallenge = async () => {
    if (!challengeId) return;

    const mins = parseInt(timeMinutes) || 0;
    const secs = parseInt(timeSeconds) || 0;
    const totalSeconds = mins * 60 + secs;

    await supabase
      .from("challenge")
      .update({
        record_holder_name: recordHolder || null,
        patty_count: parseInt(pattyCount) || 0,
        time_to_beat_seconds: totalSeconds,
        total_attempts: parseInt(totalAttempts) || 0,
        hall_of_fame: hallOfFame,
      })
      .eq("id", challengeId);

    toast.success("Challenge updated! 🏆");
  };

  // -- Add entry to hall of fame --
  const addToHallOfFame = () => {
    if (!newName.trim() || !newTime.trim()) {
      toast.error("Name and time are required");
      return;
    }

    setHallOfFame((prev) => [
      ...prev,
      { name: newName.trim(), time: newTime.trim(), date: newDate.trim() },
    ]);

    setNewName("");
    setNewTime("");
    setNewDate("");
    toast.success("Added! Don't forget to save.");
  };

  // -- Remove entry from hall of fame --
  const removeFromHallOfFame = (index: number) => {
    setHallOfFame((prev) => prev.filter((_, i) => i !== index));
    toast.success("Removed! Don't forget to save.");
  };

  if (loading) return <p>Loading challenge...</p>;

  return (
    <div className={styles.challengePage}>
      <h2 className={styles.pageTitle}>Challenge Management 🏆</h2>

      {/* ----- Current Record ----- */}
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Current Record</h3>

        <div className={styles.fieldGrid}>
          {/* -- Record holder name -- */}
          <label className={styles.field}>
            Record Holder
            <input
              className={styles.input}
              type="text"
              placeholder="Name"
              value={recordHolder}
              onChange={(e) => setRecordHolder(e.target.value)}
            />
          </label>

          {/* -- Patty count -- */}
          <label className={styles.field}>
            Patty Count
            <input
              className={styles.input}
              type="number"
              placeholder="20"
              value={pattyCount}
              onChange={(e) => setPattyCount(e.target.value)}
            />
          </label>

          {/* -- Time to beat -- */}
          <label className={styles.field}>
            Time to Beat (min)
            <input
              className={styles.input}
              type="number"
              placeholder="43"
              value={timeMinutes}
              onChange={(e) => setTimeMinutes(e.target.value)}
            />
          </label>

          <label className={styles.field}>
            Time to Beat (sec)
            <input
              className={styles.input}
              type="number"
              placeholder="21"
              value={timeSeconds}
              onChange={(e) => setTimeSeconds(e.target.value)}
            />
          </label>

          {/* -- Total attempts -- */}
          <label className={styles.field}>
            Total Attempts
            <input
              className={styles.input}
              type="number"
              placeholder="2847"
              value={totalAttempts}
              onChange={(e) => setTotalAttempts(e.target.value)}
            />
          </label>
        </div>

        <button className={styles.saveBtn} onClick={saveChallenge}>
          Save Challenge
        </button>
      </div>

      {/* ----- Hall of Fame ----- */}
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Hall of Fame</h3>

        {/* -- Existing entries -- */}
        {hallOfFame.length === 0 ? (
          <p className={styles.empty}>No entries yet.</p>
        ) : (
          <div className={styles.hallList}>
            {hallOfFame.map((entry, i) => (
              <div key={i} className={styles.hallEntry}>
                <span className={styles.hallName}>{entry.name}</span>
                <span className={styles.hallTime}>{entry.time}</span>
                <span className={styles.hallDate}>{entry.date}</span>
                <button
                  className={styles.removeBtn}
                  onClick={() => removeFromHallOfFame(i)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* -- Add new entry -- */}
        <div className={styles.addRow}>
          <input
            className={styles.input}
            type="text"
            placeholder="Name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <input
            className={styles.input}
            type="text"
            placeholder="Time (e.g. 45:30)"
            value={newTime}
            onChange={(e) => setNewTime(e.target.value)}
          />
          <input
            className={styles.input}
            type="text"
            placeholder="Date"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
          />
          <button className={styles.addBtn} onClick={addToHallOfFame}>
            + Add
          </button>
        </div>
      </div>
    </div>
  );
}
