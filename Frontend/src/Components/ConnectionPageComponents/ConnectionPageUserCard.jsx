import styles from "./ConnectionPageUserCard.module.css";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function ConnectionPageUserCard(props) {
    const [userData, setUserData] = useState(null);
    const [borderColor, setBorderColor] = useState("#bf616a");
    const [isFollowing, setIsFollowing] = useState(false);
    const [followButtonColor, setFollowButtonColor] = useState("#21a366");
    const [followButtonText, setFollowButtonText] = useState("Follow");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userId = props.userId;
                const response = await fetch(`http://localhost:5139/api/Users/${userId}`);

                if (response.ok) {
                    const data = await response.json();
                    setUserData(data);
                    handleBorderColor(data.privacySetting);
                    checkFollowing(data.idname);
                } else {
                    throw new Error("Error finding user");
                }
            } catch (error) {
                setUserData(null);
            }
        };

        const checkFollowing = (idname) => {
            fetch(
                `http://localhost:5139/api/Followers/CheckFollowing/${JSON.parse(localStorage.userInfo).idname}/${idname}`
            )
                .then((response) => response.json())
                .then((isFollowing) => {
                    setIsFollowing(isFollowing);
                    updateFollowButtonState(isFollowing);
                })
                .catch((error) => {
                    console.error("Error checking follower status:", error);
                });
        };

        fetchData();
    }, [props.userId]);

    const updateFollowButtonState = (isFollowing) => {
        if (isFollowing) {
            setFollowButtonText("Unfollow");
            setFollowButtonColor("#de1039");
        } else {
            setFollowButtonText("Follow");
            setFollowButtonColor("#21a366");
        }
    };

    function handleBorderColor(privacySetting) {
        if (privacySetting === "private") {
            setBorderColor("#bf616a");
        } else if (privacySetting === "friends") {
            setBorderColor("#d08770");
        } else if (privacySetting === "public") {
            setBorderColor("#a3be8c");
        }
    }

    const handleFollowClick = async () => {
        const loggedInUserId = JSON.parse(localStorage.userInfo).idname;
        const targetUserId = userData.idname;

        try {
            if (isFollowing) {
                await fetch(
                    `http://localhost:5139/api/Followers/RemoveFollowerByIdName/${loggedInUserId}/${targetUserId}`,
                    {
                        method: "DELETE",
                    }
                );
                setIsFollowing(false);
                updateFollowButtonState(false);
            } else {
                await fetch(
                    `http://localhost:5139/api/Followers/AddFollowerByIdName/${loggedInUserId}/${targetUserId}`,
                    {
                        method: "POST",
                    }
                );
                setIsFollowing(true);
                updateFollowButtonState(true);
            }
        } catch (error) {
            console.error("Error updating follow status:", error);
        }
    };

    if (!userData) return null; // Conditional rendering to handle null userData


    return (
        <div className={styles.userCard}>
            <div
                className={styles.profilePicture}
                style={{ borderColor: borderColor }}
                onMouseEnter={() => setBorderColor("#2f435b")}
                onMouseLeave={() => handleBorderColor(userData.privacySetting)}
            >
                <img
                    src={userData.profilePicUrl}
                    className={styles.ProfileImageContent}
                    onClick={() => navigate(`/profile/${userData.idname}`)}
                />
            </div>

            <div className={styles.userInfo}>
                <span className={styles.userId}>{userData.idname}</span>
                <span className={styles.userName}>{userData.displayName}</span>
            </div>

            <button
                className={styles.followButton}
                style={{ backgroundColor: followButtonColor }}
                onClick={handleFollowClick}
            >
                {followButtonText}
            </button>
        </div>
    );
}

export default ConnectionPageUserCard;