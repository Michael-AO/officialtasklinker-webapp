import React, { useEffect, useState } from 'react';
import { db, collection, getDocs } from '../pages/firebase'; // adjust the path to where your firebase.js is located
import styles from './Recenttasks.module.css';

function RecentTasks() {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    // Fetch jobs from Firestore
    const fetchJobs = async () => {
      try {
        const jobsCollection = collection(db, 'Jobs');
        const jobSnapshot = await getDocs(jobsCollection);
        const jobList = jobSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setJobs(jobList);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      }
    };
    fetchJobs();
  }, []);

  return (
    <div className={styles.recentTasks}>
      <div className={styles.sectionLabelRt}>
        <div className={styles.recentTasks1}>Recent Tasks</div>
      </div>
      <div className={styles.recentTasks2}>Recent Tasks – What’s New!</div>
      <div className={styles.jobDisplay}>
        {jobs.map((job) => (
          <div key={job.id} className={styles.jobCard}>
            <div className={styles.jobCardChild} />
            <div className={styles.compensationmonth}>Compensation/month</div>
            <div className={styles.frameParent}>
              <div className={styles.uxDesignerWrapper}>
                <div className={styles.uxDesigner}>{job.roleName}</div>
              </div>
              <div className={styles.onsiteWrapper}>
                <div className={styles.onsite}>{job.jobType}</div>
              </div>
            </div>
            <i className={styles.badiruStrLagos}>{job.location}</i>
            <div className={styles.ngn10000}>NGN {job.compensation}</div>
            <div className={styles.shellNigeriaWrapper}>
              <div className={styles.uxDesigner}>{job.employerName}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RecentTasks;
