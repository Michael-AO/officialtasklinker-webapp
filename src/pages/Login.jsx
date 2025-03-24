import React from 'react';
import styles from './Login.module.css';
import dash from './dash.png';
import google from './google.png';

function Login() {
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
                      											<div className={styles.michaeltasksgmailcom}> michaeltasks@gmail.com</div>
                    										</div>
                  									</div>
                								</div>
                								<div className={styles.passwordAtLeast8CharacterParent}>
                  									<div className={styles.emailAddress}>Password (at least 8 characters)</div>
                  									<div className={styles.michaeltasksgmailcomWrapper}>
                    										<div className={styles.michaeltasksgmailcom}>xxxxxxxxxxxxx</div>
                  									</div>
                								</div>
              							</div>
              							<div className={styles.groupWrapper}>
                								<div className={styles.groupDiv}>
                  									<div className={styles.loginWrapper}>
                    										<div className={styles.goBackHome}>Login</div>
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
                      											</div>
                      											<div className={styles.goBackHomeWrapper}>
                        												<div className={styles.goBackHome}>Go back Home</div>
                      											</div>
                      											</div>
                      											</div>
                      											</div>);
                    										};
                    										
                    										export default Login;
                    										