import React, { useEffect, useState } from 'react';
import { db, collection, getDocs } from '../firebase';
import styles from './ExploreCategories.module.css';
import { Link, useLocation } from "react-router-dom";
import down from './down.png'; // Dropdown icon

function ExploreCategories() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get("search") || ""; // Get search query from URL

  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [visibleCount, setVisibleCount] = useState(6);
  const [sortBy, setSortBy] = useState("default"); // Sorting state
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const jobsCollection = collection(db, 'Jobs');
        const jobSnapshot = await getDocs(jobsCollection);
        const jobList = jobSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setJobs(jobList);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setLoading(false); // Stop loading once jobs are fetched
      }
    };
    fetchJobs();
  }, []);

  // Update filtered jobs when searchQuery or jobs change
  useEffect(() => {
    console.log("Filtering jobs for search query:", searchQuery);

    const updatedJobs = jobs.filter(job =>
      (job.roleName?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (job.location?.toLowerCase() || "").includes(searchQuery.toLowerCase())
    );

    setFilteredJobs(updatedJobs);
  }, [searchQuery, jobs]);

  // Sorting Jobs Based on Selected Sort Option
  let sortedJobs = [...filteredJobs];
  if (sortBy === "compensationHigh") {
    sortedJobs.sort((a, b) => b.compensation - a.compensation);
  } else if (sortBy === "compensationLow") {
    sortedJobs.sort((a, b) => a.compensation - b.compensation);
  } else if (sortBy === "roleName") {
    sortedJobs.sort((a, b) => a.roleName.localeCompare(b.roleName));
  }

  return (
    <div className={styles.fullexplore}>
      <div className={styles.explorecontent}>
        <div className={styles.exploreCategories}>
          {searchQuery ? `Search Results for "${searchQuery}"` : "Explore Categories"}
        </div>

        {/* SORT BY */}
        <div className={styles.timestampsort}>
          <div className={styles.sortByRelevance}>Sort by:</div>
          <select 
            className={styles.select} 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="default">Default</option>
            <option value="compensationHigh">Compensation: High to Low</option>
            <option value="compensationLow">Compensation: Low to High</option>
            <option value="roleName">Role Name (A-Z)</option>
          </select>
        </div>

        {/* JOB LIST */}
        <div className={styles.jobs}>
          {loading ? ( // Show loading message before jobs are fetched
            <div className={styles.loading}>Loading jobs...</div>
          ) : sortedJobs.length > 0 ? (
            sortedJobs.slice(0, visibleCount).map((job) => (
              <Link key={job.id} to={`/Apply`} className={styles.rectangleParent}>
                <div className={styles.groupChild} />
                <div className={styles.compensationmonth}>Compensation/month</div>
                <div className={styles.frameGroup}>
                  <div className={styles.uxDesignerWrapper}>
                    <div className={styles.uxDesigner}>{job.roleName}</div>
                  </div>
                  <div className={styles.onsiteWrapper}>
                    <div className={styles.onsite}>{job.jobType}</div>
                  </div>
                </div>
                <i className={styles.badiruStrLagos}>{job.location}</i>
                <div className={styles.money}>NGN {job.compensation}</div>
                <div className={styles.shellNigeriaWrapper}>
                  <div className={styles.employer}>{job.employerName}</div>
                </div>
              </Link>
            ))
          ) : (
            <div className={styles.noResults}>No results found</div>
          )}
        </div>

        {/* SEE MORE / SEE LESS */}
        {sortedJobs.length > 6 && (
          <div className={styles.seeMoreContainer}>
            {visibleCount < sortedJobs.length ? (
              <button className={styles.seeMoreButton} onClick={() => setVisibleCount(visibleCount + 6)}>See More</button>
            ) : (
              <button className={styles.seeMoreButton} onClick={() => setVisibleCount(6)}>See Less</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ExploreCategories;
