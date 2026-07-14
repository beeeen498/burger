'use client'

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import styles from "./ChallengeRecordCard.module.scss";

// -- Challenge data from Supabase --
interface ChallengeData {
  record_holder_name: string | null;
  time_to_beat_seconds: number;
  created_at: string;
}

// -- Hook to count days since record was set --
function useRecordAge(isoDate: string) {
  const [days, setDays] = useState(0);

  useEffect(() => {
    const update = () => {
      const diff = Date.now() - new Date(isoDate).getTime();
      setDays(Math.floor(diff / (1000 * 60 * 60 * 24)));
    };
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, [isoDate]);

  return days;
}

// -- Convert seconds to "MM:SS" format --
function formatTime(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

// -- Get initials from full name --
function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join(".")
    .toUpperCase() + ".";
}

const ChallengeRecordCard = () => {
  const [data, setData] = useState<ChallengeData | null>(null);
  const recordAge = useRecordAge(data?.created_at ?? new Date().toISOString());

  // -- Fetch challenge data --
  useEffect(() => {
    const fetch = async () => {
      const { data: challenge } = await supabase
        .from("challenge")
        .select("record_holder_name, time_to_beat_seconds, created_at")
        .single();

      if (challenge) setData(challenge);
    };

    fetch();

    // -- Realtime updates --
    const channel = supabase
      .channel("challenge-record")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "challenge" },
        () => fetch()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (!data || !data.record_holder_name) return null;

  return (
    <div className={styles.card}>

      {/* Trophy placeholder */}
      <div className={styles.trophy}>
        <span className={styles.trophyIcon}>🏆</span>
        <span className={styles.trophyLabel}>CHAMP</span>
      </div>

      {/* Record info */}
      <div className={styles.info}>
        <span className={styles.header}>Current Record Holder</span>
        <span className={styles.initials}>{getInitials(data.record_holder_name)}</span>
        <span className={styles.name}>{data.record_holder_name}</span>
        <div className={styles.time}>
          <span className={styles.timeValue}>{formatTime(data.time_to_beat_seconds)}</span>
          <span className={styles.timeSuffix}>min</span>
        </div>
        <span className={styles.age}>
          Record standing for <strong>{recordAge}</strong> days
        </span>
      </div>

    </div>
  );
};

export default ChallengeRecordCard;