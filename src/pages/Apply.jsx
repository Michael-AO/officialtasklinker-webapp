import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import styles from './Apply.module.css';
import cancel from './cancel.png';
import Reuseapplication from './Reuseapplication';

function Apply() {
    const [step, setStep] = useState(1);
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    // Check if user is authenticated on component mount
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            if (currentUser) {
                setUser(currentUser);
            } else {
                setUser(null);
            }
        });
        return () => unsubscribe(); // Cleanup the listener
    }, []);

    // State to store all application data
    const [applicationData, setApplicationData] = useState({
        experience: '',
        years: '',
        whyPick: '',
        roleName: "UX Designer",
        employerName: "Shell Nigeria",
        location: "Lagos, Nigeria",
        compensation: "NGN 10,000",
    });

    // Function to update state from child component
    const updateApplicationData = (field, value) => {
        setApplicationData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleNextStep = () => setStep(2);
    const handleBackStep = () => setStep(1);
    const handleCancel = () => navigate('/');

    const handleSubmitApplication = async () => {
        if (!user) {
            alert("You need to register before applying. Redirecting...");
            navigate('/register');  // Redirect to the register page
            return;
        }

        try {
            console.log("Submitting application for:", user.uid);
            console.log("Final application data:", applicationData);

            const finalApplication = {
                ...applicationData,
                userId: user.uid,
                status: "pending",
                timestamp: new Date(),
            };

            await addDoc(collection(db, "Applications"), finalApplication);
            alert("Application submitted successfully!");
            navigate('/');  // Redirect to home after submission
        } catch (error) {
            console.error("Error submitting application:", error);
            alert("Failed to submit application. Try again later.");
        }
    };

    return (
        <div className={styles.applyForTask}>
            <div className={styles.overlay} />
            <div className={styles.applyForTask1}>
                <div className={styles.bg} />
                <div className={styles.fullForm}>
                    <div className={styles.content}>
                        <div className={styles.basebg} />

                        {step === 1 ? (
                            <div className={styles.reuseabout}>
                                <div className={styles.headercontentwrapper}>
                                    <div className={styles.frameParent}>
                                        <div className={styles.uxDesignerWrapper}>
                                            <div className={styles.uxDesigner}>UX Designer</div>
                                        </div>
                                        <div className={styles.onsiteWrapper}>
                                            <div className={styles.onsite}>Onsite</div>
                                        </div>
                                    </div>
                                    <i className={styles.badiruStrLagos}>12, Badiru Str, Lagos Island, Lagos State</i>
                                    <div className={styles.compensationmonthParent}>
                                        <div className={styles.compensationmonth}>Compensation/month</div>
                                        <div className={styles.ngn10000}>NGN 10,000</div>
                                    </div>
                                    <div className={styles.headercontentwrapperInner}>
                                        <div className={styles.uxDesignerWrapper}>
                                            <div className={styles.uxDesigner}>{`Shell Nigeria `}</div>
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.aboutTheJobContainer}>
                                    <p className={styles.aboutTheJob}>About the job</p>
                                    <p className={styles.aboutTheJob}>
                                        Change.org is searching for a Sr. Director, Design (Head of Design) to lead and create a more powerful Product Design organization with a focus on quality, process, and empowerment.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <Reuseapplication applicationData={applicationData} updateApplicationData={updateApplicationData} />
                        )}
                    </div>

                    {/* Buttons */}
                    <div className={styles.buttonContainer}>
                        {step === 1 ? (
                            <button className={styles.nextStep} onClick={handleNextStep}>Next</button>
                        ) : (
                            <>
                                <button className={styles.nextStep} onClick={handleBackStep}>Back</button>
                                <button className={styles.nextStep} onClick={handleSubmitApplication}>Submit Application</button>
                            </>
                        )}
                    </div>
                </div>

                {/* Step Indicator */}
                <div className={styles.stepCount}>
                    <div className={styles.step}>
                        <div className={styles.aboutTask}>About Task</div>
                        <div className={`${styles.stepBar} ${step >= 1 ? styles.filled : ''}`} />
                    </div>
                    <div className={styles.step}>
                        <div className={styles.aboutTask}>Application</div>
                        <div className={`${styles.stepBar} ${step === 2 ? styles.filled : ''}`} />
                    </div>
                </div>

                {/* Cancel Button */}
                <img className={styles.cancelIcon} alt="Cancel" src={cancel} onClick={handleCancel} />
            </div>
        </div>
    );
}

export default Apply;
