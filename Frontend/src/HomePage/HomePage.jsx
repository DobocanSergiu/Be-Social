import NavBar from "../Components/NavBar";
import HomePagePostContainer from "../Components/HomePageComponents/HomePagePostContainer";
import { useEffect, useState } from "react";
import styles from "./HomePage.module.css";
import { useNavigate } from "react-router-dom";

function HomePage() {
  const navigate = useNavigate();
  const [listPost, setListPost] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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

  useEffect(() => {
    async function fetchPosts() {
      try {
        const response = await fetch('http://localhost:5139/MostPopularPosts');
        if (response.ok) {
          const data = await response.json();
          setListPost(data);
        } else {
          throw new Error("Error fetching posts");
        }
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPosts();
  }, []);

  return (
      <div>
        {localStorage.getItem("isLoggedIn") === "true" && (
            <NavBar
                currentPage="homePage"
                profilePicture={JSON.parse(localStorage.userInfo).profilePicUrl}
            />
        )}
        <div className={styles.HomePageParent}>
          <div className={styles.HomePageHeader}>Trending</div>
          {listPost.map(post=>{return <HomePagePostContainer post={post}/>})}

        </div>
      </div>
  );
}

export default HomePage;