import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ProfilePagePostContainer.module.css";

// Import image assets
import likeBlack from "../../Assets/like_black.png";
import likeGreen from "../../Assets/like_green.png";
import likeBlue from "../../Assets/like_blue.png";
import dislikeBlack from "../../Assets/dislike_black.png";
import dislikeRed from "../../Assets/dislike_red.png";
import dislikeBlue from "../../Assets/dislike_blue.png";
import commentBlack from "../../Assets/comment.png";

function ProfilePagePostContainer(props) {
  const [totalLikes, setTotalLikes] = useState(0);
  const [totalDislikes, setTotalDislikes] = useState(0);
  const [totalComments, setTotalComments] = useState(0);
  const [likeColor, setLikeColor] = useState(likeBlack);
  const [dislikeColor, setDislikeColor] = useState(dislikeBlack);

  const navigate = useNavigate();
  const postId = props.postData.postId;
  const username = JSON.parse(localStorage.getItem("userInfo"))?.idname;

  const fetchData = () => {
    fetch(`http://localhost:5139/api/Votes/TotalLikes/${postId}`)
        .then(response => response.ok ? response.json() : Promise.reject("Error fetching likes"))
        .then(data => setTotalLikes(data))
        .catch(error => console.error(error));

    fetch(`http://localhost:5139/api/Votes/TotalDislikes/${postId}`)
        .then(response => response.ok ? response.json() : Promise.reject("Error fetching dislikes"))
        .then(data => setTotalDislikes(data))
        .catch(error => console.error(error));

    fetch(`http://localhost:5139/api/Comments/GetAllCommentsOfPost/${postId}`)
        .then(response => response.ok ? response.json() : Promise.reject("Error fetching comments"))
        .then(data => setTotalComments(Object.keys(data).length))
        .catch(error => console.error(error));

    if (localStorage.isLoggedIn === "true") {
      fetch(`http://localhost:5139/api/Votes/VoteStatus/${username}/${postId}`)
          .then(response => response.ok ? response.text() : Promise.reject("Error fetching vote status"))
          .then(status => {
            if (status === "Like") {
              setLikeColor(likeGreen);
              setDislikeColor(dislikeBlack);
            } else if (status === "Dislike") {
              setLikeColor(likeBlack);
              setDislikeColor(dislikeRed);
            } else {
              setLikeColor(likeBlack);
              setDislikeColor(dislikeBlack);
            }
          })
          .catch(error => console.error(error));
    }
  };

  useEffect(() => {
    fetchData();
  }, [postId]);

  function handleLikeDislike(e, vote) {
    e.stopPropagation();

    if (localStorage.isLoggedIn !== "true") return;

    const userId = JSON.parse(localStorage.getItem("userInfo")).userId;
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, userId, voteType: vote }),
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

    fetch("http://localhost:5139/MakeVote", requestOptions)
        .catch(error => console.error("Error making vote:", error));
  }

  function handleLikeEnter() {
    if (likeColor === likeBlack) setLikeColor(likeBlue);
  }

  function handleLikeLeave() {
    if (likeColor !== likeGreen) setLikeColor(likeBlack);
  }

  function handleDislikeEnter() {
    if (dislikeColor === dislikeBlack) setDislikeColor(dislikeBlue);
  }

  function handleDislikeLeave() {
    if (dislikeColor !== dislikeRed) setDislikeColor(dislikeBlack);
  }

  return (
      <div className={styles.ProfilePagePostContainer} onClick={() => navigate(`/post/${postId}`)}>
        <div className={styles.ProfilePagePostContentContainer}>
          {props.postData.content}
        </div>
        <div className={styles.ProfilePageLikeDislikeCommentContainer}>
          <img
              src={likeColor}
              alt="Like icon"
              style={{ width: "25px", height: "25px" }}
              onClick={(e) => handleLikeDislike(e, "like")}
              onMouseEnter={handleLikeEnter}
              onMouseLeave={handleLikeLeave}
          />{" "}
          {totalLikes}
          <img
              src={dislikeColor}
              alt="Dislike icon"
              style={{ width: "25px", height: "25px" }}
              onClick={(e) => handleLikeDislike(e, "dislike")}
              onMouseEnter={handleDislikeEnter}
              onMouseLeave={handleDislikeLeave}
          />{" "}
          {totalDislikes}
          <img
              src={commentBlack}
              alt="Comment icon"
              style={{ width: "25px", height: "25px" }}
          />{" "}
          {totalComments}
        </div>
      </div>
  );
}

export default ProfilePagePostContainer;
