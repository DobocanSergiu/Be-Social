using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography.Xml;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SocialMediaAPI.Models;

namespace SocialMediaAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FollowersController : ControllerBase
    {
        private readonly SocialMediaContext _context;

        public FollowersController(SocialMediaContext context)
        {
            _context = context;
        }

        // GET: Get all followers relations
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Follower>>> GetFollowers()
        {
            return await _context.Followers.ToListAsync();
        }

        // GET all id's of users followed by user with id
        [HttpGet("GetAllUsersFollowedBy/{id}")]
        public async Task<ActionResult<IEnumerable<int>>> GetAllFollows(int id)
        {
            var followedIds = await _context.Followers.Where(u=>u.FollowerId==id).Select(u=>u.FollowedId).ToListAsync();

            if (followedIds == null || followedIds.Count == 0)
            {
                return NotFound();
                
            }
            return Ok(followedIds);
            //return result;
        }

        /// Get all users who follow  id 
        [HttpGet("GetAllUsersWhoFollow/{id}")]
        public async Task<ActionResult<IEnumerable<int>>> GetAllUsersWhoFollow(int id)
        {
            var followedIds = await _context.Followers.Where(u => u.FollowedId == id).Select(u => u.FollowerId).ToListAsync();

            if (followedIds == null || followedIds.Count == 0)
            {
                return NotFound();
            }
            return Ok(followedIds);
            //return result;
        }
        /// POST Add follower relation
        [HttpPost("AddFollower/{followerId}/{followedId}")]
        public async Task<IActionResult> AddFollower(int followerId, int followedId)
        {
            var follower = await _context.Users.FindAsync(followerId);
            var followed = await _context.Users.FindAsync(followedId);

            if (follower == null || followed == null)
            {
                return BadRequest("Follower or followed user doesn't exist");
            }

            var existingRelation = await _context.Followers
                .FirstOrDefaultAsync(f => f.FollowerId == followerId && f.FollowedId == followedId);

            if (existingRelation != null)
            {
                return BadRequest("Follower relation already exists");
            }

            var newFollower = new Follower
            {
                FollowerId = followerId,
                FollowedId = followedId
            };

            _context.Followers.Add(newFollower);
            await _context.SaveChangesAsync();

            return Ok("Follower added successfully.");
        }        
        // DELETE: api/Follower/RemoveFollower
        [HttpDelete("RemoveFollower/{followerId}/{followedId}")]
        public async Task<IActionResult> RemoveFollower(int followerId, int followedId)
        {
            var follower = await _context.Users.FindAsync(followerId);
            var followed = await _context.Users.FindAsync(followedId);

            if (follower == null || followed == null)
            {
                return BadRequest("Follower or followed user doesn't exist");
            }

            var existingRelation = await _context.Followers
                .FirstOrDefaultAsync(f => f.FollowerId == followerId && f.FollowedId == followedId);

            if (existingRelation == null)
            {
                return NotFound($"User {followerId} is not following user {followedId}");
            }

            _context.Followers.Remove(existingRelation);
            await _context.SaveChangesAsync();

            return Ok($"User {followerId} has unfollowed user {followedId}");
        }

        [HttpPost("AddFollowerByIdName/{followerIdName}/{followedIdName}")]
        public async Task<IActionResult> AddFollower(string followerIdName, string followedIdName)
        {
            // Fetch users by idname instead of numeric ID
            var follower = await _context.Users.FirstOrDefaultAsync(u => u.Idname == followerIdName);
            var followed = await _context.Users.FirstOrDefaultAsync(u => u.Idname == followedIdName);

            if (follower == null || followed == null)
            {
                return BadRequest("Follower or followed user doesn't exist");
            }

            // Check if follower relationship already exists
            var existingRelation = await _context.Followers
                .FirstOrDefaultAsync(f => f.FollowerId == follower.UserId && f.FollowedId == followed.UserId);

            if (existingRelation != null)
            {
                return BadRequest("Follower relation already exists");
            }

            // Create new follower relationship
            var newFollower = new Follower
            {
                FollowerId = follower.UserId,
                FollowedId = followed.UserId
            };

            _context.Followers.Add(newFollower);
            await _context.SaveChangesAsync();

            return Ok("Follower added successfully.");
        }

        [HttpDelete("RemoveFollowerByIdName/{followerIdName}/{followedIdName}")]
        public async Task<IActionResult> RemoveFollower(string followerIdName, string followedIdName)
        {
            // Fetch users by idname instead of numeric ID
            var follower = await _context.Users.FirstOrDefaultAsync(u => u.Idname == followerIdName);
            var followed = await _context.Users.FirstOrDefaultAsync(u => u.Idname == followedIdName);

            if (follower == null || followed == null)
            {
                return BadRequest("Follower or followed user doesn't exist");
            }

            // Check if follower relationship exists
            var existingRelation = await _context.Followers
                .FirstOrDefaultAsync(f => f.FollowerId == follower.UserId && f.FollowedId == followed.UserId);

            if (existingRelation == null)
            {
                return NotFound($"User {followerIdName} is not following user {followedIdName}");
            }

            // Remove follower relationship
            _context.Followers.Remove(existingRelation);
            await _context.SaveChangesAsync();

            return Ok($"User {followerIdName} has unfollowed user {followedIdName}");
        }

        [HttpGet("CheckFollowing/{idname1}/{idname2}")]
        public async Task<ActionResult<bool>> CheckFollowing(string idname1, string idname2)
        {
            // First get the user IDs from the idnames
            var user1 = await _context.Users.FirstOrDefaultAsync(u => u.Idname == idname1);
            var user2 = await _context.Users.FirstOrDefaultAsync(u => u.Idname == idname2);

            if (user1 == null || user2 == null)
            {
                return BadRequest("One or both users don't exist");
            }

            // Check if follower relationship exists
            var followingExists = await _context.Followers
                .AnyAsync(f => f.FollowerId == user1.UserId && f.FollowedId == user2.UserId);

            return Ok(followingExists);
        }

        private bool FollowerExists(int id)
        {
            return _context.Followers.Any(e => e.FollowerId == id);
        }
    }
}
