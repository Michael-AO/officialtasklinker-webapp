import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion"; // Import framer-motion
import { db, doc, getDoc } from "../firebase";
import styles from "./Applyfortask.module.css";

function ApplyForTask() {
  const { jobId } = useParams();
  const [jobDetails, setJobDetails] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const jobDoc = doc(db, "Jobs", jobId);
        const jobSnapshot = await getDoc(jobDoc);
        if (jobSnapshot.exists()) {
          setJobDetails(jobSnapshot.data());
        } else {
          console.log("No such job!");
        }
      } catch (error) {
        console.error("Error fetching job details:", error);
      }
    };

    if (jobId) {
      fetchJobDetails();
    }
  }, [jobId]);

  if (!jobDetails) {
    return <div>Loading...</div>;
  }

  const handleCancel = () => {
    if (location.state?.fromExplore) {
      navigate("/explore");
    } else {
      navigate("/");
    }
  };

  return (
    <div className={styles.applyForTask}>
      {/* Keep overlay static */}
      <div className={styles.overlay} />

      {/* Animate only the content */}
      <motion.div
        className={styles.applyForTask1}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -30 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <div className={styles.bg} />
        <div className={styles.cancelParent}>
          <div
            className={styles.cancel}
            onClick={handleCancel}
            style={{ cursor: "pointer" }}
          >
            Cancel
          </div>
          <div className={styles.button}>
            <div className={styles.nextStep}>Next Step</div>
          </div>
        </div>
        <div className={styles.rightBar}>
          <div className={styles.rightContent} />
          <div className={styles.aboutTask}>About task</div>
          <div className={styles.headercontentwrapper}>
            <div className={styles.frameParent}>
              <div className={styles.uxDesignerWrapper}>
                <div className={styles.uxDesigner}>{jobDetails.roleName}</div>
              </div>
              <div className={styles.onsiteWrapper}>
                <div className={styles.cancel}>Onsite</div>
              </div>
            </div>
            <i className={styles.badiruStrLagos}>{jobDetails.location}</i>
            <div className={styles.compensationmonthParent}>
              <div className={styles.compensationmonth}>Compensation/month</div>
              <div className={styles.ngn10000}>
                NGN {jobDetails.compensation}
              </div>
            </div>
            <div className={styles.headercontentwrapperInner}>
              <div className={styles.uxDesignerWrapper}>
                <div className={styles.uxDesigner}>
                  {jobDetails.employerName}
                </div>
              </div>
            </div>
          </div>
          <div className={styles.aboutTheJobContainer}>
            <p className={styles.aboutTheJob}>{jobDetails.jobDescription}</p>
          </div>
        </div>
        <div className={styles.leftBar}>
          <div className={styles.leftBarChild} />
          <div className={styles.about}>
            <img className={styles.vectorIcon} alt="" src="Vector.svg" />
            <div className={styles.nextStep}>About task</div>
          </div>
          <img className={styles.leftBarItem} alt="" src="Vector 8.svg" />
          <div className={styles.application}>
            <div className={styles.applicationChild} />
            <div className={styles.nextStep}>Application</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default ApplyForTask;
