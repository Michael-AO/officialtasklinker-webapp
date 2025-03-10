import React from "react";
import styles from "./openposts.module.css";
import back from './backicons.png';


function OpenPost({ task, onClose }) {
    return (
        <div className={styles.openedjob}>
            <div className={styles.back} onClick={onClose} style={{ cursor: "pointer" }}>
                <img className={styles.backicons} alt="" src={back} />
                <div className={styles.back1}>Back</div>
            </div>
            <div className={styles.content}>
                <div className={styles.innerconnect}>
                    <div className={styles.header}>
                        <div className={styles.rolenameParent}>
                            <div className={styles.rolename}>
                                <div className={styles.uxDesigner}>{task.roleName}</div>
                            </div>
                            <div className={styles.jobtype}>
                                <div className={styles.onsite}>{task.jobType || "N/A"}</div>
                            </div>
                        </div>
                        <i className={styles.location}>{task.location}</i>
                        <div className={styles.compensation}>
                            <div className={styles.compensationmonth}>Compensation/month</div>
                            <div className={styles.ngn10000}>NGN {task.compensation || "Not specified"}</div>
                        </div>
                        <div className={styles.employername}>
                            <div className={styles.rolename}>
                                <div className={styles.uxDesigner}>{task.employerName}</div>
                            </div>
                        </div>
                    </div>
                    <div className={styles.aboutTheJobContainer}>
                        <p className={styles.aboutTheJob}>About the job</p>
                        <p className={styles.aboutTheJob}>{task.description || "No description provided"}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default OpenPost;
