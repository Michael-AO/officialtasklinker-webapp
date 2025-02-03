import styles from './Herosection.module.css';
import React from 'react';
import heroImage from "./hero-image.png";
import heroArrowIcon from "./hero-arrow.png";
import { Link, useLocation } from "react-router-dom";


function HeroSection() {
	const location = useLocation();

  	return (
    		<div className={styles.heroSection}>
      			<div className={styles.heroBackground} />
      			<div className={styles.findThePerfect}>Find the perfect task or hire the right talent effortlessly.</div>
      			<div className={styles.yourPersonalisedTask}>Your personalised task linking assistant that handles your job needs and connections</div>
      			
		<div className={styles.button}>
		<Link to="/userhomepage" className={styles.tlbutton}>
		Explore Tasks
        <img className={styles.heroArrowIcon} alt="Arrow Icon" src={heroArrowIcon} />
		</Link>
			
	
		</div>
      			
      			<img className={styles.heroImageIcon} alt="" src={heroImage} />
    		</div>);
};

export default HeroSection;
