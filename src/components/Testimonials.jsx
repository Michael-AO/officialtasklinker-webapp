import React from "react";
import styles from './Testimonials.module.css';
import profileImage from "./Ellipse 8.png";


function Testimonials () {
  	return (
    		<div className={styles.testimonials}>
      			<div className={styles.testimonialHeader}>
        				<div className={styles.sectionLabelTestimonials}>
          					<div className={styles.testimonials1}>Testimonials</div>
        				</div>
        				<div className={styles.whatOurUsers}>What Our Users Are Saying</div>
      			</div>
      			<div className={styles.testimonialDisplay}>
        				<div className={styles.testimonialCard}>
          					<div className={styles.testimonialCardChild} />
          					<div className={styles.ellipseParent}>
            						<img className={styles.frameChild} alt="" src={profileImage} />
            						<div className={styles.sarahKParent}>
              							<div className={styles.sarahK}>Sarah K.</div>
              							<div className={styles.entrepreneur}>Entrepreneur</div>
            						</div>
          					</div>
          					<div className={styles.iWasStruggling}>I was struggling to close deals consistently until I found Kiras website. The training modules are easy to follow and packed with valuable tips. In just a few weeks, my conversion rate increased by 30%! I highly recommend her services to anyone looking to improve their sales skills."</div>
          					</div>
          					<div className={styles.testimonialCard}>
            						<div className={styles.testimonialCardChild} />
            						<div className={styles.ellipseParent}>
              							<img className={styles.frameChild} alt="" src={profileImage} />
              							<div className={styles.sarahKParent}>
                								<div className={styles.sarahK}>Sarah K.</div>
                								<div className={styles.entrepreneur}>Entrepreneur</div>
              							</div>
            						</div>
            						<div className={styles.iWasStruggling}>I was struggling to close deals consistently until I found Kiras website. The training modules are easy to follow and packed with valuable tips. In just a few weeks, my conversion rate increased by 30%! I highly recommend her services to anyone looking to improve their sales skills."</div>
            						</div>
            						<div className={styles.testimonialCard}>
              							<div className={styles.testimonialCardChild} />
              							<div className={styles.ellipseParent}>
                								<img className={styles.frameChild} alt="" src={profileImage} />
                								<div className={styles.sarahKParent}>
                  									<div className={styles.sarahK}>Sarah K.</div>
                  									<div className={styles.entrepreneur}>Entrepreneur</div>
                								</div>
              							</div>
              							<div className={styles.iWasStruggling}>I was struggling to close deals consistently until I found Kiras website. The training modules are easy to follow and packed with valuable tips. In just a few weeks, my conversion rate increased by 30%! I highly recommend her services to anyone looking to improve their sales skills."</div>
              							</div>
            						</div>
            						<div className={styles.slideshowGuide}>
              							<div className={styles.view1} />
              							<div className={styles.view2} />
              							<div className={styles.view2} />
              							<div className={styles.view2} />
            						</div>
          					</div>);
          					};
          					
          					export default Testimonials;
          					