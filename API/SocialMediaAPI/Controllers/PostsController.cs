using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SocialMediaAPI.Models;

namespace SocialMediaAPI.Controllers
{

    public class PostDto
    {
        public int PostId { get; set; }
        public int? UserId { get; set; }
        public string Content { get; set; }

        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public List<Comment> Comments { get; set; } = new();
        public User? User { get; set; }
        public List<Vote> Votes { get; set; } = new();
    }

    [Route("api/[controller]")]
    [ApiController]
    public class PostsController : ControllerBase
    {
        private readonly SocialMediaContext _context;

        public PostsController(SocialMediaContext context)
        {
            _context = context;
        }

        // GET Get all posts on entire social media
        [HttpGet("/GetAllPosts")]
        public async Task<ActionResult<IEnumerable<Post>>> GetPosts()
        {
            return await _context.Posts.ToListAsync();
        }

        // GET Get post based on post id
        [HttpGet("/GetPostById/{id}")]
        public async Task<ActionResult<Post>> GetPostById(int id)
        {
            var post = await _context.Posts.FindAsync(id);

            if (post == null)
            {
                return NotFound();
            }

            return post;
        }
        /// GET all posts created by a user, determined by id
        [HttpGet("/GetAllPostsOfUser/{id}")]
        public async Task<ActionResult<IEnumerable<Post>>> GetPostsOfUser(int id)
        {
            return await _context.Posts.Where(p=>p.UserId==id).ToListAsync();
        }

        /// GET all posts created by a user, determined by idname

        [HttpGet("/GetAllPostsOfUserByIdName/{idname}")]
        public async Task<ActionResult<IEnumerable<PostDto>>> GetPostsOfUserByIdName(string idname)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Idname == idname);

            if (user == null)
            {
                return NotFound();
            }

            var posts = await _context.Posts
                .Where(p => p.UserId == user.UserId)
                .Select(p => new PostDto
                {
                    PostId = p.PostId,
                    UserId = p.UserId,
                    Content = p.Content,
                    CreatedAt = p.CreatedAt,
                    UpdatedAt = p.UpdatedAt,
                    Comments = p.Comments.Select(c => new Comment()).ToList(),
                    User = null, 
                    Votes = p.Votes.Select(v => new Vote()).ToList()
                })
                .ToListAsync();

            return posts;
        }



        ///PUT Modify post based on post id
        [HttpPut("/ModifyPost/{id}")]
        public async Task<IActionResult> ModifyPost(int id, [FromBody] string newContent)
        {
            // Find the post by ID
            var post = await _context.Posts.FindAsync(id);
            if (post == null)
            {
                return NotFound("Post not found.");
            }

            // Update the post's content
            post.Content = newContent;
            post.UpdatedAt = DateTime.UtcNow; // Optional: track the update time if you have this column

            // Save changes to the database
            await _context.SaveChangesAsync();

            // Return success response
            return Ok("Post content updated successfully");
        }

        // POST Create new post
        [HttpPost("/CreateNewPost")]
        public async Task<ActionResult<Post>> CreatePost([FromBody] Post post)
        {
            if (post == null)
            {
                return BadRequest("Post cannot be null.");
            }

            _context.Posts.Add(post);
            await _context.SaveChangesAsync();

            return Ok("Post created succesfully");
        }

        // DELETE Delete post based on id (including related votes and comments)
        [HttpDelete("/DeletePost/{id}")]
        public async Task<IActionResult> DeletePost(int id)
        {
            // Find the post and include its comments
            var post = await _context.Posts.Include(p=>p.Votes).Include(p => p.Comments).FirstOrDefaultAsync(p => p.PostId == id);
            if (post == null)
            {
                return NotFound("Post not found.");
            }

            _context.Votes.RemoveRange(post.Votes);
            // Remove all associated comments
            _context.Comments.RemoveRange(post.Comments);


            // Remove the post
            _context.Posts.Remove(post);

            // Save changes to the database
            await _context.SaveChangesAsync();

            return Ok("Post and all associated comments deleted successfully.");
        }
        
        [HttpGet("/MostPopularPosts")]
        public async Task<ActionResult<IEnumerable<PostDto>>> GetMostLikedPosts()
        {
            var posts = await _context.Posts
                .OrderByDescending(p => p.Votes.Count)
                .Take(50)
                .Select(p => new PostDto
                {
                    PostId = p.PostId,
                    UserId = p.UserId,
                    Content = p.Content,
                })
                .ToListAsync();

            return posts;
        }
        
        private bool PostExists(int id)
        {
            return _context.Posts.Any(e => e.PostId == id);
        }
    }
}
