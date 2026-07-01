"use client";

import styles from "./ResetBadge.module.scss";

interface Props {
  onClick: () => void;
}

const ResetBadge = ({ onClick }: Props) => {
  return (
    <button
      className={styles.badge}
      onClick={onClick}
      aria-label="Reset burger"
    >
      <svg
        className={styles.hexagon}
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* ── Shadow — drawn first so it sits behind ── */}
        <polygon
          points="100,10 182,55 182,145 100,190 18,145 18,55"
          fill="#1a1a1a"
          transform="translate(6, 6)"
        />

        {/* ── Pink hexagon — drawn second so it sits on top ── */}
        <polygon
          points="100,10 182,55 182,145 100,190 18,145 18,55"
          fill="#df2c8b"
          stroke="#1a1a1a"
          strokeWidth="6"
        />
      </svg>

      {/* ── Text on top of SVG ── */}
      <div className={styles.textWrapper}>
        <span className={styles.arrow}>↺</span>
        <span className={styles.text}>Reset</span>
        <span className={styles.icon}>↺</span>
      </div>
    </button>
  );
};

export default ResetBadge;
