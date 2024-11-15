import React, { useState } from "react";
import { useEffect } from "react";
import styles from "./ProfilePageBanner.module.css";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";


function ProfilePageBanner(props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [borderColor,setBorderColor] = useState("#2f435b");

  const [followButtonActive, setFollowButtonActive] = useState(false);
  const [followButtonColor, setFollowButtonColor] = useState('#21a366')

  const [settingsButtonActive,setSettingsButtonActive] =useState(false);
  const [followButtonText,setFollowButtonText] = useState("Follow");  
  const {IdName} = useParams();
  const navigate = useNavigate();

  
  

  useEffect(()=>{
    handleBorderColor();
    ///logged in user viewing his profile
    if(JSON.parse(localStorage.userInfo).idname==IdName)
    {
      setFollowButtonActive(false);
      setSettingsButtonActive(true);

    }
    ///logged in user viewing others profile
    else
    {
     setFollowButtonActive(true);
     setSettingsButtonActive(false);

     fetch(`http://localhost:5139/api/Followers/CheckFollowing/${JSON.parse(localStorage.userInfo).idname}/${IdName}`)
     .then(response => {
      if (!response.ok) {
        throw new Error('An error occurred');
      }
      return response.json();
    })
    .then(data => {
      if(data==true)
      {
        setFollowButtonColor("#de1039") ///RED
        setFollowButtonText("Unfollow")

      }
      else if(data==false)
      {
        setFollowButtonColor("#21a366") ///GREEN
        setFollowButtonText("Follow")


      }
    })
    .catch(error => {
      console.error('Follow button render error:', error);
      navigate('/');
    });
    }
  },[handlePost])

    async function handlePost() {
      const userId = JSON.parse(localStorage.userInfo).userId;

      try {
        const response = await fetch("http://localhost:5139/CreateNewPost", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                userId: userId,
                content: postContent,
                comments: []
            })
        });

        if (!response.ok) {
            console.error(`HTTP error! Status: ${response.status}`);
            setIsModalOpen(false);
            setPostContent("")
            window.location.reload();

        } else {
            console.log("Post created successfully");
            setIsModalOpen(false);
            setPostContent("");
            window.location.reload();

        }
    } catch (error) {
        console.error("Error:", error);
    }
    }


  function handleBorderColor()
  {
    if(props.privacySetting=="private")
    {
      setBorderColor("#bf616a") ///RED
    }
    else if(props.privacySetting=="friends")
    {
      setBorderColor("#d08770") ///ORANGE

    }
    else if(props.privacySetting=="public")
    {
      setBorderColor("#a3be8c") ///GREEN
    }
  }


  function handleFollowButtonMouseEnter()
  {



    if(followButtonColor=="#de1039")  ///RED
    {
        setFollowButtonColor("#eb6f88");  ///LIGHT RED
    }
    else if(followButtonColor=="#21a366") ///GREEN
    {
        setFollowButtonColor("#79c7a3"); ///LIGHT GREEN 
    }
       

  }
  function handleFollowButtonMouseLeave()
  {
    if(followButtonColor=="#eb6f88") ///LIGHT RED
    {
        setFollowButtonColor("#de1039"); ///RED
    }
    else if (followButtonColor=="#79c7a3") ///LIGTH GREEN
    {
        setFollowButtonColor("#21a366"); ///GREEN
    }


  }

  function handleFollowButtonClick()
  {
    fetch(`http://localhost:5139/api/Followers/CheckFollowing/${JSON.parse(localStorage.userInfo).idname}/${IdName}`)
    .then(response => {
     if (!response.ok) {
       throw new Error('An error occurred');
     }
     return response.json();
   })
   .then(data => {
     if(data==true)
     {
       setFollowButtonColor("#21a366")
       setFollowButtonText("Follow")

       fetch(`http://localhost:5139/api/Followers/RemoveFollowerByIdName/${JSON.parse(localStorage.userInfo).idname}/${IdName}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      })

     }
     else if(data==false)
     {
       setFollowButtonColor("#de1039")
       setFollowButtonText("Unfollow")
       fetch(`http://localhost:5139/api/Followers/AddFollowerByIdName/${JSON.parse(localStorage.userInfo).idname}/${IdName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
       
     }
   })
   .catch(error => {
     console.error('Follow button click error:', error);
     navigate('/');
   });
  }



  

  return (
    <div 
    className={styles.ProfilePageBannerBackground}    
    style={{
      backgroundImage: `url(${props.bannerPicture})`,
    }}>
      <div className={styles.ProfilePageBannerParent}>
        <div className={styles.ProfilePageBannerProfilePic} style={{borderColor:`${borderColor}`}}><img src={props.profilePicture} className={styles.ProfilePageBannerProfilePicContent} /></div>
        <div style={{backgroundColor:'rgba(0,0,0,0.3)',color:'white',borderRadius:'5px'}}><div style={{fontSize:'2em'}}> {props.displayName}</div><div style={{fontSize:'1.5em'}}>@{props.idName}</div></div>
        <div className={styles.ProfilePageBannerButtonGroup}>
          {followButtonActive &&
          <button className={styles.ProfilePageBannerFollowButton}  style={{background:followButtonColor}} onMouseEnter={()=>handleFollowButtonMouseEnter()} onMouseLeave={()=>handleFollowButtonMouseLeave()} onClick={handleFollowButtonClick} >
            {followButtonText}
          </button>
          }
          { settingsButtonActive &&
          <button className={styles.ProfilePageBannerSettingsButton} onClick={()=>navigate('/settings')}>
            Settings
          </button>
          }
            {IdName ==JSON.parse(localStorage.userInfo).idname &&
          <button
            className={styles.ProfilePageBannerPlusButton}
            onClick={() => setIsModalOpen(true)}
          >
            +
          </button>
            }
        </div>
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2>Create New Post</h2>
            <textarea
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              placeholder="What's on your mind?"
              className={styles.modalTextarea}
            />
            <div className={styles.modalButtons}>
              <button onClick={handlePost} className={styles.modalPostButton}>
                Post
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className={styles.modalCancelButton}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfilePageBanner;
