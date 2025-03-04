import styles from './ExploreHeader.module.css';
import React from 'react';


function Exploreheader() {
  	return (
    		<div className={styles.exploreheader}>
      			<div className={styles.headercontent}>
        				<div className={styles.findThePerfect}>Find the perfect task or hire the right talent effortlessly.</div>
        				<div className={styles.yourPersonalisedTask}>Your personalised task linking assistant that handles your job needs and connections</div>
        				<div className={styles.exploreTasksWrapper}>
          					<div className={styles.exploreTasks}>Explore Tasks</div>
        				</div>
      			</div>
    		</div>);
};

export default Exploreheader;
