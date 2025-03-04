import NavBar from '../components/Navbar';
import styles from './Register.module.css';
import React from 'react';
import { Link } from "react-router-dom";
import Vector from './verivector.png'

function Register() {
  	return (
    		<div className={styles.selectAccount}>

                <div className={styles.wrapper}>
      			<div className={styles.background} />
      			<div className={styles.background1} />
      			{/* <div className={styles.navBar}>
        				<div className={styles.navBarBg} />
        				<div className={styles.navMenu}>
          					<div className={styles.navMenuInner}>
            						<div className={styles.navLinksParent}>
              							<div className={styles.navLinks}>
                								<div className={styles.home}>Home</div>
                								<div className={styles.exploreTasks}>Explore tasks</div>
                								<div className={styles.exploreTasks}>Sign in</div>
              							</div>
              							<div className={styles.button}>
                								<div className={styles.createAccount}>Create Account</div>
              							</div>
            						</div>
          					</div>
          					<div className={styles.logo}>
            						<img className={styles.logomarkIcon} alt="" src="logomark.svg" />
            						<img className={styles.wordmarkIcon} alt="" src="wordmark.svg" />
          					</div>
        				</div>
      			</div> */}
                {/* <NavBar /> */}
      			<div className={styles.cardWrapper}>
        				<div className={styles.cardSelection}>
          					<img className={styles.vectorIcon} alt="" src={Vector} />
          					<div className={styles.cardContent}>
            						<div className={styles.personalAccount}>{`Personal Account `}</div>
            						<div className={styles.idealForIndividuals}>Ideal for individuals looking to manage personal tasks, track their own projects, or explore the platform for individual needs.</div>
          					</div>
        				</div>
      			</div>
      			<div className={styles.cardWrapperInactive}>
        				<div className={styles.cardSelection}>
          					<img className={styles.vectorIcon} alt="" src={Vector} />
          					<div className={styles.cardContent}>
            						<div className={styles.personalAccount}>Company</div>
            						<div className={styles.idealForIndividuals}>Ideal for individuals looking to manage personal tasks, track their own projects, or explore the platform for individual needs.</div>
          					</div>
        				</div>
      			</div>
      			<div className={styles.button1}>
                  <Link to="/registerpage" className={styles.tlbutton}>Next</Link>
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
            </div>);
};

export default Register;
