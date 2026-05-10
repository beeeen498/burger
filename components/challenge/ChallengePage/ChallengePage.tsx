'use client'

import ChallengeBurgerScene from "../ChallengeBurgerScene/ChallengeBurgerScene";
import ChallengeRecordCard from "../ChallengeRecordCard/ChallengeRecordCard";
import styles from "./ChallengePage.module.scss"

const ChallengePage = () => {
  return (
    <main className={styles.page}>
      <div className={styles.contentCol}>
        <ChallengeRecordCard />
      </div>
      
      <div className={styles.sceneCol}>
        <ChallengeBurgerScene />
      </div>
    </main>
  )
}

export default ChallengePage