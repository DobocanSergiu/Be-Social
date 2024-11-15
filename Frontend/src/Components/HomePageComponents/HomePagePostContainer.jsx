import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./HomePagePostContainer.module.css";

// Import image assets
import likeBlack from "../../Assets/like_black.png";
import likeGreen from "../../Assets/like_green.png";
import likeBlue from "../../Assets/like_blue.png";
import dislikeBlack from "../../Assets/dislike_black.png";
import dislikeRed from "../../Assets/dislike_red.png";
import dislikeBlue from "../../Assets/dislike_blue.png";
import commentBlack from "../../Assets/comment.png";

function HomePagePostContainer(props) {
    const [userData, setUserData] = useState(null);
    const [borderColor, setBorderColor] = useState("");
    const [totalLikes, setTotalLikes] = useState(0);
    const [totalDislikes, setTotalDislikes] = useState(0);
    const [likeColor, setLikeColor] = useState(likeBlack);
    const [dislikeColor, setDislikeColor] = useState(dislikeBlack);

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

    function handleLikeDislike(e, vote) {
        e.stopPropagation(); // Prevent navigation when clicking like/dislike

        if (!localStorage.isLoggedIn === "true") {
            return; // Don't proceed if user is not logged in
        }

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                postId: props.post.postId,
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

        fetch('http://localhost:5139/MakeVote', requestOptions)
            .catch(error => console.error('Error making vote:', error));
    }

    function handleBorderColor() {
        if (userData?.privacySetting === "private") {
            setBorderColor("#bf616a");
        } else if (userData?.privacySetting === "friends") {
            setBorderColor("#d08770");
        } else if (userData?.privacySetting === "public") {
            setBorderColor("#a3be8c");
        } else {
            setBorderColor("#bf616a");
        }
    }

    useEffect(() => {
        const userId = props.post.userId;
        fetch(`http://localhost:5139/api/Users/${userId}`)
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error("Can't fetch poster information");
                }
            })
            .then(data => setUserData(data))
            .catch(error => console.log(error));

        fetch(`http://localhost:5139/api/Votes/TotalLikes/${props.post.postId}`)
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
                console.error('Error fetching likes data:', error);
                setTotalLikes(0);
            });

        fetch(`http://localhost:5139/api/Votes/TotalDislikes/${props.post.postId}`)
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
                console.error('Error fetching dislikes data:', error);
                setTotalDislikes(0);
            });

        // Get vote status if user is logged in
        if (localStorage.isLoggedIn === "true") {
            fetch(`http://localhost:5139/api/Votes/VoteStatus/${JSON.parse(localStorage.userInfo).idname}/${props.post.postId}`)
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
        }
    }, [props.post.userId, props.post.postId]);

    useEffect(() => {
        handleBorderColor();
    }, [userData]);

    if (!userData) {
        return null;
    }

    return (
        <div
            className={styles.HomePagePostMainContainer}
            onClick={() => navigate(`/post/${props.post.postId}`)}
        >
            <div className={styles.HomePagePostHeader}>
                <div
                    className={styles.ProfileImageContainer}
                    style={{ borderColor: borderColor }}
                    onMouseEnter={() => setBorderColor("#5e81ac")}
                    onMouseLeave={() => handleBorderColor()}
                >
                    <img
                        className={styles.ProfileImageContent}
                        src={userData.profilePicUrl}
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/profile/${userData.idname}`);
                        }}
                    />
                </div>
                <span className={styles.Username}>{userData.idname}</span>
            </div>
            <div className={styles.HomePagePostMainContentContainer}>
                {props.post.content}
            </div>
            <div className={styles.HomePagePostMainLikeDislikeCommentContainer}>
                <img
                    src={likeColor}
                    alt="Like icon"
                    style={{ width: "25px", height: "25px" }}
                    onClick={(e) => handleLikeDislike(e, "like")}
                    onMouseEnter={() => handleLikeEnter()}
                    onMouseLeave={() => handleLikeLeave()}
                />
                {totalLikes}
                <img
                    src={dislikeColor}
                    alt="Dislike icon"
                    style={{ width: "25px", height: "25px" }}
                    onClick={(e) => handleLikeDislike(e, "dislike")}
                    onMouseEnter={() => handleDislikeEnter()}
                    onMouseLeave={() => handleDislikeLeave()}
                />
                {totalDislikes}
                <img
                    src={commentBlack}
                    alt="Comment Icon"
                    style={{ width: "25px", height: "25px" }}
                />
                {props.post.commentCount || 0}
            </div>
        </div>
    );
}

export default HomePagePostContainer;