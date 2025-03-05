import React from "react";
import styles from './RegisterP.module.css';
import google from './google.png';
import line from './Vector 3.png';

function RegisterP() {
  return (
    <div className={styles.registerpage}>
      <div className={styles.stepcountParent}>
        <div className={styles.stepcount}>
          <div className={styles.step2Of3Wrapper}>
            <div className={styles.step2Of}>Step 2 of 3</div>
          </div>
          <div className={styles.registerConnectWithTasksParent}>
            <div className={styles.registerConnect}>
              {`Register & Connect with tasks, jobs, and opportunities that match your skills.`}
            </div>
            <div className={styles.rectangleParent}>
              <div className={styles.frameChild} />
              <div className={styles.frameChild} />
              <div className={styles.frameInner} />
            </div>
          </div>
        </div>

        <div className={styles.frameParent}>
          <div className={styles.frameGroup}>
            <div className={styles.inputfieldParent}>
              
              {/* First Name */}
              <div className={styles.inputfield}>
                <label className={styles.firstName}>First Name</label>
                <input type="text" className={styles.inputContainer} placeholder="Michael" />
              </div>

              {/* Last Name */}
              <div className={styles.inputfield}>
                <label className={styles.firstName}>Last Name</label>
                <input type="text" className={styles.inputContainer} placeholder="Last Name" />
              </div>
            </div>

            <div className={styles.frameContainer}>
              
              {/* Email Address */}
              <div className={styles.inputfield}>
                <label className={styles.firstName}>Email Address</label>
                <input type="email" className={styles.inputContainer} placeholder="michaeltasks@gmail.com" />
              </div>

              {/* Phone Number */}
              <div className={styles.inputfield}>
                <label className={styles.firstName}>Phone Number</label>
                <input type="tel" className={styles.inputContainer} placeholder="Enter phone number" />
              </div>
            </div>

            <div className={styles.frameParent1}>
              
              {/* Password */}
              <div className={styles.inputfield}>
                <label className={styles.firstName}>Password (at least 8 characters)</label>
                <input type="password" className={styles.inputContainer} placeholder="********" />
              </div>

              {/* Confirm Password */}
              <div className={styles.inputfield}>
                <label className={styles.firstName}>Confirm Password</label>
                <input type="password" className={styles.inputContainer} placeholder="********" />
              </div>
            </div>
          </div>

          <div className={styles.groupParent}>
            <div className={styles.groupDiv}>
              <button className={styles.createAccountWrapper}>
                <div className={styles.Button}>Create Account</div>
              </button>

              <div className={styles.vectorParent}>
                <img className={styles.vectorIcon} alt="" src={line} />
                <div className={styles.michael}>or</div>
                <img className={styles.vectorIcon} alt="" src={line} />
              </div>

              <button className={styles.googleParent}>
                <img className={styles.googleIcon} alt="" src={google} />
                <div className={styles.michael}>Continue with Google</div>
              </button>

              <div className={styles.alreadyHaveAnContainer}>
                <span>Already have an account?</span>
                <span className={styles.signIn}> Sign in</span>
              </div>
            </div>

            <div className={styles.backbtn}>
              <button className={styles.createAccount}>Back</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterP;
