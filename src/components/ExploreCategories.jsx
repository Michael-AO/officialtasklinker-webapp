import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";  // Import useNavigate
import { db } from "../firebase";  
import { collection, onSnapshot } from "firebase/firestore";
import styles from "./ExploreCategories.module.css";
import vuser from "./vblack.png";  
import verifybadge from "./material-symbols_verified-rounded.png";  

function ExploreCategories() {
  const [jobs, setJobs] = useState([]);
  const navigate = useNavigate(); // Initialize navigation

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

  const handleJobClick = (job) => {
    navigate("/apply", { state: { job } }); // Pass job data to Apply page
  };

  return (
    <div className={styles.fullexplore}>
      <div className={styles.explorecontent}>
        <div className={styles.headercontent}>
          <div className={styles.explorecontent}>
            <div className={styles.exploreheader}>
              <div className={styles.featuredSectionWrapper}>
                <div className={styles.featuredSection}>Featured Section</div>
              </div>
              <div className={styles.exploreCategories}>Explore Categories</div>
            </div>
          </div>
        </div>

        {/* Jobs Section */}
        <div className={styles.jobs}>
          <div className={styles.jobDisplay}>
            {jobs.map((job) => (
              <div 
                key={job.id} 
                className={styles.jobCard} 
                onClick={() => handleJobClick(job)} // Click event
                style={{ cursor: "pointer" }} // Make it look clickable
              >
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
            ))}
          </div>
        </div>
      </div>
      <div className={styles.seeMore}>See more</div>
    </div>
  );
}

export default ExploreCategories;
