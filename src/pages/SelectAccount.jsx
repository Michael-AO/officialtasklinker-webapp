import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './SelectAccount.module.css';

function SelectAccount() {
    const navigate = useNavigate();
    const [selectedAccount, setSelectedAccount] = useState('personal');

    return (
        <div className={styles.selectaccount}>
            <div className={styles.stepcountParent}>
                <div className={styles.stepcount}>
                    <div className={styles.step1Of3Wrapper}>
                        <div className={styles.step1Of}>Step 1 of 3</div>
                    </div>
                    <div className={styles.selectAccountParent}>
                        <div className={styles.selectAccount}>Select Account</div>
                        <div className={styles.rectangleParent}>
                            <div className={styles.frameChild} />
                            <div className={styles.frameItem} />
                            <div className={styles.frameItem} />
                        </div>
                    </div>
                </div>
                <div className={styles.accouttypes}>
                    <div
                        className={`${styles.rectangleGroup} ${selectedAccount === 'personal' ? styles.selected : ''}`}
                        onClick={() => setSelectedAccount('personal')}
                    >
                        <input type="radio" name="accountType" className={styles.radiobtn} checked={selectedAccount === 'personal'} readOnly />
                        <div className={styles.personalAccountParent}>
                            <div className={styles.personalAccount}>Personal Account</div>
                            <div className={styles.idealForIndividuals}>
                                Ideal for individuals looking to manage personal tasks, track their own projects, or explore the platform for individual needs.
                            </div>
                        </div>
                    </div>
                    <div className={styles.accouttypesInner}>
                        <div className={styles.rectangleContainer}>
                            <input type="radio" name="accountType" disabled />
                            <div className={styles.companyParent}>
                                <div className={styles.personalAccount}>Company</div>
                                <div className={styles.idealForIndividuals}>
                                    Perfect for teams and businesses to collaborate, delegate tasks, and manage projects with advanced team features.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className={styles.buttons}>
                <div className={styles.backbtn} onClick={() => navigate('/')}>Back</div>
                <div className={styles.nextbtn} onClick={() => navigate('/registerpage')}>Next</div>
            </div>
        </div>
    );
};

export default SelectAccount;
