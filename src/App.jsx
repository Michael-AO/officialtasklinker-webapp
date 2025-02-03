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
import RegisterPage from "./pages/RegisterPage.jsx";
import Verification from "./pages/verification.jsx";
import Login from './pages/Login.jsx';
import UserNavbar from "./components/UserNavbar.jsx";
import ExploreCategories from "./components/ExploreCategories.jsx";
import Exploreheader from "./components/ExploreHeader.jsx";
import Howitworks from "./components/HowItWorks.jsx";
import PostATask from "./pages/Postatask.jsx";

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
                <Navbar />
                <Register />
              </>
            }
          />

{/* RegisterPage Route */}
<Route
            path="/registerpage"
            element={
              <>
                <Navbar />
                <RegisterPage />
              </>
            }
          />


{/* verification Route */}
<Route
            path="/verification"
            element={
              <>
                <Navbar />
                <Verification />
              </>
            }
          />


          {/* Login Route */}
<Route
            path="/Login"
            element={
              <>
                <Navbar />
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


        </Routes>
      </div>
    </Router>
  );
}

export default App;
