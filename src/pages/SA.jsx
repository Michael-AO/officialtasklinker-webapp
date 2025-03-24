import React from "react";
import next from './Nextnav.png';
import radio from './radiobutton.png';
import uncheck from './uncheck.png';
import styles from './SA.module.css';

function SA() {
    return (
        <div className={styles.reuseblecomp}>
            <div className={styles.frameContainer}>
                <div className={styles.radiobuttonParent}>
                    <img className={styles.radiobuttonIcon} alt="" src={radio} />
                    <div className={styles.frameDiv}>
                        <div className={styles.personalAccountParent}>
                            <div className={styles.personalAccount}>{`Personal Account `}</div>
                            <div className={styles.idealForIndividuals}>Ideal for individuals looking to manage personal tasks, track their own projects, or explore the platform for individual needs.</div>
                        </div>
                        <div className={styles.idealForIndividuals}>
                            <ul className={styles.jobApplicationsTracking}>
                                <li className={styles.jobApplications}>{`Job Applications & Tracking – Apply for jobs easily and track application status in one place.`}</li>
                            </ul>
                            <p className={styles.blankLine}>&nbsp;</p>
                            <ul className={styles.jobApplicationsTracking}>
                                <li>Personalized Job Recommendations – Get tailored job suggestions based on skills, experience, and preferences.</li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className={styles.uncheckParent} style={{ opacity: 0.5, pointerEvents: 'none' }}>
                    <img className={styles.radiobuttonIcon} alt="" src={uncheck} />
                    <div className={styles.frameDiv}>
                        <div className={styles.personalAccountParent}>
                            <div className={styles.personalAccount}>{`Corporate Account `}</div>
                            <div className={styles.idealForIndividuals}>Ideal for individuals looking to manage personal tasks, track their own projects, or explore the platform for individual needs.</div>
                        </div>
                        <div className={styles.idealForIndividuals}>
                            <ul className={styles.jobApplicationsTracking}>
                                <li className={styles.jobApplications}>{`Job Applications & Tracking – Apply for jobs easily and track application status in one place.`}</li>
                            </ul>
                            <p className={styles.blankLine}>&nbsp;</p>
                            <ul className={styles.jobApplicationsTracking}>
                                <li>Personalized Job Recommendations – Get tailored job suggestions based on skills, experience, and preferences.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SA;
