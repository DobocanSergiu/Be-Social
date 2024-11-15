using System;
using System.Collections.Generic;

namespace SocialMediaAPI.Models;

public partial class User
{
    public int UserId { get; set; }

    public string Idname { get; set; } = null!;

    public string DisplayName { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string PasswordHash { get; set; } = null!;

    public string PasswordSalt { get; set; } = null!;

    public string? Bio { get; set; }

    public string? ProfilePicUrl { get; set; }

    public string? BannerPicUrl { get; set; }

    public string PrivacySetting { get; set; } = null!;

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual ICollection<Comment> Comments { get; set; } = new List<Comment>();

    public virtual ICollection<Follower> FollowerFolloweds { get; set; } = new List<Follower>();

    public virtual ICollection<Follower> FollowerFollowerNavigations { get; set; } = new List<Follower>();

    public virtual ICollection<Post> Posts { get; set; } = new List<Post>();

    public virtual ICollection<Vote> Votes { get; set; } = new List<Vote>();
}
