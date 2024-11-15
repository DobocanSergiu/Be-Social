import { useEffect, useState } from "react";
import styles from "./DetailedPostCommentContainer.module.css";
import { useNavigate } from "react-router-dom";

function DetailedPostCommentContainer(props) {
  const [commentUser, setCommentUser] = useState(null);
  const [commentBorderColor, setCommentBorderColor] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchCommentUserData() {
      try {
        const response = await fetch(`http://localhost:5139/api/Users/${props.commentData.userId}`);
        if (!response.ok) {
          throw new Error("Can't find user");
        }
        const data = await response.json();
        setCommentUser(data);
        handleCommentBorderColor(data.privacySetting);
      } catch (error) {
        console.log(error);
        setCommentUser(null);
        navigate('/');
      }
    }

    fetchCommentUserData();
  }, [props.commentData.userId, navigate]);

  function handleCommentBorderColor(privacySetting) {
    if (privacySetting === "private") {
      setCommentBorderColor("#bf616a");
    } else if (privacySetting === "friends") {
      setCommentBorderColor("#d08770");
    } else if (privacySetting === "public") {
      setCommentBorderColor("#a3be8c");
    } else {
      setCommentBorderColor("#bf616a"); // Default to private if privacySetting is not set
    }
  }

  if (!commentUser) {
    return null; // or a loading indicator
  }

  return (
    <div className={styles.DetailedPostCommentMainContainer}>
      <div className={styles.DetailedPostCommentHeader} onClick={() => navigate(`/profile/${commentUser.idname}`)} >
        <div className={styles.ProfileImageCommentContainer} style={{ borderColor: commentBorderColor }} onMouseEnter={()=>setCommentBorderColor("#5e81ac")} onMouseLeave={()=>handleCommentBorderColor(commentUser.privacySetting)}>
          <img src={commentUser.profilePicUrl} className={styles.ProfileImageContent} />
        </div>
        <span className={styles.Username}>{commentUser.idname}</span>
      </div>
      <div className={styles.DetailedPostCommentContentContainer}>
        {props.commentData.content}
      </div>
    </div>
  );
}

export default DetailedPostCommentContainer;