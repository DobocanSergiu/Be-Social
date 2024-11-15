import homeIcon from "../Assets/home.png";
import connectionsIcon from "../Assets/social-network.png";
import logoutIcon from "../Assets/logout.png";
import styles from "./NavBar.module.css";
import { Navigate, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function NavBar(props) {

  const navigate = useNavigate();
  const [hoverHomeIcon, setHoverHomeIcon] = useState(false);
  const [hoverConnectionsIcon,setHoverConnectionsIcon] = useState(false);
  const [hoverLogoutIcon, setHoverLogoutIcon] = useState(false);
  const [borderColor, setBorderColor]= useState("#bf616a")
  function handleBorderColor()
  {
    if(JSON.parse(localStorage.userInfo).privacySetting==="private")
    {
        setBorderColor("#bf616a")
      }
      else if(JSON.parse(localStorage.userInfo).privacySetting==="friends")
      {
        setBorderColor("#d08770")
      }
      else if(JSON.parse(localStorage.userInfo).privacySetting==="public")
      {
        setBorderColor("#a3be8c")
      }
  
  
  }

 
  useEffect(()=>{
     handleBorderColor();
  },[])
  
  return (
    <div className={styles.NavBarParent} >
      <div className={styles.NavBarProfilePic} style={{borderColor:`${borderColor}`}} onClick={()=>navigate(`/profile/${JSON.parse(localStorage.getItem('userInfo'))['idname']}`)} onMouseEnter={()=>setBorderColor("#2f435b")} onMouseLeave={()=>handleBorderColor()} ><img src={props.profilePicture}   className={styles.NavBarProfilePicContent}/></div>

      <div className={styles.NavBarIconsPadding} >
        <img src={homeIcon} alt="Home" className={styles.NavBarIcons} onClick={()=>navigate('/')} onMouseEnter={()=>setHoverHomeIcon(true)} onMouseLeave={()=>setHoverHomeIcon(false)} />
        {props.currentPage=="homePage" && <div className={styles.NavBarSelectedIconMarker} />}
        {props.currentPage!="homePage" && hoverHomeIcon==true && <div className={styles.NavBarSelectedIconMarker} style={{backgroundColor:'#2f435b'}}/>}

      </div>

      <div className={styles.NavBarIconsPadding}>
        <img
          src={connectionsIcon}
          alt="Connections"
          className={styles.NavBarIcons}
          onClick={()=>navigate('/connections')}  onMouseEnter={()=>setHoverConnectionsIcon(true)} onMouseLeave={()=>setHoverConnectionsIcon(false)}
        />
        {props.currentPage=="connectionsPage" && <div className={styles.NavBarSelectedIconMarker}  />}
        {props.currentPage!="connectionsPage"&& hoverConnectionsIcon==true && <div className={styles.NavBarSelectedIconMarker} style={{backgroundColor:'#2f435b'}}  />}
      </div>

      <div className={styles.NavBarIconsPadding} >
        <img src={logoutIcon} alt="Log out" className={styles.NavBarIcons} onClick={()=>navigate('/login')} onMouseEnter={()=>setHoverLogoutIcon(true)} onMouseLeave={()=>setHoverLogoutIcon(false)} />
        {props.currentPage=="loginPage" && <div className={styles.NavBarSelectedIconMarker} />}
        {props.currentPage!="loginPage" && hoverLogoutIcon==true && <div className={styles.NavBarSelectedIconMarker} style={{backgroundColor:'#2f435b'}}  />}

      </div>
    </div>
  );
}

export default NavBar;
