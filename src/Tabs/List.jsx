import React from 'react';
import styles from './List.module.css';

function List({ onSelect }) {
  // Sample applicants data
  const applicants = [
    { id: 1, name: 'Opeyemi Peters', job: 'UX Designer', timeAgo: '30m ago' },
    { id: 2, name: 'Adebayo Okoro', job: 'Frontend Developer', timeAgo: '1h ago' },
    { id: 3, name: 'Jemila Adebayo', job: 'UI Designer', timeAgo: '2h ago' }
  ];

  return (
    <div className={styles.reuseablecomponent}>
      <div className={styles.theapplicants}>
        <div className={styles.frameParent}>
          <div className={styles.frameGroup}>
            <div className={styles.sortByNameParent}>
              <div className={styles.sortByName}>Sort By: Name</div>
              <img className={styles.eparrowDownIcon} alt="" src="/ep:arrow-down.svg" />
            </div>
            <div className={styles.sortByNameParent}>
              <div className={styles.sortByName}>Filter: Time</div>
              <img className={styles.eparrowDownIcon} alt="" src="/ep:arrow-down.svg" />
            </div>
          </div>

          <div className={styles.frameContainer}>
            {/* Looping through applicants */}
            {applicants.map((applicant) => (
              <div
                key={applicant.id}
                className={styles.frameWrapper}
                onClick={() => onSelect(applicant)}  // Pass applicant data to onSelect
                style={{ cursor: 'pointer' }}
              >
                <div className={styles.frameDiv}>
                  <div className={styles.frameParent1}>
                    <div className={styles.frameWrapper1}>
                      <div className={styles.opeyemiPetersParent}>
                        <div className={styles.opeyemiPeters}>{applicant.name}</div>
                        <div className={styles.iAmAContainer}>
                          <p className={styles.iAmA}>{applicant.job}</p>
                        </div>
                      </div>
                    </div>
                    <div className={styles.frameParent2}>
                      <div className={styles.viewDetailsParent}>
                        <div className={styles.sortByName}>View details</div>
                        <img className={styles.eparrowDownIcon2} alt="" src="/ep:arrow-down.png" />
                      </div>
                      <div className={styles.mAgo}>{applicant.timeAgo}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className={styles.buttonWrapper}>
        <div className={styles.button}>
          <div className={styles.back}>Back</div>
        </div>
      </div>
    </div>
  );
}

export default List;
