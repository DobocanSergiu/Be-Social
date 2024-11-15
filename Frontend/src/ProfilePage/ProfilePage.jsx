import NavBar from "../Components/NavBar";
import ProfilePageBanner from "../Components/ProfilePageComponents/ProfilePageBanner";
import PrfoilePagePostContainer from "../Components/ProfilePageComponents/ProfilePagePostContainer";
import React, { useEffect,useState } from "react";
import { useParams } from 'react-router-dom';
import { Navigate } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import ProfilePagePostContainer from "../Components/ProfilePageComponents/ProfilePagePostContainer";


function ProfilePage() {

  const { IdName } = useParams(); 
  const [userData,setUserData] = useState();
  const [userPosts,setUserPosts] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    document.body.style.backgroundColor = "#eceff4";
    if(localStorage.getItem("isLoggedIn")===null)
      { 
        localStorage.setItem("isLoggedIn",false);
        navigate('/login')

      }
    if(localStorage.getItem("isLoggedIn")=="false")
    {
      navigate('/login')
    }
     


    fetch(`http://localhost:5139/api/Users/FindIdName/${IdName}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('An error occurred');
        }
        return response.json();
      })
      .then(data => {
        setUserData(data);
      })
      .catch(error => {
        console.error('Error fetching user data:', error);
        navigate('/');
      });


    fetch(`http://localhost:5139/GetAllPostsOfUserByIdName/${IdName}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('An error occurred');
      }
      return response.json();
    })
    .then(posts => { 
      setUserPosts(
      posts.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    );
    })
    .catch(error => {
      setUserPosts([]);
    });
    
  }, [IdName, navigate]);

  if (!userData) {
    return null;
  }

  return (
    <React.Fragment>
      {localStorage.getItem("isLoggedIn")==="true" && <NavBar currentPage="profilePage" profilePicture={JSON.parse(localStorage.userInfo).profilePicUrl} />}
      <ProfilePageBanner profilePicture={userData.profilePicUrl} displayName={userData.displayName} idName={userData.idname} bannerPicture={userData.bannerPicUrl} privacySetting={userData.privacySetting} />
      {
        userPosts.map((post)=>{
          return (<ProfilePagePostContainer postData={post} />);
        })
      }
    </React.Fragment>
  );
} 
export default ProfilePage;
