import React, { useEffect, useState } from "react";
import Vector from "./vector.png";
import styles from "./ApplicationReuseable.module.css";
import vector2 from "./Vector.png";
import vector3 from "./Vector.png";
import vector4 from "./Vector.png";
import vector5 from "./Vector.png";
import vector from "./Vector.png";
import vector1 from "./Vector.PNG";
import { db, collection, getDocs } from '../firebase';

function Application() {
    const [applications, setApplications] = useState([]);
    const [totalApproved, setTotalApproved] = useState(0);
    
    useEffect(() => {
        const fetchApplications = async () => {
            try {
                const applicationsCollection = collection(db, 'Applications');
                const applicationSnapshot = await getDocs(applicationsCollection);
                const applicationsList = applicationSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                
                // Count approved applications
                const approvedCount = applicationsList.filter(app => app.status === 'approved').length;
                
                setApplications(applicationsList);
                setTotalApproved(approvedCount);
            } catch (error) {
                console.error("Error fetching applications:", error);
            }
        };
        fetchApplications();
    }, []);

    return (
        <>
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

                    <div className={styles.filterAnd}>
                        <div className={styles.filtering}>
                            <div className={styles.div2}>
                                <div className={styles.textWrapper4}>Sort By: Relevance</div>
                                <img className={styles.vector} alt="Vector" src={vector1} />
                            </div>

                            <div className={styles.div2}>
                                <div className={styles.textWrapper4}>Filter: Remote</div>
                                <img className={styles.vector} alt="Vector" src={vector} />
                            </div>
                        </div>

                        <div className={styles.applicationsGrid}>
                            <div className={styles.gridWrapper}>
                                {applications.map((application) => (
                                    <div key={application.id} className={styles.application}>
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
                                                <p className={styles.p}>
                                                    {application.location || "12, Badiru Str, Lagos Island, Lagos State"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="text-wrapper-8">See more</div>
            </div>
        </>
    );
}

export default Application;