import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./authentication.module.css";
import verify from "./verifywhite.png";
import account from "./account.png";
import profile from "./pimage.png";

function Authentication() {
  const navigate = useNavigate();

  return (
    <div className={styles.createaccount}>
      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.startYourJourneyWithUsParent}>
            <div className={styles.startYourJourneyContainer}>
              <p className={styles.startYour}>Start your</p>
              <p className={styles.startYour}>journey with us</p>
            </div>
            <div className={styles.welcomeToYoure}>
              Welcome to your dashboard—your personal hub for managing tasks,
              tracking progress, and staying connected.
            </div>
          </div>
          <div className={styles.frameParent}>
            <div className={styles.frameWrapper}>
              <div
                className={styles.vectorParent}
                onClick={() => navigate("/register")} // Navigate to Register page
                style={{ cursor: "pointer" }} // Add pointer cursor
              >
                <img className={styles.vectorIcon} alt="" src={account} />
                <div className={styles.createAccount}>Create Account</div>
              </div>
            </div>
            <div className={styles.alreadyHaveAnAccountParent}>
              <div className={styles.createAccount}>{`Already have an account? `}</div>
              <div
                className={styles.login}
                onClick={() => navigate("/login")} // Navigate to Login page
                style={{ cursor: "pointer", color: "#04a466" }} // Make login clickable
              >
                Login
              </div>
            </div>
          </div>
        </div>
        <div className={styles.footer}>
          <div className={styles.content1}>
            <div className={styles.welcomeToYour1}>
              "Welcome to your dashboard—your personal hub for managing tasks,
              tracking progress, and staying connected. Easily access everything
              you need to get the job done and make the most of your experience."
            </div>
            <div className={styles.profile}>
              <img className={styles.profileIamgeIcon} alt="" src={profile} />
              <div className={styles.frameGroup}>
                <div className={styles.opeyemiMichaelAsereParent}>
                  <div className={styles.opeyemiMichaelAsere}>
                    {`Opeyemi-Michael Asere `}
                  </div>
                  <div className={styles.materialSymbolsverifiedRoun}>
                    <img className={styles.vectorIcon1} alt="" src={verify} />
                  </div>
                </div>
                <div className={styles.managerTasklinkersLtd}>
                  Manager, Tasklinkers LTD
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Authentication;