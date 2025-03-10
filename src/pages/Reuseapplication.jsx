import React from 'react';
import styles from './Reuseapplication.module.css';

function Reuseapplication({ applicationData, updateApplicationData }) {
    return (
        <div className={styles.reuseapplication}>
            <div className={styles.frameParent}>
                {/* Experience with Plumbing */}
                <div className={styles.haveExpereinceWithPlumbingParent}>
                    <div className={styles.haveExpereinceWith}>Have experience with plumbing</div>
                    <div className={styles.yesParent}>
                        <select 
                            className={styles.yesParentH}
                            value={applicationData.experience} 
                            onChange={(e) => updateApplicationData('experience', e.target.value)}
                        >
                            <option value="">Select</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                        </select>
                    </div>
                </div>

                {/* Number of Years of Experience */}
                <div className={styles.haveExpereinceWithPlumbingParent}>
                    <div className={styles.haveExpereinceWith}>No. of years of experience</div>
                    <div className={styles.yesParent}>
                        <input 
                            type="number" 
                            className={styles.yesParentH} 
                            value={applicationData.years} 
                            onChange={(e) => updateApplicationData('years', e.target.value)} 
                            placeholder="Enter years"
                            min="0"
                        />
                    </div>
                </div>
            </div>

            {/* Why You Should Be Picked */}
            <div className={styles.whyYouShouldBePickedForTParent}>
                <div className={styles.haveExpereinceWith}>Why you should be picked for this role</div>
                <div className={styles.iBelieveIAmAnExcellentFiWrapper}>
                    <textarea
                        className={styles.iBelieve}
                        value={applicationData.whyPick}
                        onChange={(e) => updateApplicationData('whyPick', e.target.value)}
                        placeholder="Explain why you are a great fit for this role"
                    />
                </div>
            </div>
        </div>
    );
}

export default Reuseapplication;
