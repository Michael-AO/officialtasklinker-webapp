import React, { useEffect, useState } from "react";
import Vector from "./vector.png";
import styles from "./Postedtasks.module.css";
import { db, auth } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import OpenPost from "./openpost";

function PostedTasks() {
    const [tasks, setTasks] = useState([]);
    const [selectedTask, setSelectedTask] = useState(null);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const user = auth.currentUser;
                if (!user) {
                    console.log("No user logged in.");
                    return;
                }

                const tasksRef = collection(db, "Tasks");
                const q = query(tasksRef, where("userId", "==", user.uid));
                const taskSnapshot = await getDocs(q);

                const tasksList = taskSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                setTasks(tasksList);
            } catch (error) {
                console.error("Error fetching posted tasks:", error);
            }
        };

        fetchTasks();
    }, []);

    return (
        <div className={styles.applicationReusable}>
            <div className={styles.frame}>
                {/* Task Summary */}
                <div className={styles.statusBar}>
                    <div className={styles.div}>
                        <div className={styles.textWrapper}>Total No of Posted Tasks:</div>
                        <div className={styles.textWrapper}>{tasks.length}</div>
                    </div>
                </div>

                {/* Tabs for Navigation */}
                <div className={styles.wrapperTab}>
                    <div className={styles.activeTab}>
                        <div className={styles.textWrapper3}>Posted Tasks ({tasks.length})</div>
                    </div>
                    <div className={styles.inactiveTab}>
                        <div className={styles.textWrapper4}>Completed</div>
                    </div>
                </div>

                {/* Show OpenPost if a job is selected */}
                {selectedTask ? (
                    <OpenPost task={selectedTask} onClose={() => setSelectedTask(null)} />
                ) : (
                    <div className={styles.applicationsGrid}>
                        <div className={styles.gridWrapper}>
                            {tasks.length > 0 ? (
                                tasks.map((task) => (
                                    <div 
                                        key={task.id} 
                                        className={styles.application} 
                                        onClick={() => setSelectedTask(task)} // Set selected task
                                        style={{ cursor: "pointer" }}
                                    >
                                        <div className={styles.applicationWrapper}>
                                            <div className={styles.wrapperContent}>
                                                <div className={styles.topNextLine}>
                                                    <div className={styles.topContent}>
                                                        <div className={styles.textWrapper5}>
                                                            {task.roleName || "Task Title"}
                                                        </div>
                                                        <div className={styles.div2}>
                                                            <div className={styles.textWrapper6}>View details</div>
                                                            <img className={styles.img} alt="Vector" src={Vector} />
                                                        </div>
                                                    </div>
                                                    <div className={styles.textWrapper7}>
                                                        {task.employerName || "Employer Name"}
                                                    </div>
                                                </div>
                                                <p className={styles.p}>
                                                    {task.location || "Location not specified"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className={styles.noApplications}>No tasks posted</p>
                            )}
                        </div> 
                    </div>
                )}
            </div>
        </div>
    );
}

export default PostedTasks;
