import React, { useEffect, useState } from "react";
import Vector from "./vector.png";
import styles from "./ApplicationReuseable.module.css";
import { db, auth } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import OpenApply from "./openapply"; // Updated component

function Application() {
    const [applications, setApplications] = useState([]);
    const [totalApproved, setTotalApproved] = useState(0);
    const [selectedApplication, setSelectedApplication] = useState(null); // Track selected application

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                const user = auth.currentUser;
                if (!user) return;

                const applicationsRef = collection(db, "Applications");
                const q = query(applicationsRef, where("userId", "==", user.uid));
                const applicationSnapshot = await getDocs(q);

                const applicationsList = applicationSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                const approvedCount = applicationsList.filter(app => app.status === "approved").length;

                setApplications(applicationsList);
                setTotalApproved(approvedCount);
            } catch (error) {
                console.error("Error fetching applications:", error);
            }
        };

        fetchApplications();
    }, []);

    return (
        <div className={styles.applicationReusable}>
            <div className={styles.frame}>
                <div className={styles.statusBar}>
                    <div className={styles.div}>
                        <div className={styles.textWrapper}>Total No of Applications:</div>
                        <div className={styles.textWrapper}>{applications.length}</div>
                    </div>
                    <div className={styles.div}>
                        <div className={styles.textWrapper}>Total No Approved:</div>
                        <div className={styles.textWrapper2}>{String(totalApproved).padStart(2, '0')}</div>
                    </div>
                </div>

                <div className={styles.wrapperTab}>
                    <div className={styles.activeTab}>
                        <div className={styles.textWrapper3}>Applications ({applications.length})</div>
                    </div>
                    <div className={styles.inactiveTab}>
                        <div className={styles.textWrapper4}>Completed</div>
                    </div>
                </div>

                {/* Show OpenApply if an application is selected */}
                {selectedApplication ? (
                    <OpenApply application={selectedApplication} onClose={() => setSelectedApplication(null)} />
                ) : (
                    <div className={styles.applicationsGrid}>
                        <div className={styles.gridWrapper}>
                            {applications.length > 0 ? (
                                applications.map((application) => (
                                    <div 
                                        key={application.id} 
                                        className={styles.application} 
                                        onClick={() => setSelectedApplication(application)} // Set selected application
                                        style={{ cursor: "pointer" }}
                                    >
                                        <div className={styles.applicationWrapper}>
                                            <div className={styles.wrapperContent}>
                                                <div className={styles.topNextLine}>
                                                    <div className={styles.topContent}>
                                                        <div className={styles.textWrapper5}>{application.roleName || "UX Designer"}</div>
                                                        <div className={styles.div2}>
                                                            <div className={styles.textWrapper6}>View details</div>
                                                            <img className={styles.img} alt="Vector" src={Vector} />
                                                        </div>
                                                    </div>
                                                    <div className={styles.textWrapper7}>{application.employerName || "Shell Nigeria"}</div>
                                                </div>
                                                <p className={styles.p}>{application.location || "Lagos, Nigeria"}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className={styles.noApplications}>No applications found</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Application;
