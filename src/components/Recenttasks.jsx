import React, { useEffect, useState } from 'react';
import { db, collection, getDocs } from '../firebase';
import styles from './Recenttasks.module.css';
import { Link } from "react-router-dom";
import verify from './verifieduser.png';
import JobDisplay from './JobDisplay';

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
      <JobDisplay />
           
    </div>
  );
}

export default RecentTasks;
