import React, { useEffect, useState } from 'react';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import styles from './Apply.module.css';
import Reuseapplication from './Reuseapplication'; 

function Apply() {
    const [job, setJob] = useState(null);
    const [step, setStep] = useState(1); // 1 = About, 2 = Application
    const [formData, setFormData] = useState({
        experience: '',
        yearsOfExperience: '',
        reasonForApplication: ''
    });
    const navigate = useNavigate();

    useEffect(() => {
        const fetchJob = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'Jobs'));
                const jobData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
                setJob(jobData[0]); // Show first job
            } catch (error) {
                console.error('Error fetching job:', error);
            }
        };
        fetchJob();
    }, []);

    const handleSubmit = async () => {
        try {
            await addDoc(collection(db, 'Applications'), {
                userProfile: { /* Retrieve from user context or authentication */ },
                resumeDetails: { /* Retrieve uploaded resume details */ },
                applicationDetails: formData,
            });
            alert('Application submitted successfully!');
            navigate('/'); // Redirect to Home Page
        } catch (error) {
            console.error('Error submitting application:', error);
            alert('Failed to submit application');
        }
    };

    if (!job) {
        return <div>Loading...</div>;
    }

    return (
        <div className={styles.applyForTask}>
            <div className={styles.overlay} />
            <div className={styles.applyForTask1}>
                <div className={styles.bg} />
                
                {/* Navigation Buttons */}
                <div className={styles.buttongroup}>
                    <div className={styles.cancel} onClick={() => navigate('/')}>Cancel</div>
                    {step === 2 ? (
                        <>
                            <div className={styles.button} onClick={() => setStep(1)}>Back</div>
                            <div className={styles.button} onClick={handleSubmit}>Finish</div>
                        </>
                    ) : (
                        <div className={styles.button} onClick={() => setStep(2)}>Next Step</div>
                    )}
                </div>

                {/* Sidebar Navigation */}
                <div className={styles.leftBar}>
                    <div
                        className={step === 1 ? styles.aboutActive : styles.about}
                        onClick={() => setStep(1)}
                    >
                    </div>
                    <div
                        className={step === 2 ? styles.applicationActive : styles.application}
                        onClick={() => setStep(2)}
                    >
                    </div>
                </div>

                {/* Right Content (Switch between About and Application) */}
                <div className={styles.rightBar}>
                    {step === 1 ? (
                        // About Section
                        <div className={styles.reuseabout}>
                            <div className={styles.headercontentwrapper}>
                                <div className={styles.frameParent}>
                                    <div className={styles.uxDesignerWrapper}>
                                        <div className={styles.uxDesigner}>{job.roleName}</div>
                                    </div>
                                    <div className={styles.onsiteWrapper}>
                                        <div className={styles.cancel}>{job.jobType}</div>
                                    </div>
                                </div>
                                <i className={styles.badiruStrLagos}>{job.location}</i>
                                <div className={styles.compensationmonthParent}>
                                    <div className={styles.compensationmonth}>Compensation/month</div>
                                    <div className={styles.ngn10000}>{job.compensation}</div>
                                </div>
                                <div className={styles.headercontentwrapperInner}>
                                    <div className={styles.uxDesignerWrapper}>
                                        <div className={styles.uxDesigner}>{job.employerName}</div>
                                    </div>
                                </div>
                            </div>
                            <div className={styles.aboutTheJobContainer}>
                                <p className={styles.aboutTheJob}>About the job</p>
                                <p className={styles.aboutTheJob}>{job.description}</p>
                            </div>
                        </div>
                    ) : (
                        // Application Section
                        <Reuseapplication formData={formData} setFormData={setFormData} />
                    )}
                </div>
            </div>
        </div>
    );
}

export default Apply;
