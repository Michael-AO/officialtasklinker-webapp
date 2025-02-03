import styles from './RegisterPage.module.css';
import React from 'react';
import googleIcon from './googleiocn.png'; // Consolidated the imports
import vector3 from './vector 3.png'; // Also cleaned up unnecessary imports
import { useNavigate } from 'react-router-dom';
import { auth, googleAuthProvider } from './firebase.js'; 
import { Link } from "react-router-dom";

function RegisterPage() {
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    console.log('Google sign-in button clicked'); // Check if the button is clicked
    try {
      const result = await auth.signInWithPopup(googleAuthProvider);
      console.log('User signed in:', result.user);
      navigate('/verification'); // Redirect to the verification page after login
    } catch (error) {
      console.error('Google sign-in error:', error);
    }
  };

  return (
    <div className={styles.registerPage}>
      <div className={styles.background} />
      <div className={styles.quietyTakeNotesInContainer}>
        <p className={styles.quietyTakeNotesIn}>Quiety take-notes in the back-</p>
        <p className={styles.quietyTakeNotesIn}>ground. Allowing to take fully</p>
        <p className={styles.quietyTakeNotesIn}>engaged in the conversation</p>
      </div>
      <div className={styles.farmerWrapper}>
        <div className={styles.farmer}>Farmer</div>
      </div>
      <div className={styles.emailAddressWrapper}>
        <div className={styles.emailAddress}>Email Address</div>
      </div>
      <div className={styles.frameParent}>
        <div className={styles.michaeltasksgmailcomWrapper}>
          <div className={styles.michaeltasksgmailcom}>michaeltasks@gmail.com</div>
        </div>
        <div className={styles.phoneNumberParent}>
          <div className={styles.emailAddress}>Phone Number</div>
          <div className={styles.michaeltasksgmailcomContainer}>
            <div className={styles.michaeltasksgmailcom}>+1234567890</div>
          </div>
        </div>
      </div>
      <div className={styles.pagewrapper}>
        <div className={styles.pagecontent}>
          <div className={styles.createaccount}>
            <div className={styles.autolayout}>
              <div className={styles.pageheader}>
                <div className={styles.step2Of3Wrapper}>
                  <div className={styles.step2Of}>Step 2 of 3</div>
                </div>
                <div className={styles.registerConnectWithTasksParent}>
                  <div className={styles.registerConnect}>
                    Register & Connect with tasks, jobs, and opportunities that match your skills.
                  </div>
                  <div className={styles.rectangleParent}>
                    <div className={styles.frameChild} />
                    <div className={styles.frameChild} />
                    <div className={styles.frameInner} />
                  </div>
                </div>
              </div>
              <div className={styles.inputfileds}>
                <div className={styles.frameGroup}>
                  <div className={styles.firstNameParent}>
                    <div className={styles.emailAddress}>First name</div>
                    <div className={styles.michaelWrapper}>
                      <div className={styles.michaeltasksgmailcom}>Michael</div>
                    </div>
                  </div>
                  <div className={styles.lastNameParent}>
                    <div className={styles.emailAddress}>Last Name</div>
                    <div className={styles.michaeltasksgmailcomContainer}>
                      <div className={styles.michaeltasksgmailcom}>Doe</div>
                    </div>
                  </div>
                </div>
                <div className={styles.frameContainer}>
                  <div className={styles.frameDiv}>
                    <div className={styles.emailAddressContainer}>
                      <div className={styles.emailAddress}>Email Address</div>
                    </div>
                    <div className={styles.michaeltasksgmailcomContainer}>
                      <div className={styles.michaeltasksgmailcom}>michaeltasks@gmail.com</div>
                    </div>
                  </div>
                  <div className={styles.frameDiv}>
                    <div className={styles.emailAddress}>Phone Number</div>
                    <div className={styles.michaeltasksgmailcomContainer}>
                      <div className={styles.michaeltasksgmailcom}>+1234567890</div>
                    </div>
                  </div>
                </div>
                <div className={styles.frameParent1}>
                  <div className={styles.lastNameParent}>
                    <div className={styles.emailAddress}>Password (at least 8 characters)</div>
                    <div className={styles.michaeltasksgmailcomContainer}>
                      <div className={styles.michaeltasksgmailcom}>••••••••</div>
                    </div>
                  </div>
                  <div className={styles.lastNameParent}>
                    <div className={styles.emailAddress}>Confirm Password</div>
                    <div className={styles.michaeltasksgmailcomContainer}>
                      <div className={styles.michaeltasksgmailcom}>••••••••</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.authentication}>
              <div className={styles.createaccountBtn}>
			  <Link to="/verification" className={styles.tlbutton}>Create Account</Link>
              </div>
              <div className={styles.or}>
                <img className={styles.orChild} alt="" src={vector3} />
                <div className={styles.michaeltasksgmailcom}>or</div>
                <img className={styles.orChild} alt="" src={vector3} />
              </div>
              <button
                className={styles.google}
                onClick={handleGoogleSignIn}
                type="button" // Prevent form submission behavior
              >
                <img className={styles.vectorIcon} alt="Google Icon" src={googleIcon} />
                Continue with Google
              </button>
			  <div className={styles.alreadyHaveAnContainer}>
              <span>Already have an account?</span>
              <Link to="/login" className={styles.signIn}>Sign in</Link>
            </div>

            </div>
           
	
          </div>
        </div>
      </div>
    
    </div>
  );
}

export default RegisterPage;
