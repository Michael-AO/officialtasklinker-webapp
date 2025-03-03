import React, { useEffect, useState } from 'react';
import { db } from '../firebase'; // Ensure you have firebase initialized
import { collection, getDocs } from 'firebase/firestore';
import styles from './ExploreCategories.module.css';
import arrow from './downarrow.png';

function ExploreCategories() {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'jobs'));
        const jobsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setJobs(jobsData);
      } catch (error) {
        console.error('Error fetching jobs:', error);
      }
    };
    fetchJobs();
  }, []);

  return (
    <div className={styles.exploreCategories}>
      <div className={styles.frameParent}>
        <div className={styles.frameGroup}>
          <div className={styles.frameContainer}>
            <div className={styles.featuredSectionWrapper}>
              <div className={styles.featuredSection}>Featured Section</div>
            </div>
            <div className={styles.exploreCategories1}>Explore Categories</div>
          </div>
        </div>
        <div className={styles.seeAllCategoriesParent}>
          <div className={styles.frameParent3}>
            {jobs.map((job) => (
              <div key={job.id} className={styles.rectangleGroup}>
                <div className={styles.groupChild} />
                <div className={styles.compensationmonth}>Compensation/month</div>
                <div className={styles.ngn10000}>{job.salary || 'N/A'}</div>
                <div className={styles.groupDiv}>
                  <div className={styles.frameParent4}>
                    <div className={styles.uxDesignerWrapper}>
                      <div className={styles.uxDesigner}>{job.title}</div>
                    </div>
                    <div className={styles.onsiteWrapper}>
                      <div className={styles.onsite}>{job.type}</div>
                    </div>
                  </div>
                  <i className={styles.badiruStrLagos}>{job.location}</i>
                  <div className={styles.shellNigeriaWrapper}>
                    <div className={styles.uxDesigner}>{job.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className={styles.seeMore}>See more</div>
    </div>
  );
}

export default ExploreCategories;
