import React, { useEffect, useState } from "react";
import { auth } from "../firebase"; // Ensure Firebase is properly configured
import styles from "./Topbar.module.css";
import next from "./next.png";

function Topbar() {
  const [userName, setUserName] = useState("Tasklinker"); // Default name

  useEffect(() => {
    const user = auth.currentUser; // Get signed-in user
    if (user && user.displayName) {
      const firstName = user.displayName.split(" ")[0]; // Extract first name
      setUserName(firstName);
    }
  }, []);

  return (
    <>
      <div className={styles.dashboardheader}>
        <div className={styles.contentwrapper}>
          <div className={styles.opeyemisDashboard}>
            <p className={styles.opeyemis}>{userName}’s</p>
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
          <div className={styles.welcomeToYour}>
            Welcome to your dashboard—your personal hub for managing tasks, tracking progress, and staying connected.
          </div>
        </div>
      </div>
    </>
  );
}

export default Topbar;
