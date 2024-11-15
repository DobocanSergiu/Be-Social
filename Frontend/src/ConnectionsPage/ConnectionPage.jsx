import React, {useEffect, useState} from "react";
import connectionPageUserCard from "../Components/ConnectionPageComponents/ConnectionPageUserCard";
import NavBar from "../Components/NavBar";
import styles from "./ConnectionsPage.module.css";
import { useNavigate } from "react-router-dom";
import ConnectionPageUserCard from "../Components/ConnectionPageComponents/ConnectionPageUserCard";
function ConnectionsPage() {

  const [selectedTab,setSelectedTab] = useState("followers");
  const [followersList,setFollowersList] = useState([]);
  const [followingList,setFollowingList] = useState([]);
  const navigate =useNavigate();

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
     
  
  }, [NavBar,navigate]);


  useEffect(() => {
    const userId= (JSON.parse(localStorage.userInfo).userId)
    ///fetching followers list
    fetch(`http://localhost:5139/api/Followers/GetAllUsersWhoFollow/${userId}`).then
    (response=>{
      if(response.ok)
      {
        return response.json();
      }
      else
      {
        throw new Error("No followers found");
      }
    }).then(data=>setFollowersList((data)))
        .catch(error=>setFollowersList([]));
    ///fetching following list
    fetch(`http://localhost:5139/api/Followers/GetAllUsersFollowedBy/${userId}`).then
    (response=>{
      if(response.ok)
      {
        return response.json();
      }
      else
      {
        throw new Error("No followers found");
      }
    }).then(data=>setFollowingList((data)))
        .catch(error=>setFollowingList([]));


  }, []);
  return (
    <React.Fragment>
      {localStorage.getItem("isLoggedIn")==="true" && <NavBar currentPage="connectionsPage" profilePicture={JSON.parse(localStorage.userInfo).profilePicUrl} />}
      <div className={styles.Parent}>
        <div className={styles.tabContainer}>
          <div className={styles.tab} onClick={()=>setSelectedTab("followers")} >
            Followers
            {selectedTab==="followers" && <div className={styles.tabUnderline}></div>}
          </div>
          <div className={styles.tab} onClick={()=>setSelectedTab("following")} >
            Following
            {selectedTab==="following" && <div className={styles.tabUnderline}></div>}
          </div>
        </div>
        {selectedTab==="followers" && followersList.map(userId=>
        {
        return(<ConnectionPageUserCard userId={userId} parentComponent="followers"/>);
        })}

        {selectedTab==="following" && followingList.map(userId=>
        {
        return(<ConnectionPageUserCard userId={userId} parentComponent="following"/>);
        })}
      </div>
    </React.Fragment>
  );
}

export default ConnectionsPage;
