import React, { useEffect, useState } from "react";
import styles from "./RegisterPage.module.css";
import { useNavigate } from "react-router-dom";

function RegisterPage() {

  const [inputUserId,setInputUserID] = useState("");
  const [inputEmail, setInputEmail] = useState("");
  const [inputPassword, setInputPassword] = useState("");
  const [registerAtempted,setRegisterAtempted]= useState("")
  const navigate = useNavigate();
  useEffect(() => {
    document.body.style.backgroundColor = "#eceff4";
    if(localStorage.getItem("isLoggedIn")==null)
      { 
        localStorage.setItem("isLoggedIn",false);
      }
  
  }, []);


  function handleRegisterButton()
  {

    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({  
        idname: `${inputUserId}`,
        displayName: `${inputUserId}`,
        email: `${inputEmail}`,
        password: `${inputPassword}`,
        bio: 'Hello Im using social media',
        profilePicUrl: 'https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg?t=st=1730392500~exp=1730396100~hmac=3a52e1bd8d2cd95528d77567cb24c6662f3945681abda31e5b4bdc8f06d494e4&w=740',
        bannerPicUrl: 'https://www.muchbetteradventures.com/magazine/content/images/size/w2000/2019/06/13091225/iStock-157644719.jpg',
        privacySetting:'private' })
  };
    fetch('http://localhost:5139/api/Users/CreateUser',requestOptions).then
    (response=>{
      if(response.ok){
      console.log("Register Successful");
      setRegisterAtempted("Successful");
      navigate('/login')


    }
    else
    {
      throw new Error();
    }
    }).catch(error=>
      {
      console.log(error);
      setRegisterAtempted("Failed")
    });
  }
 

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <div className={styles.titleGroup}>
          <label className={styles.title}>Register</label>
        </div>
        <div className={styles.inputGroup}>
          <label className={styles.label}>
            ID-Name:
            <input name="Name" className={styles.input} onChange={(e)=>setInputUserID(e.target.value)} />
          </label>
          <label className={styles.label}>
            Email Address:
            <input name="EmailInput" className={styles.input} onChange={(e)=>setInputEmail(e.target.value)} />
          </label>
          <label className={styles.label}>
            Password:
            <input
              name="PasswordInput"
              type="password"
              className={styles.input}
              onChange={(e)=>setInputPassword(e.target.value)}
            />
          </label>
        </div>
        <div className={styles.buttonGroup}>
          <button className={styles.button} onClick={handleRegisterButton}>Register</button>
        </div>
        {registerAtempted=="Failed" &&<div  style={{color:'red'}}>Registration failed</div>}
      </div>
    </div>
  );
}

export default RegisterPage;
