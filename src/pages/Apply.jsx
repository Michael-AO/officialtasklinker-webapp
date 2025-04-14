import React from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import styles from './Apply.module.css';

function Apply() {
  const navigate = useNavigate();
  const location = useLocation();
  const { job } = location.state || {};

  const handleApplyClick = () => {
    navigate('/Application', { state: { job } });
  };
  

  if (!job) {
    return <div className={styles.applyForTask}>No job data found.</div>;
  }

  return (
    <div className={styles.applyForTask}>
      <div className={styles.overlay} />
      <div className={styles.applyForTask1}>
        <div className={styles.applyForTaskInner}>
          <div className={styles.buttonsParent}>
            <div className={styles.buttons}>
              <div className={styles.cancel} onClick={() => navigate(-1)}>Cancel</div>
              <div className={styles.button}>
                <div className={styles.apply} onClick={handleApplyClick}>Apply</div>
              </div>
            </div>

            <div className={styles.content}>
              <div className={styles.container} />
              <div className={styles.headercontentwrapperParent}>
                <div className={styles.headercontentwrapper}>
                  <div className={styles.frameParent}>
                    <div className={styles.uxDesignerWrapper}>
                      <div className={styles.uxDesigner}>{job.roleName}</div>
                    </div>
                    <div className={styles.onsiteWrapper}>
                      <div className={styles.cancel}>{job.jobType}</div>
                    </div>
                  </div>
                  <i className={styles.badiruStrLagos}>{job.location}</i>
                  <div className={styles.compensationmonthParent}>
                    <div className={styles.compensationmonth}>Compensation/month</div>
                    <div className={styles.ngn10000}>NGN {job.compensation}</div>
                  </div>
                  <div className={styles.headercontentwrapperInner}>
                    <div className={styles.uxDesignerWrapper}>
                      <div className={styles.uxDesigner}>{job.employerName}</div>
                    </div>
                  </div>
                </div>

                <div className={styles.aboutTheJobContainer}>
                  <p className={styles.aboutTheJob}>About the job</p>
                  <p className={styles.aboutTheJob}>
                    {job.description || "No description provided for this job."}
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Apply;
