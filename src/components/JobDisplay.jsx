import React, { useState, useEffect } from "react";
import { db } from "../firebase";  
import { collection, onSnapshot } from "firebase/firestore";
import { Link } from "react-router-dom";
import styles from "./JobDisplay.module.css";
import verifybadge from "./material-symbols_verified-rounded.png";

function JobDisplay() {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "Tasks"), (snapshot) => {
      const jobList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setJobs(jobList);
    });

    return () => unsubscribe(); // Cleanup listener
  }, []);

  return (
    <div className={styles.jobDisplay}>
      {jobs.map((job) => (
        <Link 
          to="/apply" 
          state={{ job }} 
          key={job.id} 
          className={styles.jobCardLink} // We'll add this to your CSS
        >
          <div className={styles.jobCard}>
            <div className={styles.jobCardChild} />
            <div className={styles.jobtitleWrapper}>
              <div className={styles.jobtitle}>{job.roleName}</div>
            </div>
            <div className={styles.compensation}>Compensation</div>
            <div className={styles.jobtype}>
              <div className={styles.onsite}>{job.jobType}</div>
            </div>
            <div className={styles.ngn10000}>NGN {job.compensation}</div>
            <div className={styles.employerstagParent}>
              <div className={styles.employerstag}>
                <div className={styles.tasklinkersLtdWrapper}>
                  <div className={styles.jobtitle}>{job.employerName}</div>
                </div>
                {job.employerEmail === "asereopeyemimichael@gmail.com" && (
                  <img className={styles.materialSymbolsverifiedRounIcon} alt="Verified" src={verifybadge} />
                )}
              </div>
              <i className={styles.location}>{job.location}</i>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default JobDisplay;