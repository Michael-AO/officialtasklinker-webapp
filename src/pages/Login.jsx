import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Login.module.css';
import dash from './dash.png';
import google from './google.png';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // Dummy login check - you can replace with real auth
    if (email && password.length >= 8) {
      // Redirect to homepage
      navigate('/');
    } else {
      alert('Please enter a valid email and password (min 8 characters)');
    }
  };

  return (
    <div className={styles.login}>
      <div className={styles.createaccount}>
        <div className={styles.groupParent}>
          <div className={styles.frameWrapper}>
            <div className={styles.rectangleParent}>
              <div className={styles.frameChild} />
              <div className={styles.logIntoYour}>{`Log into your Account `}</div>
            </div>
          </div>
          <div className={styles.footer}>
            <div className={styles.frameParent}>
              <div className={styles.frameGroup}>
                <div className={styles.frameContainer}>
                  <div className={styles.frameDiv}>
                    <div className={styles.emailAddressWrapper}>
                      <div className={styles.emailAddress}>Email Address</div>
                    </div>
                    <div className={styles.michaeltasksgmailcomWrapper}>
                      <input
                        type="email"
                        placeholder="michaeltasks@gmail.com"
                        className={styles.michaeltasksgmailcom}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <div className={styles.passwordAtLeast8CharacterParent}>
                  <div className={styles.emailAddress}>Password (at least 8 characters)</div>
                  <div className={styles.michaeltasksgmailcomWrapper}>
                    <input
                      type="password"
                      placeholder="************"
                      className={styles.michaeltasksgmailcom}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className={styles.groupWrapper}>
                <div className={styles.groupDiv}>
                  <div className={styles.loginWrapper}>
                    <button className={styles.goBackHome} onClick={handleLogin}>Login</button>
                  </div>
                  <div className={styles.vectorParent}>
                    <img className={styles.frameItem} alt="" src={dash} />
                    <div className={styles.michaeltasksgmailcom}>or</div>
                    <img className={styles.frameItem} alt="" src={dash} />
                  </div>
                  <div className={styles.googleParent}>
                    <img className={styles.googleIcon} alt="" src={google} />
                    <div className={styles.michaeltasksgmailcom}>Continue with Google</div>
                  </div>
                  <div className={styles.dontHaveAnContainer}>
                    <span>Don’t have an account?</span>
                    <span className={styles.signUp}> Sign up</span>
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.goBackHomeWrapper}>
              <div className={styles.goBackHome}>Go back Home</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
