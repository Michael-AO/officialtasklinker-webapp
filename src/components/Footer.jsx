import styles from './Footer.module.css';
import React from 'react';
import logofooter from './logofooter.png'
import uparroe from './up-arrow-footer.svg'


function Footer() {
  	return (
    		<div className={styles.footer}>
      			<div className={styles.footerBg} />
      			<div className={styles.copyright2024All}>{`@Copyright 2024, All Rights Reserved  `}</div>
      			<div className={styles.logofooterParent}>
        				<img className={styles.logofooterIcon} alt="" src={logofooter} />
        				<div className={styles.frameParent}>
          					<div className={styles.homeParent}>
            						<div className={styles.home}>Home</div>
            						<div className={styles.home}>About Us</div>
            						<div className={styles.home}>Explore</div>
            						<div className={styles.testimonials}>Testimonials</div>
          					</div>
          					<div className={styles.contactUsParent}>
            						<div className={styles.contactUs}>CONTACT US</div>
            						<div className={styles.infotasklinkersParent}>
              							<div className={styles.infotasklinkers}>Info@tasklinkers</div>
              							<div className={styles.legalPrivacy}>Legal & Privacy Policy</div>
              							<div className={styles.legalPrivacy}>Terms and Conditions</div>
            						</div>
          					</div>
        				</div>
      			</div>
      			<div className={styles.goToTop}>Go to Top</div>
      			<img className={styles.upArrowFooterIcon} alt="" src={uparroe} />
    		</div>);
};

export default Footer;
