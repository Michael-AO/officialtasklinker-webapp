import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import HeroSection from "./components/Herosection.jsx";
import RecentTasks from "./components/Recenttasks.jsx";
import Testimonials from "./components/Testimonials.jsx";
import "./styles/global.css";
import AddOns from "./components/addons.jsx";
import Faqs from "./components/Faqs.jsx";
import Footer from "./components/Footer.jsx";
import Register from "./pages/Register.jsx";
import RegisterPage from "./pages/RegisterP.jsx";
import Verification from "./pages/verification.jsx";
import Login from './pages/Login.jsx';
import UserNavbar from "./components/UserNavbar.jsx";
import ExploreCategories from "./components/ExploreCategories.jsx";
import Exploreheader from "./components/ExploreHeader.jsx";
import Howitworks from "./components/HowItWorks.jsx";
import PostATask from "./pages/Postatask.jsx"
// import ProfileUI from "./components/ProfileUI.jsx"
import DashboardLayout from "./components/DashboardLayout.jsx";
import Sidebar from "./components/sidebar.jsx"
import SelectAccount from "./pages/SelectAccount.jsx";
import Apply from "./pages/Apply.jsx";





function App() {
  return (
    <Router>
      <div className="page-container">


      <Routes>
          {/* Home Route */}
          <Route
            path="/"
            element={
              <>
                 <UserNavbar />
                <HeroSection />
                <RecentTasks />
                <AddOns />
                <Testimonials />
                <Faqs />
                <Footer />
              </>
            }
          />

          {/* Register Route */}
          <Route
            path="/register"
            element={
              <>
                   <UserNavbar />
                <SelectAccount />
              </>
            }
          />

{/* RegisterPage Route */}
<Route
            path="/registerpage"
            element={
              <>
                  <UserNavbar />
                <RegisterPage />
              </>
            }
          />


{/* verification Route */}
<Route
            path="/verification"
            element={
              <>
                  <UserNavbar />
                <Verification />
              </>
            }
          />


          {/* Login Route */}
<Route
            path="/Login"
            element={
              <>
                  <UserNavbar />
                <Login />
              </>
            }
          />

{/* UserHomepage */}
<Route
            path="/userhomepage"
            element={
              <>
                <UserNavbar />
                <Exploreheader />
                <ExploreCategories />
                <AddOns />
                <Footer />
              </>
            }
          />






          {/* Post a Task */}
<Route
            path="/Postatask"
            element={
              <>
                <UserNavbar />
               <PostATask />
              </>
            }
          />


           {/* Apply for Task */}
<Route
            path="/Apply"
            element={
              <>
                <UserNavbar />
               <Apply />
              </>
            }
          />




           {/* Dashboard */}
           <Route
            path="/dashboard/*"
            element={
              <>
                <UserNavbar />
               <DashboardLayout />
              </>
            }
          />


        </Routes>
      </div>
    </Router>
  );
}

export default App;
