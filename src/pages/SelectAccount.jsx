import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './SelectAccount.module.css';
import next from './Nextnav.png';
import SA from './SA';
import RegisterAccount from './RegisterAccount';
import Verification from './verification';

function SelectAccount() {
    const [step, setStep] = useState(1);
    const navigate = useNavigate();

    const handleStepChange = (newStep) => {
        if (newStep < step) {
            setStep(newStep);
        }
    };

    const handleAccountCreation = () => {
        setStep(3); // Move to the verification step
    };

    const renderComponent = () => {
        switch (step) {
            case 1:
                return <SA setStep={setStep} />;
            case 2:
                return <RegisterAccount onCreateAccount={handleAccountCreation} />;
            case 3:
                return <Verification />;
            default:
                return <SA setStep={setStep} />;
        }
    };

    return (
        <div className={styles.registercontain}>
            <div className={styles.createaccount}>
                <div className={styles.frameParent}>
                    <div className={styles.frameGroup}>
                        {/* Step 1: Select Account */}
                        <div 
                            className={styles.rectangleParent} 
                            onClick={() => handleStepChange(1)} 
                            style={{ cursor: 'pointer' }}
                        >
                            <div 
                                className={styles.rateStep} 
                                style={{ color: step >= 1 ? '#04A466' : 'white' }}
                            >
                                Select Account
                            </div>
                        </div>

                        <img className={styles.nextnavIcon} alt="" src={next} />

                        {/* Step 2: Register Account */}
                        <div 
                            className={styles.rectangleParent} 
                            onClick={() => handleStepChange(2)} 
                            style={{ cursor: 'pointer' }}
                        >
                            <div 
                                className={styles.rateStep} 
                                style={{ color: step >= 2 ? '#04A466' : 'white' }}
                            >
                                Register Account
                            </div>
                        </div>

                        <img className={styles.nextnavIcon} alt="" src={next} />

                        {/* Step 3: Verify Account */}
                        <div className={styles.rectangleParent}>
                            <div 
                                className={styles.rateStep} 
                                style={{ color: step >= 3 ? '#04A466' : 'white' }}
                            >
                                Verify Account
                            </div>
                        </div>
                    </div>

                    {/* Render current step component */}
                    {renderComponent()}

                    <div className={styles.frameParent2}>
                        <div className={styles.goBackHomeWrapper} onClick={() => navigate('/')}> 
                            <div className={styles.goBackHome}>Go back Home</div>
                        </div>

                        {/* Previous Button */}
                        {step > 1 && step !== 3 && (
                            <div className={styles.frameWrapper}>
                                <div className={styles.frameWrapper1}>
                                    <div
                                        className={styles.goBackHomeWrapper}
                                        onClick={() => setStep((prev) => Math.max(prev - 1, 1))}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <div className={styles.goBackHome}>Previous</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Next Button only on Step 1 */}
                        {step === 1 && (
                            <div className={styles.frameWrapper}>
                                <div className={styles.frameWrapper1}>
                                    <div
                                        className={styles.goBackHomeWrapper}
                                        onClick={() => setStep((prev) => Math.min(prev + 1, 3))}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <div className={styles.goBackHome}>Next</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SelectAccount;
