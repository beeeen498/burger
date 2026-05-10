'use client'

import ChallengeBurgerScene from "../ChallengeBurgerScene/ChallengeBurgerScene"
import styles from "./ChallengePage.module.scss"

const ChallengePage = () => {
  return (
    <main className={styles.page}>
      <div className={styles.contentCol}>
        {/* content goes here */}
      </div>
      
      <div className={styles.sceneCol}>
        <ChallengeBurgerScene />
      </div>
    </main>
  )
}

export default ChallengePage