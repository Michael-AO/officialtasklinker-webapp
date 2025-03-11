import React, { useState, useEffect } from "react";
import styles from "./postedupdate.module.css";
import { db, auth } from "../firebase";
import { collection, query, where, onSnapshot, doc, setDoc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import down from "./down.png";

function PostU() {
    const [tasks, setTasks] = useState([]);
    const [totalCompleted, setTotalCompleted] = useState(0);
    const [applications, setApplications] = useState({});

    useEffect(() => {
        let unsubscribeTasks, unsubscribeApplications;

        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            if (!user) return;

            const tasksRef = collection(db, "Tasks");
            const q = query(tasksRef, where("userId", "==", user.uid));

            unsubscribeTasks = onSnapshot(q, async (tasksSnapshot) => {
                const tasksList = tasksSnapshot.docs.map((docSnapshot) => ({
                    id: docSnapshot.id,
                    ...docSnapshot.data(),
                }));

                tasksList.forEach(async (task) => await addTaskToJobs(task));

                setTasks(tasksList);
                setTotalCompleted(tasksList.filter((task) => task.status === "completed").length);

                if (tasksList.length > 0) {
                    fetchApplications(tasksList.map((task) => task.id));
                }
            });
        });

        const fetchApplications = (taskIds) => {
            if (taskIds.length === 0) return;

            const applicationsRef = collection(db, "Applications");
            const applicationsQuery = query(applicationsRef, where("taskId", "in", taskIds));

            unsubscribeApplications = onSnapshot(applicationsQuery, (applicationsSnapshot) => {
                const appsData = {};
                applicationsSnapshot.docs.forEach((doc) => {
                    const app = doc.data();
                    appsData[app.taskId] = (appsData[app.taskId] || 0) + 1;
                });

                setApplications(appsData);
            });
        };

        return () => {
            if (unsubscribeTasks) unsubscribeTasks();
            if (unsubscribeApplications) unsubscribeApplications();
            unsubscribeAuth();
        };
    }, []);

    const addTaskToJobs = async (task) => {
        const jobRef = doc(db, "Jobs", task.id);
        const jobSnap = await getDoc(jobRef);

        if (!jobSnap.exists()) {
            await setDoc(jobRef, task);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.containerChild} />
            <div className={styles.postandapply}>
                <div className={styles.headercontent}>
                    <div className={styles.frameParent}>
                        <div className={styles.totalNoOfPostsParent}>
                            <div className={styles.totalNoOf}>Total No of Posts:</div>
                            <div className={styles.div}>{tasks.length}</div>
                        </div>
                        <div className={styles.totalNoCompletedParent}>
                            <div className={styles.totalNoOf}>Total No Completed:</div>
                            <div className={styles.div}>{String(totalCompleted).padStart(2, "0")}</div>
                        </div>
                    </div>
                    <div className={styles.frameGroup}>
                        <div className={styles.posts2Wrapper}>
                            <div className={styles.offered}>Posts ({tasks.length})</div>
                        </div>
                        <div className={styles.offeredWrapper}>
                            <div className={styles.offered}>Offered</div>
                        </div>
                    </div>
                </div>

                <div className={styles.content}>
                    <div className={styles.sortgroup}>
                        <div className={styles.sortByRelevanceParent}>
                            <div className={styles.offered}>Sort By: Relevance</div>
                            <img alt="" src={down} />
                        </div>
                        <div className={styles.sortByRelevanceParent}>
                            <div className={styles.offered}>Filter: Remote</div>
                            <img alt="" src={down} />
                        </div>
                    </div>

                    <div className={styles.applicationgrid}>
                        {tasks.length > 0 ? (
                            tasks.map((task) => (
                                <div key={task.id} className={styles.postapplicant}>
                                    <div className={styles.frameContainer}>
                                        <div className={styles.frameDiv}>
                                            <div className={styles.rolenameParent}>
                                                <div className={styles.rolename}>{task.roleName || "Job Title"}</div>
                                                <div className={styles.onsiteWrapper}>
                                                    <div className={styles.onsite}>{task.jobType || "Onsite"}</div>
                                                </div>
                                            </div>
                                            <div className={styles.viewDetailsParent}>
                                                <div className={styles.offered}>View details</div>
                                                <img alt="" src={down} />
                                            </div>
                                        </div>
                                        <div className={styles.lowdetails}>
                                            <div className={styles.fullTimeParent}>
                                                <div className={styles.fullTime}>{task.jobType || "Full Time"}</div>
                                                <i className={styles.badiruStrLagos}>{task.location || "Location"}</i>
                                            </div>
                                            <div className={styles.numberofapply}>
                                                <div className={styles.application10}>
                                                    Applications ({applications[task.id] || 0})
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className={styles.noTasks}>No posted tasks found</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PostU;
