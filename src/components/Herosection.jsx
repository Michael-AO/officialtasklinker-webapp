import styles from './Herosection.module.css';
import React, { useState, useEffect } from 'react';
import heroImage from "./hero-image.png";
import heroArrowIcon from "./hero-arrow.png";
import { Link } from "react-router-dom";

function HeroSection() {
    const words = ["effortlessly.", "quickly.", "safely."];
    const [currentWordIndex, setCurrentWordIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentWordIndex((prevIndex) => (prevIndex + 1) % words.length);
        }, 3000); // Change word every 3 seconds

        return () => clearInterval(interval); // Cleanup on unmount
    }, []);

    return (
        <div className={styles.heroSection}>
            <div className={styles.heroBackground} />
            <div className={styles.findThePerfect}>
                Find the perfect task or hire the right talent{" "}
                <span className={styles.typewriter}>{words[currentWordIndex]}</span>
            </div>
            <div className={styles.yourPersonalisedTask}>
                Your personalised task linking assistant that handles your job needs and connections
            </div>
            
            <div className={styles.button}>
                <Link to="/userhomepage" className={styles.tlbutton}>
                    Explore Tasks
                    <img className={styles.heroArrowIcon} alt="Arrow Icon" src={heroArrowIcon} />
                </Link>
            </div>

            <img className={styles.heroImageIcon} alt="" src={heroImage} />
        </div>
    );
}

export default HeroSection;
