import styles from './Reuseapplication.module.css';
import React, { useState } from 'react';

function Reuseapplication() {
  const [experience, setExperience] = useState('');
  const [years, setYears] = useState('');
  const [reason, setReason] = useState('');

  return (
    <div className={styles.reuseapplication}>
      <div className={styles.frameParent}>
        <div className={styles.haveExpereinceWithPlumbingParent}>
          <label className={styles.haveExpereinceWith}>Have experience with this job</label>
          <select 
            className={styles.yesParent} 
            value={experience} 
            onChange={(e) => setExperience(e.target.value)}
          >
            <option value="">Select</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </div>
        
        <div className={styles.haveExpereinceWithPlumbingParent}>
          <label className={styles.haveExpereinceWith}>No of years of experience</label>
          <input 
            type="number" 
            className={styles.yesParent} 
            value={years} 
            onChange={(e) => setYears(e.target.value)}
            placeholder="Enter years"
          />
        </div>
      </div>
      
      <div className={styles.whyYouShouldBePickedForTParent}>
        <label className={styles.haveExpereinceWith}>Why you should be picked for this role</label>
        <textarea 
          className={styles.iBelieveIAmAnExcellentFiWrapper} 
          value={reason} 
          onChange={(e) => setReason(e.target.value)}
          placeholder="Write your response here..."
        />
      </div>
    </div>
  );
};

export default Reuseapplication;
