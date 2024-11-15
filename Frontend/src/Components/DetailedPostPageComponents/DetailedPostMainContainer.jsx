import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import styles from "./DetailedPostMainContainer.module.css";

// Import image assets
import likeBlack from "../../Assets/like_black.png";
import likeGreen from "../../Assets/like_green.png";
import likeBlue from "../../Assets/like_blue.png";
import dislikeBlack from "../../Assets/dislike_black.png";
import dislikeRed from "../../Assets/dislike_red.png";
import dislikeBlue from "../../Assets/dislike_blue.png";
import trashBlack from "../../Assets/trash.png";
import trashRed from "../../Assets/trash_red.png";

function DetailedPostMainContainer() {
  const [mainPostData, setMainPostData] = useState(null);
  const [mainPosterData, setMainPosterData] = useState(null);
  const [borderColor, setBorderColor] = useState("");
  const [trashColor, setTrashColor] = useState(trashBlack);
  const [totalLikes, setTotalLikes] = useState(0);
  const [totalDislikes, setTotalDislikes] = useState(0);
  const [likeColor, setLikeColor] = useState(likeBlack);
  const [dislikeColor, setDislikeColor] = useState(dislikeBlack);

  const { PostId } = useParams();
  const navigate = useNavigate();

  function handleLikeEnter() {
    if (likeColor === likeBlack) {
      setLikeColor(likeBlue);
    }
  }

  function handleLikeLeave() {
    if (likeColor !== likeGreen) {
      setLikeColor(likeBlack);
    }
  }

  function handleDislikeEnter() {
    if (dislikeColor === dislikeBlack) {
      setDislikeColor(dislikeBlue);
    }
  }

  function handleDislikeLeave() {
    if (dislikeColor !== dislikeRed) {
      setDislikeColor(dislikeBlack);
    }
  }

  function handleLikeDislike(vote) {
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        postId: mainPostData.postId,
        userId: JSON.parse(localStorage.getItem('userInfo')).userId,
        voteType: vote
      })
    };

    if (vote === "like") {
      if (likeColor === likeBlack && dislikeColor === dislikeBlack) {
        setTotalLikes(totalLikes + 1);
      } else if (likeColor === likeBlack && dislikeColor === dislikeRed) {
        setTotalLikes(totalLikes + 1);
        setTotalDislikes(totalDislikes - 1);
      }
      setLikeColor(likeGreen);
      setDislikeColor(dislikeBlack);
    } else if (vote === "dislike") {
      if (likeColor === likeBlack && dislikeColor === dislikeBlack) {
        setTotalDislikes(totalDislikes + 1);
      } else if (likeColor === likeGreen && dislikeColor === dislikeBlack) {
        setTotalLikes(totalLikes - 1);
        setTotalDislikes(totalDislikes + 1);
      }
      setLikeColor(likeBlack);
      setDislikeColor(dislikeRed);
    }

    fetch('http://localhost:5139/MakeVote', requestOptions);
  }

  function handleBorderColor() {
    if (mainPosterData?.privacySetting === "private") {
      setBorderColor("#bf616a");
    } else if (mainPosterData?.privacySetting === "friends") {
      setBorderColor("#d08770");
    } else if (mainPosterData?.privacySetting === "public") {
      setBorderColor("#a3be8c");
    } else {
      setBorderColor("#bf616a"); // Default to private if privacySetting is not set
    }
  }

  function handleDeleteButton() {
    fetch(`http://localhost:5139/DeletePost/${mainPostData.postId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    navigate(`/profile/${mainPosterData.idname}`);
  }

  useEffect(() => {
    fetch(`http://localhost:5139/GetPostById/${PostId}`)
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('No post with given Id was found');
        }
      })
      .then(data => setMainPostData(data))
      .catch(error => navigate('/'));

    fetch(`http://localhost:5139/api/Votes/TotalLikes/${PostId}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('An error occurred');
        }
        return response.json();
      })
      .then(data => {
        setTotalLikes(data);
      })
      .catch(error => {
        console.error('Error fetching user data:', error);
        setTotalLikes(0);
      });

    fetch(`http://localhost:5139/api/Votes/TotalDislikes/${PostId}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('An error occurred');
        }
        return response.json();
      })
      .then(data => {
        setTotalDislikes(data);
      })
      .catch(error => {
        console.error('Error fetching user data:', error);
        setTotalDislikes(0);
      });

    fetch(`http://localhost:5139/api/Votes/VoteStatus/${JSON.parse(localStorage.userInfo).idname}/${PostId}`)
      .then(response => {
        if (response.ok) {
          return response.text();
        } else {
          throw new Error("User or post not found");
        }
      })
      .then(data => {
        if (data === "Null") {
          setLikeColor(likeBlack);
          setDislikeColor(dislikeBlack);
        } else if (data === "Like") {
          setLikeColor(likeGreen);
          setDislikeColor(dislikeBlack);
        } else if (data === "Dislike") {
          setLikeColor(likeBlack);
          setDislikeColor(dislikeRed);
        }
      })
      .catch(error => console.log(error));
  }, [PostId, navigate]);

  useEffect(() => {
    if (mainPostData) {
      const userId = mainPostData.userId;
      fetch(`http://localhost:5139/api/Users/${userId}`)
        .then(response => {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error("Can't fetch main poster profile information");
          }
        })
        .then(data => setMainPosterData(data))
        .catch(error => navigate('/'));
    }
  }, [mainPostData, navigate]);

  useEffect(() => {
    handleBorderColor();
  }, [mainPostData, mainPosterData]);

  if (!mainPostData || !mainPosterData) {
    return null; // or a loading indicator
  }

  return (
    <div className={styles.DetailedPostMainContainer}>
      <div className={styles.DetailedPostHeader}>
        <div className={styles.ProfileImageContainer} style={{ borderColor: borderColor }} onMouseEnter={() => setBorderColor("#5e81ac")} onMouseLeave={() => handleBorderColor()}>
          <img className={styles.ProfileImageContent} src={mainPosterData.profilePicUrl} onClick={() => navigate(`/profile/${mainPosterData.idname}`)} />
        </div>
        <span className={styles.Username}>{mainPosterData.idname}</span>
      </div>
      <div className={styles.DetailedPostMainContentContainer}>{mainPostData.content}</div>
      <div className={styles.DetailedPostMainLikeDislikeCommentContainer}>
        <img
          src={likeColor}
          alt="Like icon"
          style={{ width: "25px", height: "25px" }}
          onClick={() => handleLikeDislike("like")}
          onMouseEnter={() => handleLikeEnter()}
          onMouseLeave={() => handleLikeLeave()}
        />
        {totalLikes}
        <img
          src={dislikeColor}
          alt="Dislike icon"
          style={{ width: "25px", height: "25px" }}
          onClick={() => handleLikeDislike("dislike")}
          onMouseEnter={() => handleDislikeEnter()}
          onMouseLeave={() => handleDislikeLeave()}
        />
        {totalDislikes}
        {localStorage.isLoggedIn === "true" && JSON.parse(localStorage.userInfo).idname === mainPosterData.idname && (
          <img
            src={trashColor}
            alt="Delete"
            style={{ width: "25px", height: "25px" }}
            onMouseEnter={() => setTrashColor(trashRed)}
            onMouseLeave={() => setTrashColor(trashBlack)}
            onClick={() => handleDeleteButton()}
          />
        )}
      </div>
    </div>
  );
}

export default DetailedPostMainContainer;