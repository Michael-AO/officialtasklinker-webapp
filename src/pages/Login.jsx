import { useCallback } from 'react';
import styles from './Login.module.css';
import React from 'react';


function Login() {
  	
  	const onSignInContainerClick = useCallback(() => {
    		// Add your code here
  	}, []);
  	
  	return (
    		<div className={styles.signIn} onClick={onSignInContainerClick}>
      			<div className={styles.background} />
      			<div className={styles.farmerWrapper}>
        				<div className={styles.farmer}>Farmer</div>
      			</div>
      			<div className={styles.total}>
        				<div className={styles.contentlgn}>
          					<div className={styles.upper}>
            						<div className={styles.headersub}>
              							<div className={styles.loginToAccess}>Login to access your account</div>
            						</div>
            						<div className={styles.welcomeBackContinue}>Welcome back! Continue where you left off.</div>
            						<div className={styles.frameParent}>
              							<div className={styles.emailAddressPhoneNumberParent}>
                								<div className={styles.emailAddress}>Email Address / Phone Number</div>
                								<div className={styles.michaeltasksgmailcomWrapper}>
                  									<div className={styles.michaeltasksgmailcom}> michaeltasks@gmail.com</div>
                								</div>
              							</div>
              							<div className={styles.passwordParent}>
                								<div className={styles.emailAddress}>{`Password `}</div>
                								<div className={styles.michaeltasksgmailcomWrapper}>
                  									<div className={styles.michaeltasksgmailcom}>xxxxxxxxxxxxx</div>
                								</div>
              							</div>
            						</div>
          					</div>
          					<div className={styles.lower}>
            						<div className={styles.loginbtn}>
              							<div className={styles.login}>Login</div>
            						</div>
            						<div className={styles.or}>
              							<img className={styles.orChild} alt="" src="Vector 3.svg" />
              							<div className={styles.michaeltasksgmailcom}>or</div>
              							<img className={styles.orChild} alt="" src="Vector 3.svg" />
            						</div>
            						<div className={styles.googlecont}>
              							<img className={styles.vectorIcon} alt="" src="Vector.svg" />
              							<div className={styles.michaeltasksgmailcom}>Continue with Google</div>
            						</div>
            						<div className={styles.dontHaveAnAccountParent}>
              							<div className={styles.michaeltasksgmailcom}>Don’t have an account?</div>
                								<div className={styles.createAccount}> Create Account</div>
                								</div>
                								</div>
                								</div>
                								</div>
                								</div>);
              							};
              							
              							export default Login;
              							