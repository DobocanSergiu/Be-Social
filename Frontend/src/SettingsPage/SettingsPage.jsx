import React, { useEffect } from "react";
import NavBar from "../Components/NavBar";
import styles from "./SettingsPage.module.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";


function SettingsPage() {
  const navigate = useNavigate();

  const [displayName,setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [bio,setBio] = useState("");
  const [profilePic,setProfilePic] = useState("");
  const [bannerPic,setBannerPic] = useState("");
  const [privacySetting,setPrivacySetting] = useState("private");


  useEffect(() => {
    document.body.style.backgroundColor = "#eceff4";
    if(localStorage.getItem("isLoggedIn")===null)
      { 
        localStorage.setItem("isLoggedIn",false);
        navigate('/login')

      }
    if(localStorage.getItem("isLoggedIn")==="false")
    {
      navigate('/login')
    }
     
  
  }, []);


  useEffect(() => {
    document.body.style.backgroundColor = "#eceff4";
    if (localStorage.getItem("isLoggedIn") === null) {
      localStorage.setItem("isLoggedIn", false);
      navigate('/login');
    }
    if (localStorage.getItem("isLoggedIn") === "false") {
      navigate('/login');
    }
  }, [navigate]);

  const handleConfirm = async () => {
    const userId = JSON.parse(localStorage.userInfo).userId;
    const encodedProfilePic = encodeURIComponent(profilePic);
    const encodedBannerPic = encodeURIComponent(bannerPic);

    try {
      // Update display name
      await fetch(`http://localhost:5139/api/Users/ModifyDisplayName/${userId}/${displayName}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Update email
      await fetch(`http://localhost:5139/api/Users/ModifyEmail/${userId}/${email}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Update bio
      await fetch(`http://localhost:5139/api/Users/ModifyBio/${userId}/${bio}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Update profile picture
      await fetch(`http://localhost:5139/api/Users/ModifyProfilePic/${userId}/${encodedProfilePic}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Update banner picture
      await fetch(`http://localhost:5139/api/Users/ModifyBannerPic/${userId}/${encodedBannerPic}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Update privacy setting
      await fetch(`http://localhost:5139/api/Users/ModifyPrivacySetting/${userId}/${privacySetting}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Update password
      await fetch(`http://localhost:5139/api/Users/ModifyPassword/${userId}/${password}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Fetch updated user data
      const response = await fetch(`http://localhost:5139/api/Users/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch updated user data');
      }
      const updatedUserData = await response.json();

      // Save updated data to localStorage
      localStorage.setItem('userInfo', JSON.stringify(updatedUserData));

      // Optional: Add success message or notification
      console.log('Profile updated successfully');

    } catch (error) {
      // Handle any errors that occurred during the updates
      console.error('Error updating profile:', error);
      // Optional: Add error message or notification for the user
    }
  };

  return (
    <div className={styles.container}>
      {localStorage.getItem("isLoggedIn")==="true" && <NavBar  currentPage="settingsPage" profilePicture={JSON.parse(localStorage.userInfo).profilePicUrl}/>}
      <div className={styles.settingsCard}>
        <div className={styles.inputGroup}>
          <label>Display Name:</label>
          <input className={styles.input} value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
        </div>
        <div className={styles.inputGroup}>
          <label>Email:</label>
          <input className={styles.input} value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className={styles.inputGroup}>
          <label>Password:</label>
          <input className={styles.input} value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div className={styles.inputGroup}>
          <label>Bio:</label>
          <textarea className={styles.bioTextarea} value={bio} onChange={(e) => setBio(e.target.value)} />
        </div>
        <div className={styles.inputGroup}>
          <label>Profile Picture:</label>
          <input className={styles.input} value={profilePic} onChange={(e) => setProfilePic(e.target.value)} />
        </div>
        <div className={styles.inputGroup}>
          <label>Banner Picture:</label>
          <input className={styles.input} value={bannerPic} onChange={(e) => setBannerPic(e.target.value)} />
        </div>
        <div className={styles.inputGroup}>
          <label>Privacy setting:</label>
          <select className={styles.select} value={privacySetting}  onChange={(e) => setPrivacySetting(e.target.value)} >
            <option className={styles.privateOption} value="private">private</option>
            <option className={styles.friendsOption} value="friends">friends only</option>
            <option className={styles.publicOption} value="public">public</option>
          </select>
        </div>
        <button className={styles.confirmButton} onClick={()=>handleConfirm()}>Confirm</button>
      </div>
    </div>
  );
}

export default SettingsPage;
