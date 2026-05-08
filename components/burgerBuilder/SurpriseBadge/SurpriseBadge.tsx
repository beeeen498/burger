"use client";

import styles from "./SurpriseBadge.module.scss";

interface Props {
  onClick: () => void;
}

const SurpriseBadge = ({ onClick }: Props) => {
  return (
    <button className={styles.badge} onClick={onClick} aria-label="Surprise me">
        <svg
            className={styles.star}
            viewBox="0 0 200 200"
            xmlns="http://www.w3.org/2000/svg"
            >
            {/* ── Shadow — drawn first so it sits behind ── */}
            <polygon
                points="100,10 125,75 195,75 140,115 160,185 100,145 40,185 60,115 5,75 75,75"
                fill="#1a1a1a"
                transform="translate(6, 6)"
            />

            {/* ── Yellow star — drawn second so it sits on top ── */}
            <polygon
                points="100,10 125,75 195,75 140,115 160,185 100,145 40,185 60,115 5,75 75,75"
                fill="#f7e558"
                stroke="#1a1a1a"
                strokeWidth="6"
            />
        </svg>

      {/* ── Text on top of SVG ── */}
      <div className={styles.textWrapper}>
        <span className={styles.text}>Surprise</span>
        <span className={styles.text}>Me!</span>
      </div>
    </button>
  );
};

export default SurpriseBadge;