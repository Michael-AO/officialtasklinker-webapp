import React, { useEffect, useState } from 'react';
import { db, collection, getDocs } from '../firebase';
import styles from './Recenttasks.module.css';
import { Link } from "react-router-dom";

function RecentTasks() {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
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
<div className={styles.displaywrapper}>

{jobs.map((job) => (
        <Link 
          key={job.id}
          to={`/Apply`} // Pass job ID in the URL
          className={styles.jobDisplay}
        >
          <div className={styles.jobCard}>
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
        </Link>
      ))}


</div>
     
    </div>
  );
}

export default RecentTasks;
