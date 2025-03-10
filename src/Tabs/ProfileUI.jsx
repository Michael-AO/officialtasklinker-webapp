import React, { useEffect, useState } from "react";
import styles from "./ProfileUI.module.css";
import { auth } from "../firebase"; // Ensure Firebase is properly configured
import Authentication from "../components/authentication";
import DefaultProfile from "../components/DefaultProfile";

function ProfileUI() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser); // Update user state on authentication change
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, []);

  return user ? <DefaultProfile /> : <Authentication />; // Render one or the other
}

export default ProfileUI;
