using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SocialMediaAPI.Models;

namespace SocialMediaAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CommentsController : ControllerBase
    {
        private readonly SocialMediaContext _context;

        public CommentsController(SocialMediaContext context)
        {
            _context = context;
        }

        // GET: api/Comments/Post/{postId}
        // Retrieve all comments for a specific post
        [HttpGet("GetAllCommentsOfPost/{postId}")]
        public async Task<ActionResult<IEnumerable<Comment>>> GetCommentsByPost(int postId)
        {
            var comments = await _context.Comments
                .Where(c => c.PostId == postId)
                .ToListAsync();

            if (comments.Count==0)
            {
                return NotFound("No comments found for this post.");
            }

            return Ok(comments);
        }
        [HttpGet("GetAllCommentsOfUser/{userId}")]
        public async Task<ActionResult<IEnumerable<Comment>>> GetCommentsByUser(int userId)
        {
            var comments = await _context.Comments
                .Where(c => c.UserId == userId)
                .ToListAsync();

            if (comments == null)
            {
                return NotFound("No comments found for this user.");
            }

            return Ok(comments);
        }

        // POST: api/Comments
        // Add a new comment to a post
        [HttpPost("AddComment")]
        public async Task<ActionResult<Comment>> PostComment(Comment comment)
        {
            if (comment == null || comment.PostId == null || comment.UserId == null)
            {
                return BadRequest(new { message = "Invalid comment data." });
            }

            comment.CreatedAt = DateTime.UtcNow;
            comment.UpdatedAt = DateTime.UtcNow;
            _context.Comments.Add(comment);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Comment created successfully", comment = comment });
        }

        // GET: api/Comments/{id}
        // Retrieve a specific comment by its ID
        [HttpGet("GetComment/{id}")]
        public async Task<ActionResult<Comment>> GetComment(int id)
        {
            var comment = await _context.Comments
                .FirstOrDefaultAsync(c => c.CommentId == id);

            if (comment == null)
            {
                return NotFound();
            }

            return Ok(comment);
        }

        // PUT: api/Comments/{id}
        // Update a comment (only by the original comment poster)
        [HttpPut("EditComment/{id}")]
        public async Task<IActionResult> PutComment(int id, Comment comment)
        {
            if (id != comment.CommentId)
            {
                return BadRequest("Comment ID mismatch.");
            }

            // Fetch the comment from the database
            var existingComment = await _context.Comments.FindAsync(id);
            if (existingComment == null)
            {
                return NotFound();
            }

            // Check if the user trying to update is the original comment poster
            if (existingComment.UserId != comment.UserId)
            {
                return Unauthorized("You can only edit your own comments.");
            }

            // Update the comment content and updated timestamp
            existingComment.Content = comment.Content;
            existingComment.UpdatedAt = DateTime.UtcNow;

            _context.Entry(existingComment).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CommentExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Ok("Comment edited succesfully");
        }

        // DELETE: api/Comments/{id}
        // Delete a comment (only by the original commenter or the post owner)
        [HttpDelete("DeleteComment/{commentId}/{userId}")]
        public async Task<IActionResult> DeleteComment(int commentId, int userId)
        {
            // Fetch the comment from the database
            var comment = await _context.Comments.Include(c => c.Post).FirstOrDefaultAsync(c => c.CommentId == commentId);
            if (comment == null)
            {
                return NotFound();
            }

            // Check if the user trying to delete is either the original commenter or the post owner
            if (comment.UserId != userId && comment.Post.UserId != userId)
            {
                return Unauthorized("You can only delete your own comments or comments on your own post.");
            }

            _context.Comments.Remove(comment);
            await _context.SaveChangesAsync();

            return Ok("Comment deleted Sucesfully");
        }
        


        // Helper method to check if a comment exists by its ID
        private bool CommentExists(int id)
        {
            return _context.Comments.Any(e => e.CommentId == id);
        }
    }
}
