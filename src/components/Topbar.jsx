import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase"; // Ensure Firebase Firestore is properly imported
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import styles from "./Topbar.module.css";
import next from "./next.png";

function Topbar() {
  const [userName, setUserName] = useState("Tasklinker"); // Default name

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = doc(db, "users", user.uid); // Assuming Firestore collection is "users"
        const userSnap = await getDoc(userRef);

        if (userSnap.exists() && userSnap.data().firstName) {
          setUserName(userSnap.data().firstName);
        } else {
          setUserName("Tasklinker"); // Default if no firstName found
        }
      } else {
        setUserName("Tasklinker"); // Default if user is not logged in
      }
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, []);

  return (
    <div className={styles.dashboardheader}>
      <div className={styles.contentwrapper}>
        <div className={styles.opeyemisDashboard}>
          <p className={styles.opeyemis}>{userName}’s</p>
          <p className={styles.opeyemis}>Dashboard</p>
        </div>
        <div className={styles.profilecompletion}>
          <div className={styles.completeYourProfileParent}>
            <div className={styles.completeYourProfile}>Keep track with our job board</div>
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
  );
}

export default Topbar;
