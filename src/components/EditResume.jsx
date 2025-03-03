import React from "react";
import styles from './EditResume.module.css';


function EditResume() {
  	return (
    		<div className={styles.editresume}>
      			<div className={styles.inputs}>
        				<div className={styles.location}>
          					<div className={styles.primaryRole}>Location</div>
          					<div className={styles.lagosNigeriaWrapper}>
            						<div className={styles.lagosNigeria}>Lagos, Nigeria</div>
          					</div>
        				</div>
        				<div className={styles.rolecompany}>
          					<div className={styles.primaryRoleParent}>
            						<div className={styles.primaryRole}>Primary Role</div>
            						<div className={styles.lagosNigeriaWrapper}>
              							<div className={styles.lagosNigeria}>Graphic Designer</div>
            						</div>
          					</div>
          					<div className={styles.primaryRoleParent}>
            						<div className={styles.primaryRole}>Company</div>
            						<div className={styles.lagosNigeriaWrapper}>
              							<div className={styles.lagosNigeria}>Lagoon Agency</div>
            						</div>
          					</div>
        				</div>
        				<div className={styles.startstop}>
          					<div className={styles.primaryRoleParent}>
            						<div className={styles.primaryRole}>Start Date</div>
            						<div className={styles.lagosNigeriaWrapper}>
              							<div className={styles.lagosNigeria}>Aug 2021</div>
            						</div>
          					</div>
          					<div className={styles.frameParent}>
            						<div className={styles.endDateParent}>
              							<div className={styles.primaryRole}>End Date</div>
              							<div className={styles.lagosNigeriaWrapper}>
                								<div className={styles.lagosNigeria}>Aug 2022</div>
              							</div>
            						</div>
            						<div className={styles.iCurrentlyWorkHereParent}>
              							<div className={styles.iCurrentlyWork}>I currently work here</div>
              							<div className={styles.groupChild} />
            						</div>
          					</div>
        				</div>
      			</div>
      			<div className={styles.endDateParent}>
        				<div className={styles.primaryRole}>Job description</div>
        				<div className={styles.weAreLookingForACreativeWrapper}>
          					<div className={styles.weAreLookingContainer}>
            						<p className={styles.weAreLooking}>We are looking for a creative and strategic Social Media Specialist to join our team. In this role,</p>
            						<p className={styles.weAreLooking}>you will be responsible for developing and executing social media strategies that enhance our</p>
            						<p className={styles.weAreLooking}>brand presence, engage our audience, and drive growth. You will manage social media</p>
            						<p className={styles.weAreLooking}> channels, create compelling content, and analyze performance metrics to optimize campaigns.</p>
          					</div>
        				</div>
      			</div>
    		</div>);
};

export default EditResume;
