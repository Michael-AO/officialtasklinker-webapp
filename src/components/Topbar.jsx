import React from "react";
import styles from "./Topbar.module.css"
import next from './next.png';

function Topbar() {
    return (
<>
<div className={styles.dashboardheader}>
          					<div className={styles.contentwrapper}>
            						<div className={styles.opeyemisDashboard}>
              							<p className={styles.opeyemis}>Opeyemi’s</p>
              							<p className={styles.opeyemis}>Dashboard</p>
            						</div>
            						<div className={styles.profilecompletion}>
              							<div className={styles.completeYourProfileParent}>
                								<div className={styles.completeYourProfile}>Complete your profile</div>
                								<img className={styles.vectorIcon} alt="" src={next} />
              							</div>
              							<div className={styles.div}>60%</div>
              							<div className={styles.profilecompletionChild} />
              							<div className={styles.profilecompletionItem} />
            						</div>
            						<div className={styles.welcomeToYour}>{`Welcome to your dashboard—your personal hub for managing tasks, tracking progress, and staying connected. `}</div>
          					</div>
        				</div>
</>
    )
}
 export default Topbar;