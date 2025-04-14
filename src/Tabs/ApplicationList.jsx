import React, { useState } from 'react';
import styles from './ApplicationList.module.css';
import List from './List';
import Applicantdata from './ApplicantData';

function ApplicationList() {
  const [selectedApplicant, setSelectedApplicant] = useState(null);  // Track selected applicant

  const handleApplicantSelect = (applicant) => {
    setSelectedApplicant(applicant);  // Update state with selected applicant
  };

  const onSelectApplicantContainerClick = () => {
    console.log("Applicant container clicked from parent");
    // Handle your logic here
  };

  return (
    <div className={styles.applicationlist}>
      <div className={styles.overlay} />
      <div className={styles.applyForTask}>
        <div className={styles.bg} />
        <div className={styles.frameParent}>
          <div className={styles.frameGroup}>
            <div className={styles.frameContainer}>
              <div className={styles.frameDiv}>
                <div className={styles.uxDesignerWrapper}>
                  <div className={styles.uxDesigner}>UX Designer</div>
                </div>
                <div className={styles.onsiteWrapper}>
                  <div className={styles.onsite}>Onsite</div>
                </div>
              </div>
              <div className={styles.frameWrapper}>
                <div className={styles.uxDesignerWrapper}>
                  <div className={styles.uxDesigner}>Shell Nigeria</div>
                </div>
              </div>
              <i className={styles.badiruStrLagos}>12, Badiru Str, Lagos Island, Lagos State</i>
            </div>
            <div className={styles.compensationmonthParent}>
              <div className={styles.compensationmonth}>Compensation/month</div>
              <div className={styles.ngn10000}>NGN 10,000</div>
            </div>
          </div>

          <div className={styles.rightBar}>
            <div className={styles.container}>
              {selectedApplicant ? (
                <Applicantdata applicant={selectedApplicant} onSelect={onSelectApplicantContainerClick} />
              ) : (
                <List onSelect={handleApplicantSelect} />
              )}
            </div>
		
          </div>
        </div>
      </div>
    </div>
  );
}

export default ApplicationList;
