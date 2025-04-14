import styles from './contentApply.module.css';
import down from "./down.png";
import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { collection, query, where, onSnapshot, doc, setDoc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import ViewDetails from './viewDetails';

function ContentApply() {
    const [tasks, setTasks] = useState([]);
    const [applications, setApplications] = useState({});
    const [selectedTask, setSelectedTask] = useState(null); // 👈 track which task to view

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
        <>
            <div className={styles.content}>
                {/* If selectedTask exists, render ViewDetails */}
                {selectedTask ? (
                    <ViewDetails 
                        task={selectedTask} 
                        goBack={() => setSelectedTask(null)} // pass a goBack handler
                    />
                ) : (
                    <>
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
                                                <div 
                                                    className={styles.viewDetailsParent}
                                                    onClick={() => setSelectedTask(task)} // 👈 set the selected task
                                                >
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
                    </>
                )}
            </div>
        </>
    );
}

export default ContentApply;
