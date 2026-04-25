import { forwardRef, useImperativeHandle, useState } from "react";
import { motion } from "framer-motion";
import type { Ingredient } from "./ingredients";
import styles from "./IngredientLabel.module.scss";

export interface IngredientLabelHandle {
  setVisible: (v: boolean) => void;
}

interface Props {
  ingredient: Ingredient;
  // Length of the connecting line in px
  lineLength?: number;
}

const IngredientLabel = forwardRef<IngredientLabelHandle, Props>(
  ({ ingredient, lineLength = 60 }, ref) => {
    const [visible, setVisible] = useState(false);

    useImperativeHandle(ref, () => ({ setVisible }));

    return (
      <motion.div
        className={styles.wrapper}
        initial={{ opacity: 0, x: -120 }}
        animate={visible ? { opacity: 1, x: 0 } : { opacity: 0, x: -120 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Connecting line from mesh to label */}
        <svg
          className={styles.line}
          width={lineLength}
          height="2"
          viewBox={`0 0 ${lineLength} 2`}
          overflow="visible"
        >
          <line
            x1="0"
            y1="1"
            x2={lineLength}
            y2="1"
            stroke="#1a1a1a"
            strokeWidth="1.5"
            strokeDasharray="4 3"
          />
          {/* Dot at the mesh end */}
          <circle cx="0" cy="1" r="3" fill={ingredient.color} stroke="#1a1a1a" strokeWidth="1.5" />
        </svg>

        {/* Label card */}
        <div
          className={styles.label}
          style={{ borderLeftColor: ingredient.color }}
        >
          <span className={styles.name}>{ingredient.label}</span>
          <span className={styles.description}>{ingredient.description}</span>
        </div>
      </motion.div>
    );
  }
);

IngredientLabel.displayName = "IngredientLabel";
export default IngredientLabel;