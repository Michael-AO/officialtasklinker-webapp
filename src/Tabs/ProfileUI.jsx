import React, { useEffect, useState } from "react";
import styles from "./ProfileUI.module.css";
import { auth } from "../firebase"; // Ensure Firebase is properly configured
import Authentication from "../components/authentication";
import DefaultProfile from "../components/DefaultProfile";

function ProfileUI() {
  const [user, setUser] = useState(null);
  const [isEmailVerified, setIsEmailVerified] = useState(false); // Track email verification status

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser); // Update user state
        setIsEmailVerified(currentUser.emailVerified); // Check email verification status
      } else {
        setUser(null); // No user is signed in
        setIsEmailVerified(false); // Reset email verification status
      }
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, []);

  // Render DefaultProfile only if the user is logged in and email is verified
  if (user && isEmailVerified) {
    return <DefaultProfile />;
  }

  // Render Authentication if no user is logged in or email is not verified
  return <Authentication />;
}

export default ProfileUI;