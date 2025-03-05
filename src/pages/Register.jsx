import NavBar from '../components/Navbar';
import styles from './Register.module.css';
import React, { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";

function Register() {
  const [selectedAccount, setSelectedAccount] = useState("personal");
  const navigate = useNavigate(); // Hook to navigate back

  return (
    <div className={styles.selectAccount}>
      <div className={styles.wrapper}>
        <div className={styles.background} />
        <div className={styles.background1} />

        <div className={styles.cardWrapper}>
          {/* Personal Account Card */}
          <div 
            className={`${styles.cardSelection} ${selectedAccount === "personal" ? styles.active : ""}`}
            onClick={() => setSelectedAccount("personal")}
          >
            <input
              type="radio"
              name="accountType"
              value="personal"
              checked={selectedAccount === "personal"}
              onChange={() => setSelectedAccount("personal")}
              className={styles.radioButton}
            />
            <div className={styles.cardContent}>
              <div className={styles.personalAccount}>Personal Account</div>
              <div className={styles.idealForIndividuals}>
                Ideal for individuals looking to manage personal tasks, track their own projects, or explore the platform for individual needs.
              </div>
            </div>
          </div>
        </div>

        <div className={styles.cardWrapperInactive}>
          {/* Company Account Card (Disabled) */}
          <div className={`${styles.cardSelection} ${styles.disabled}`}>
            <input
              type="radio"
              name="accountType"
              value="company"
              disabled
              className={styles.radioButton}
            />
            <div className={styles.cardContent}>
              <div className={styles.personalAccount}>Company</div>
              <div className={styles.idealForIndividuals}>
                Ideal for individuals looking to manage company-wide projects, assign tasks, and collaborate as a team.
              </div>
            </div>
          </div>
        </div>

        {/* Back and Next Buttons */}
        <div className={styles.buttonContainer}>
          <button className={styles.tlButton} onClick={() => navigate("/")}>
            Back
          </button>
          <Link to="/registerpage" className={styles.tlbutton}>
            Next
          </Link>
        </div>

        <div className={styles.stepCount}>
          <div className={styles.step1Of}>Step 1 of 3</div>
        </div>

        <div className={styles.selectAccount1}>Select Account</div>

        <div className={styles.progressBar}>
          <div className={styles.progressBarChild} />
          <div className={styles.progressBarItem} />
          <div className={styles.progressBarItem} />
        </div>
      </div>
    </div>
  );
}

export default Register;
