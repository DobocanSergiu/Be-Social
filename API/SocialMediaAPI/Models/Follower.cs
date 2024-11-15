using System;
using System.Collections.Generic;

namespace SocialMediaAPI.Models;

public partial class Follower
{
    public int FollowerId { get; set; }

    public int FollowedId { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual User Followed { get; set; } = null!;

    public virtual User FollowerNavigation { get; set; } = null!;
}
