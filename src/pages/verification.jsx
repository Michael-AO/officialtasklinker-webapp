import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './verification.module.css';
import check from './check.png';
import verify from './verifywhite.png';
import profile from './pimage.png';
import email from './email.png'

function Verification() {
    const navigate = useNavigate();

    return (
        <div className={styles.footer}>
            <div className={styles.verificationPeopel}>
                <div className={styles.frameParent}>
                    <div className={styles.verificationCompleteParent}>
                    <img className={styles.checkIcon} alt="" src={email} />
                        <div className={styles.verificationComplete}>{`Check your email to complete verification and login! `}</div>
                       
                    </div>
                    <div className={styles.frameWrapper}>
                        {/* Login button linked to /login */}
                        <div className={styles.loginWrapper} onClick={() => navigate('/login')} style={{ cursor: 'pointer' }}>
                            <div className={styles.login}>{`Login! `}</div>
                        </div>
                    </div>
                </div>
                <div className={styles.footerParent}>
                    <div className={styles.footer1}>
                        <div className={styles.content}>
                            <div className={styles.welcomeToYour}>
                                Welcome to your dashboard—your personal hub for managing tasks, tracking progress, and staying connected.
                            </div>
                        </div>
                    </div>
                    <div className={styles.profile}>
                        <img className={styles.pimageIcon} alt="" src={profile} />
                        <div className={styles.frameGroup}>
                            <div className={styles.opeyemiMichaelAsereParent}>
                                <div className={styles.opeyemiMichaelAsere}>{`Opeyemi-Michael Asere `}</div>
                                <img className={styles.verifywhiteIcon} alt="" src={verify} />
                            </div>
                            <div className={styles.managerTasklinkersLtd}>Manager, Tasklinkers LTD</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Verification;
