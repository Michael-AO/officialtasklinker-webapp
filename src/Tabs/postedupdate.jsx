import React, { useState, useEffect } from "react";
import styles from "./postedupdate.module.css";
import { db, auth } from "../firebase";
import { collection, query, where, onSnapshot, doc, setDoc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import ContentApply from "./contentApply";

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
                            <div className={styles.offered}>Closed</div>
                        </div>
                    </div>
                </div>

                <ContentApply />

            </div>
        </div>
    );
}

export default PostU;
