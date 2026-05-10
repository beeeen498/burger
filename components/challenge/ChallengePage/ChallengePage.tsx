'use client'

import ChallengeBurgerScene from "../ChallengeBurgerScene/ChallengeBurgerScene";
import ChallengeRecordCard from "../ChallengeRecordCard/ChallengeRecordCard";
import ChallengeStats from "../ChallengeStats/ChallengeStats";
import styles from "./ChallengePage.module.scss"

const ChallengePage = () => {
  return (
    <main className={styles.page}>
      <div className={styles.contentCol}>
        <ChallengeRecordCard />
        <ChallengeStats />
      </div>
      
      <div className={styles.sceneCol}>
        <ChallengeBurgerScene />
      </div>
    </main>
  )
}

export default ChallengePage