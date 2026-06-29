'use client'

import Header from "@/components/global/Header/Header"
import ChallengeRecordCard from "../ChallengeRecordCard/ChallengeRecordCard"
import ChallengeStats from "../ChallengeStats/ChallengeStats"
import ChallengeBurgerScene from "../ChallengeBurgerScene/ChallengeBurgerScene"
import Cta from "@/components/global/Cta/Cta"
import styles from "./ChallengePage.module.scss"

const ChallengePage = () => {
  return (
    <main className={styles.page}>

      {/* Header wrapper — local header, sticky header takes over on scroll */}
      <div className={styles.headerWrapper}>
        <Header />
      </div>

      <div className={styles.layout}>
        {/* Left — content */}
        <div className={styles.contentCol}>
          <h1 className={styles.heading}>
            Can You Beat<br />
            <span className={styles.headingAccent}>The Challenge?</span>
          </h1>
          <p className={styles.subheading}>
            20 patties. Fries & a milkshake. One hour.
          </p>
          <ChallengeRecordCard />
          <ChallengeStats />
          <Cta label="I'm Ready. Let's Talk." variant="yellow" href="/?from=challenge#contact" />
          <p className={styles.finePrint}>
            * Challengers must contact us at least 24 hours in advance — full payment required upfront — a waiver must be signed before the challenge begins.
          </p>
        </div>

        {/* Right — 3D burger scene */}
        <div className={styles.sceneCol}>
          <ChallengeBurgerScene />
        </div>
      </div>

    </main>
  )
}

export default ChallengePage