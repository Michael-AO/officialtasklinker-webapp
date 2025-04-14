import React from 'react';
import { useNavigate } from 'react-router-dom';  // Import the useNavigate hook from react-router-dom
import styles from './viewDetails.module.css';
import back from "./backicons.png";

function ViewDetails() {
    const navigate = useNavigate(); // Hook to navigate programmatically

    const handleViewApplicationsClick = () => {
        navigate('/ApplicationList'); // Navigate to /ApplicationList when the button is clicked
    };

    return (
        <div className={styles.viewDetails}>
            <div className={styles.groupParent}>
                <div className={styles.evaarrowBackFillParent}>
                    <img className={styles.evaarrowBackFillIcon} alt="" src={back} />
                    <div className={styles.back}>Back</div>
                </div>
                <div className={styles.viewApplications10Wrapper}>
                    <div 
                        className={styles.viewApplications10} 
                        onClick={handleViewApplicationsClick} // Add click handler to the button
                    >
                        View Applications (10)
                    </div>
                </div>
            </div>

            {/* Reusable component */}
            <div className={styles.viewDetailsInner}>
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
                                    <div className={styles.uxDesigner}>{`Shell Nigeria`}</div>
                                </div>
                            </div>
                            <i className={styles.badiruStrLagos}>12, Badiru Str, Lagos Island, Lagos State</i>
                        </div>
                        <div className={styles.compensationmonthParent}>
                            <div className={styles.compensationmonth}>Compensation/month</div>
                            <div className={styles.ngn10000}>NGN 10,000</div>
                        </div>
                    </div>
                    <div className={styles.aboutTheJobContainer}>
                        <p className={styles.aboutTheJob}>About the job</p>
                        <p className={styles.aboutTheJob}>Change.org is searching for a Sr. Director, Design (Head of Design)...</p>
                        <p className={styles.aboutTheJob}>We’re a social impact business (a public benefit company)...</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ViewDetails;
