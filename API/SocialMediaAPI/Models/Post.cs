using System;
using System.Collections.Generic;

namespace SocialMediaAPI.Models;

public partial class Post
{
    public int PostId { get; set; }

    public int? UserId { get; set; }

    public string Content { get; set; } = null!;

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual ICollection<Comment> Comments { get; set; } = new List<Comment>();

    public virtual User? User { get; set; }

    public virtual ICollection<Vote> Votes { get; set; } = new List<Vote>();
}
