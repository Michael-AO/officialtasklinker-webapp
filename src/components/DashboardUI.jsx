import { useCallback } from 'react';
import styles from './DashboardUI.module.css';
import React from 'react';
import profile from './profiledash.png';
import resume from './resumedash.png';
import applic from './applicationdash.png';
import postdash from './postdash.png';
import getpaid from './getpaid.png';
import ppic from './profilepic.png';
import next from './next.png';
import signout from './signout.png';
import ProfileUi from '../Tabs/ProfileUI';
import { Link, useLocation } from "react-router-dom";


function DashboardUI() {
  	return (
    		<div className={styles.lftopright}>
      			<div className={styles.sidebarComponent}>
        				<div className={styles.sidebarComponentChild} />
        				<div className={styles.navMenuWrapper}>
          					<div className={styles.profile}>
            						<img className={styles.profiledashIcon} alt="" src="profiledash.svg" />
            						<div className={styles.applications}>Profile</div>
          					</div>
          					<div className={styles.resume}>
            						<img className={styles.resumedashIcon} alt="" src="resumedash.svg" />
            						<div className={styles.applications}>Resume</div>
          					</div>
          					<div className={styles.resume}>
            						<img className={styles.applicationdashIcon} alt="" src="applicationdash.svg" />
            						<div className={styles.applications}>Applications</div>
          					</div>
          					<div className={styles.resume}>
            						<img className={styles.postdashIcon} alt="" src="postdash.svg" />
            						<div className={styles.applications}>Posted Tasks</div>
          					</div>
          					<div className={styles.resume}>
            						<img className={styles.getpaidIcon} alt="" src="getpaid.svg" />
            						<div className={styles.applications}>Get Paid</div>
          					</div>
        				</div>
        				<div className={styles.navMenuWrapper1}>
          					<div className={styles.resume}>
            						<img className={styles.signoutIcon} alt="" src="signout.svg" />
            						<div className={styles.applications}>Sign Out</div>
          					</div>
        				</div>
      			</div>
      			<div className={styles.rightupdown}>
        				<div className={styles.dashboardheader}>
          					<div className={styles.contentwrapper}>
            						<div className={styles.opeyemisDashboard}>
              							<p className={styles.opeyemis}>Opeyemi’s</p>
              							<p className={styles.opeyemis}>Dashboard</p>
            						</div>
            						<div className={styles.profilecompletion}>
              							<div className={styles.completeYourProfileParent}>
                								<div className={styles.completeYourProfile}>Complete your profile</div>
                								<img className={styles.vectorIcon} alt="" src="Vector.svg" />
              							</div>
              							<div className={styles.div}>60%</div>
              							<div className={styles.profilecompletionChild} />
              							<div className={styles.profilecompletionItem} />
            						</div>
            						<div className={styles.welcomeToYour}>{`Welcome to your dashboard—your personal hub for managing tasks, tracking progress, and staying connected. `}</div>
          					</div>
        				</div>

        				<div className={styles.reuseablecontainer}>
							{children}

{/* <ProfileUi />      					 */}
        				</div>
      			</div>
    		</div>);
};

export default DashboardUI;



