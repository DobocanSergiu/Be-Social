import React, { useEffect, useState } from "react";
import styles from "./LoginPage.module.css";
import { json, Navigate,useNavigate } from "react-router-dom";
import NavBar from "../Components/NavBar";

function LoginPage() {
  useEffect(() => {
    document.body.style.backgroundColor = "#eceff4";
    localStorage.setItem("isLoggedIn",false);
    localStorage.setItem("userInfo",null);

    
  }, []);

  
  const [loginAttempted, setLoginAttempted] = useState("Not Attempted");
  const [idInput, setIdInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const navigate = useNavigate();

  function handleLoginButton()
  {
  
    const api_endpoint = `http://localhost:5139/api/Users/Login/${idInput}/${passwordInput}`
    fetch(api_endpoint)
        .then(response => {
            
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json(); 
        })
        .then(data => {
            localStorage.setItem("isLoggedIn",true);
            localStorage.setItem("userInfo",JSON.stringify(data));
            setLoginAttempted("Successful")
            navigate('/')
        })
        .catch(error => {
            console.log(error);
            setLoginAttempted("Failed");
            
        });  
      }
  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <div className={styles.titleGroup}>
          <label className={styles.title}>Login</label>
        </div>
        <div className={styles.inputGroup}>
          <label className={styles.label}>
            ID-Name or Email:
            <input name="UsernameInput" className={styles.input} onChange={(e)=>setIdInput(e.target.value)} />
          </label>
          <label className={styles.label}>
            Password:
            <input
              name="PasswordInput"
              type="password"
              className={styles.input}
              onChange={(e)=>setPasswordInput(e.target.value)}
            />
          </label>
        </div>
        <div className={styles.buttonGroup}>
          <button className={styles.button} onClick={handleLoginButton}>Login</button>
          <a href="register" className={styles.link}>
            Register
          </a>
        </div>
        {loginAttempted=="Failed"&&<div style={{color:'red'}}>Failed Login</div>}
      </div>
    </div>
  );
}

export default LoginPage;
