using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SocialMediaAPI.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SocialMediaAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VotesController : ControllerBase
    {
        private readonly SocialMediaContext _context;

        public VotesController(SocialMediaContext context)
        {
            _context = context;
        }

        [HttpPost("/MakeVote")]
        public async Task<IActionResult> MakeVote(Vote vote)
        {

            var existingVote = await _context.Votes
                .FirstOrDefaultAsync(v => v.PostId == vote.PostId && v.UserId == vote.UserId);

            if (existingVote != null)
            {
                // Update existing vote
                existingVote.VoteType = vote.VoteType;
                _context.Entry(existingVote).State = EntityState.Modified;
            }
            else
            {
                // Create new vote
                _context.Votes.Add(vote);
            }

            await _context.SaveChangesAsync();
            return Ok("Vote created or modified succesfully");
        }

        // Remove vote
        [HttpDelete("DeleteVote/{id}")]
        public async Task<IActionResult> RemoveVote(int id)
        {
            var vote = await _context.Votes.FindAsync(id);
            if (vote == null)
            {
                return NotFound();
            }

            _context.Votes.Remove(vote);
            await _context.SaveChangesAsync();
            return Ok("Vote removed succesfully");
        }

  
        // Get all posts liked by user
        [HttpGet("UserIdLikes/{userId}")]
        public async Task<IActionResult> GetLikedPosts(int userId)
        {
            var likedPosts = await _context.Votes
                .Where(v => v.UserId == userId && v.VoteType == "like")
                .Select(v => v.Post)
                .ToListAsync();

            return Ok(likedPosts);
        }

        // Get all posts disliked by user
        [HttpGet("UserIdDislikes/{userId}")]
        public async Task<IActionResult> GetDislikedPosts(int userId)
        {
            var dislikedPosts = await _context.Votes
                .Where(v => v.UserId == userId && v.VoteType == "dislike")
                .Select(v => v.Post)
                .ToListAsync();

            return Ok(dislikedPosts);
        }

        // Get all votes of a post
        [HttpGet("post/{postId}")]
        public async Task<IActionResult> GetVotesOfPost(int postId)
        {
            var votes = await _context.Votes
                .Where(v => v.PostId == postId)
                .ToListAsync();

            return Ok(votes);
        }

        // Get total likes of a post
        [HttpGet("TotalLikes/{postId}")]
        public async Task<IActionResult> GetTotalLikes(int postId)
        {
            var totalLikes = await _context.Votes
                .CountAsync(v => v.PostId == postId && v.VoteType == "like");

            return Ok(totalLikes);
        }

        // Get total dislikes of a post
        [HttpGet("TotalDislikes/{postId}")]
        public async Task<IActionResult> GetTotalDislikes(int postId)
        {
            var totalDislikes = await _context.Votes
                .CountAsync(v => v.PostId == postId && v.VoteType == "dislike");

            return Ok(totalDislikes);
        }

        private bool VoteExists(int id)
        {
            return _context.Votes.Any(e => e.VoteId == id);
        }

        // Helper method to get a single vote (used in CreatedAtAction)
        [HttpGet("{id}")]
        public async Task<ActionResult<Vote>> GetVote(int id)
        {
            var vote = await _context.Votes.FindAsync(id);

            if (vote == null)
            {
                return NotFound();
            }

            return vote;
        }


        [HttpGet("VoteStatus/{IdName}/{postId}")]
        public async Task<IActionResult>     GetVoteStatus(string IdName, int postId)
        {
            // Lookup the UserId based on the provided IdName
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Idname == IdName);
            if (user == null)
            {
                return NotFound($"User with name '{IdName}' not found.");
            }
            var post = await _context.Posts.FirstOrDefaultAsync(p => p.PostId == postId);
            if(post==null)
            {
                return NotFound($"Post with postid '{postId}' not found.");
            }

            // Now look up the Vote based on the UserId and PostId
            var vote = await _context.Votes.FirstOrDefaultAsync(v => v.PostId == postId && v.UserId == user.UserId);
            if (vote == null)
            {
                return Ok("Null");
            }
            else if (vote.VoteType == "like")
            {
                return Ok("Like");
            }
            else
            {
                return Ok("Dislike");
            }
        }
    }
  
}
