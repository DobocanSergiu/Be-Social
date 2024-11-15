import { useEffect } from "react";
import { useState } from "react";
import NavBar from "../Components/NavBar";
import DetailedPostMainContainer from "../Components/DetailedPostPageComponents/DetailedPostMainContainer";
import styles from "./DetailedPostPage.module.css";
import DetailedPostCommentContainer from "../Components/DetailedPostPageComponents/DetailedPostCommentContainer";
import { json, useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";

function DetailedPostPage() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [commentContent, setCommentContent] = useState("");
  const [comments, setComments] = useState([]);
  const { PostId } = useParams();

  useEffect(() => {
    document.body.style.backgroundColor = "#eceff4";
    if(localStorage.getItem("isLoggedIn") === null) {
      localStorage.setItem("isLoggedIn", false);
      navigate('/login')
    }
    if(localStorage.getItem("isLoggedIn") === "false") {
      navigate('/login')
    }
    
    fetch(`http://localhost:5139/api/Comments/GetAllCommentsOfPost/${PostId}`)
      .then(response => {
        if(response.ok) {
          return response.json();
        } else {
          throw new Error("Error finding comments")
        }
      })
      .then(data => {
        // Sort comments by creation date in descending order (newest first)
        const sortedComments = data.sort((a, b) => {
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
        setComments(sortedComments);
      })
      .catch(error => console.log(error));
  }, []);

  const handleComment = async () => {
    try {
      const response = await fetch('http://localhost:5139/api/Comments/AddComment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId: parseInt(PostId),
          userId: parseInt(JSON.parse(localStorage.userInfo).userId),
          content: commentContent,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('New comment created:', result);
        setCommentContent('');
        setIsModalOpen(false);
        // Instead of reloading the page, fetch and sort comments again
        const commentsResponse = await fetch(`http://localhost:5139/api/Comments/GetAllCommentsOfPost/${PostId}`);
        if (commentsResponse.ok) {
          const newComments = await commentsResponse.json();
          const sortedComments = newComments.sort((a, b) => {
            return new Date(b.createdAt) - new Date(a.createdAt);
          });
          setComments(sortedComments);
        }
      } else {
        const errorData = await response.text();
        console.error('Error creating comment:', response.status, errorData);
      }
    } catch (error) {
      console.error('Error making POST request:', error);
    }
  };

  return (
    <div>
      {localStorage.getItem("isLoggedIn") === "true" && 
        <NavBar 
          currentPage="detailedPostPage" 
          profilePicture={JSON.parse(localStorage.userInfo).profilePicUrl}
        />
      }
      <div className={styles.detailedPostPageParent}>
        <DetailedPostMainContainer />
        <div className={styles.commentSeparatorParent}>
          <span style={{ fontSize: "2em" }}>What's on your mind?</span>
          <button
            className={styles.commentButton}
            onClick={() => setIsModalOpen(true)}
          >
            Comment
          </button>
        </div>
        {comments.map(comment => (
          <DetailedPostCommentContainer  commentData={comment} />
        ))}
        {isModalOpen && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
              <h2>Create New Comment</h2>
              <textarea
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                placeholder="What's on your mind?"
                className={styles.modalTextarea}
              />
              <div className={styles.modalButtons}>
                <button
                  onClick={handleComment}
                  className={styles.modalPostButton}
                >
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
    </div>
  );
}

export default DetailedPostPage;