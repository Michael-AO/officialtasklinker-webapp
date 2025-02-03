import styles from './Howitworks.module.css';
import React from 'react';
import video from './video-embed.png';
import videm from './Vidembed.mp4';


function Howitworks () {
  	return (
    		<div className={styles.howitworks}>
      			<div className={styles.hitw}>
        				<div className={styles.header}>
          					<div className={styles.headersub}>
            						<div className={styles.featuredSection}>Featured Section</div>
          					</div>
          					<div className={styles.howItWorks}>How it works</div>
        				</div>
        				<video src={videm} className={styles.videojb} />
      			</div>
    		</div>);
};

export default Howitworks;
