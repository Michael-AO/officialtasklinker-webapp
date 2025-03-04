import React from 'react';
import styles from './addons.module.css';
import exploreImage from "./explore-gigs.svg";
import exploreGigsIcon from "./explore.png";
import applyForTasksIcon from "./apply.png";
import walletIcon from "./wallet.png"
import applyImage from "./apply-for-tasks.svg";
import monitorImage from "./monitor-jobs.svg";


function AddOns () {
  	return (
    		<div className={styles.addOns}>
      			<div className={styles.addOnsBg} />
      			<div className={styles.exploreTopTask}>{`Explore top task & benefits `}</div>
      			<div className={styles.sectionLabelAddons}>
        				<div className={styles.addOns1}>Add-ons</div>
      			</div>
      			<img className={styles.exploreGigsIcon} alt="" src={exploreImage} />
      			<img className={styles.applyForTasksIcon} alt="" src={applyImage} />
      			<div className={styles.unlockNewOpportunities}>Unlock new opportunities by exploring a wide range of jobs and gigs tailored to your skills and interests. Whether you’re looking for full-time positions, freelance projects, or short-term gigs, our platform connects you with the right opportunities to grow your career.</div>
      			<div className={styles.eedATask}>eed a task completed? Whether it’s a small job or a major project, post your gig and let professionals apply. From skilled trades to specialized services, find the right talent quickly and easily. Just share the details, set your budget, and get matched with qualified experts ready to take on the job.</div>
        				<div className={styles.finishTheJob}>Finish the job, and get your payment—fast and secure. Once you complete a task or project, the payment is released directly to you, ensuring you’re rewarded for your hard work. No waiting around, just a straightforward way to get compensated.</div>
        				<img className={styles.exploreIcon} alt="" src={exploreGigsIcon} />
        				<div className={styles.exploreGigs}>Explore Gigs</div>
        				<img className={styles.applyIcon} alt="" src={applyForTasksIcon} />
        				<div className={styles.applyForTasks}>Apply for Tasks</div>
        				<img className={styles.walletIcon} alt="" src={walletIcon} />
        				<div className={styles.monitorJobs}>Monitor Jobs</div>
        				<img className={styles.monitorJobsIcon} alt="" src={monitorImage} />
        				</div>);
      			};
      			
      			export default AddOns;
      			