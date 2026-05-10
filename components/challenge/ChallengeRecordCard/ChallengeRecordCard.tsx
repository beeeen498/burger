'use client'

import { useEffect, useState } from "react";
import styles from "./ChallengeRecordCard.module.scss";

const RECORD_DATA = {
  initials:    "J.D.",
  fullName:    "Jamie Davidson",
  time:        "43:21",
  date:        "March 14, 2024",
  recordSetAt: "2024-03-14T00:00:00Z",
};

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

const ChallengeRecordCard = () => {
  const recordAge = useRecordAge(RECORD_DATA.recordSetAt);

  return (
    <div className={styles.card}>

      {/* Trophy placeholder — replace with 3D canvas later */}
      <div className={styles.trophy}>
        <span className={styles.trophyIcon}>🏆</span>
        <span className={styles.trophyLabel}>CHAMP</span>
      </div>

      {/* Record info */}
      <div className={styles.info}>
        <span className={styles.header}>Current Record Holder</span>
        <span className={styles.initials}>{RECORD_DATA.initials}</span>
        <span className={styles.name}>{RECORD_DATA.fullName}</span>
        <div className={styles.time}>
          <span className={styles.timeValue}>{RECORD_DATA.time}</span>
          <span className={styles.timeSuffix}>min</span>
        </div>
        <span className={styles.date}>{RECORD_DATA.date}</span>
        <span className={styles.age}>
          Record standing for <strong>{recordAge}</strong> days
        </span>
      </div>

    </div>
  );
};

export default ChallengeRecordCard;