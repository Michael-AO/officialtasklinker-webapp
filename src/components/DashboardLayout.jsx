import { useCallback } from 'react';
import styles from './DashboardUI.module.css';
import React from 'react';
import { Link, useLocation } from "react-router-dom";
import Topbar from './Topbar';
import Sidebar from './sidebar';
import { Routes, Route, Navigate } from "react-router-dom"; 

import ProfileUI from '../Tabs/ProfileUI';
import ReuseableResume from '../Tabs/Resume';
import Application from '../Tabs/ApplicationReuseable';
import Postedtasks from '../Tabs/Postedtasks';
import GetPaid from '../Tabs/GetPaid';





function DashboardLayout() {
  	return (
    		<div className={styles.lftopright}>
      			<Sidebar />
				<div className={styles.mainContent}> 
				<div className={styles.rightupdown}>
        				<Topbar />
        				<div className={styles.reuseablecontainer}>

						<Routes>
            {/* Redirect to ProfileUI if no specific route is provided */}
            <Route path="/" element={<Navigate to="/dashboard/Profile" replace />} />
            <Route path="/profile" element={<ProfileUI />} />
            <Route path="/resume" element={<ReuseableResume />} />
            <Route path="/applications" element={<Application />} />
			<Route path="/postedTasks" element={<Postedtasks />} />
			<Route path="/getPaid" element={<GetPaid />} />


          </Routes>  					
        				</div>
      			</div>
				</div>
      			
    		</div>);
};

export default DashboardLayout;



