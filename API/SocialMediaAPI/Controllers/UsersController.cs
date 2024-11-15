using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Diagnostics;
using System.Linq;
using System.Reflection;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Web;
using System.Xml.Linq;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SocialMediaAPI.Models;

namespace SocialMediaAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly SocialMediaContext _context;

        public UsersController(SocialMediaContext context)
        {
            _context = context;
        }

        public class UserCreateDto
        {
            public string Idname { get; set; } = null!;
            public string DisplayName { get; set; } = null!;
            public string Email { get; set; } = null!;
            public string Password { get; set; } = null!;
            public string? Bio { get; set; }
            public string? ProfilePicUrl { get; set; }
            public string? BannerPicUrl { get; set; }
            public string PrivacySetting { get; set; } = null!;
        }
        private string SafeUrlDecode(string? url)
        {
      
            string newUrl;
            while ((newUrl = Uri.UnescapeDataString(url)) != url)
                url = newUrl;
            return newUrl;
        }

        // Helper method to safely encode URLs
      
        /// GET all users
        [HttpGet("GetAll")]
        public async Task<ActionResult<IEnumerable<object>>> GetUsers()
        {
            return await _context.Users
                .Select(u => new
                {
                    u.UserId,
                    u.Idname,
                    u.DisplayName,
                    u.Email,
                    u.Bio,
                    ProfilePicUrl = SafeUrlDecode(u.ProfilePicUrl),
                    BannerPicUrl = SafeUrlDecode(u.BannerPicUrl),
                    u.PrivacySetting,
                    u.CreatedAt,
                    u.UpdatedAt
                })
                .ToListAsync();
        }

        /// GET specific user based on ID
        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetUser(int id)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
            {
                return NotFound();
            }

            return new
            {
                user.UserId,
                user.Idname,
                user.DisplayName,
                user.Email,
                user.Bio,
                ProfilePicUrl = SafeUrlDecode(user.ProfilePicUrl),
                BannerPicUrl = SafeUrlDecode(user.BannerPicUrl),
                user.PrivacySetting,
                user.CreatedAt,
                user.UpdatedAt
            };
        }

        ///POST Create User
        [HttpPost("CreateUser")]
        public async Task<ActionResult<User>> CreateUser([FromBody] UserCreateDto userCreateDto)
        {
            var emailPattern = @"^[^@\s]+@[^@\s]+\.[^@\s]+$";
            if (!Regex.IsMatch(userCreateDto.Email, emailPattern))
            {
                return BadRequest("Invalid email format.");
            }
            // Check if Idname is unique
            if (_context.Users.Any(u => u.Idname == userCreateDto.Idname))
            {
                return Conflict("Idname must be unique.");
            }
            if (_context.Users.Any(u => u.Email == userCreateDto.Email))
            {
                return Conflict("Email must be unique.");
            }

            // Create a new User entity
            var user = new User
            {
                Idname = userCreateDto.Idname,
                DisplayName = userCreateDto.DisplayName,
                Email = userCreateDto.Email,
                Bio = userCreateDto.Bio,
                ProfilePicUrl = Uri.EscapeDataString(userCreateDto.ProfilePicUrl),
                BannerPicUrl = Uri.EscapeDataString(userCreateDto.BannerPicUrl),
                PrivacySetting = userCreateDto.PrivacySetting,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            // Generate salt and hash the password
            var salt = GenerateSalt();
            user.PasswordSalt = salt;
            user.PasswordHash = HashPassword(userCreateDto.Password, salt);

            // Add and save user to the database
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Return the created user
            return CreatedAtAction(nameof(GetUser), new { id = user.UserId }, user);
        }

        // DELETE user based on ID
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return Ok("User deleted successfully");
        }

        // GET return all User entries that contain given string in idname, displayname and or email (no duplicats)
        [HttpGet("Search")]
        public async Task<ActionResult<IEnumerable<object>>> SearchUsers([FromQuery] string searchString)
        {
            if (string.IsNullOrEmpty(searchString))
            {
                return BadRequest("Search string cannot be null or empty.");
            }

            var lowerSearchString = searchString.ToLower();

            var matchingUsers = await _context.Users
                .Where(u => u.Idname.ToLower().Contains(lowerSearchString) ||
                            u.Email.ToLower().Contains(lowerSearchString) ||
                            u.DisplayName.ToLower().Contains(lowerSearchString))
                .Select(u => new
                {
                    u.UserId,
                    u.Idname,
                    u.DisplayName,
                    u.Email,
                    u.Bio,
                    ProfilePicUrl = SafeUrlDecode(u.ProfilePicUrl),
                    BannerPicUrl = SafeUrlDecode(u.BannerPicUrl),
                    u.PrivacySetting,
                    u.CreatedAt,
                    u.UpdatedAt
                })
                .ToListAsync();

            if (matchingUsers == null || !matchingUsers.Any())
            {
                return NotFound("No users found matching the search criteria.");
            }

            return Ok(matchingUsers);
        }
        
        /// GET specific user based on idname
        [HttpGet("FindIdName/{idname}")]
        public async Task<ActionResult<object>> GetUser(string idname)
        {
            var user = _context.Users.FirstOrDefault(u => u.Idname == idname);

            if (user == null)
            {
                return NotFound();
            }

            return new
            {
                user.UserId,
                user.Idname,
                user.DisplayName,
                user.Email,
                user.Bio,
                ProfilePicUrl = SafeUrlDecode(user.ProfilePicUrl),
                BannerPicUrl = SafeUrlDecode(user.BannerPicUrl),
                user.PrivacySetting,
                user.CreatedAt,
                user.UpdatedAt
            };
        }

        /// PUT Change IDName of user with given id; Id names are unique
        [HttpPut("ModifyIDName/{id}/{newIdName}")]
        public async Task<IActionResult> ModifyIDName(int id, string newIdName)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            // Ensure the new IDName is unique
            if (_context.Users.Any(u => u.Idname == newIdName && u.UserId != id))
            {
                return Conflict("IDName must be unique.");
            }

            user.Idname = newIdName;
            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok("IDName updated successfully");
        }

        // PUT Change display name of user based on id
        [HttpPut("ModifyDisplayName/{id}/{newDisplayName}")]
        public async Task<IActionResult> ModifyDisplayName(int id, string newDisplayName)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            user.DisplayName = newDisplayName;
            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok("Display name updated successfully");
        }

        // PUT Change email of user based on id
        [HttpPut("ModifyEmail/{id}/{newEmail}")]
        public async Task<IActionResult> ModifyEmail(int id, string newEmail)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            user.Email = newEmail;
            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok("Email updated successfully");
        }

        // PUT Change bio of user based on id
        [HttpPut("ModifyBio/{id}/{newBio}")]
        public async Task<IActionResult> ModifyBio(int id, string newBio)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            user.Bio = newBio;
            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok("Bio updated successfully");
        }

        // PUT Change profile pic of user based on id
        [HttpPut("ModifyProfilePic/{id}/{newProfilePic}")]
        public async Task<IActionResult> ModifyProfilePic(int id, string newProfilePic)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            user.ProfilePicUrl = Uri.EscapeDataString(newProfilePic);
            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok("Profile picture updated successfully");
        }

        // PUT Change banner of profile pic based on id
        [HttpPut("ModifyBannerPic/{id}/{newBannerPic}")]
        public async Task<IActionResult> ModifyBannerPic(int id, string newBannerPic)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            user.BannerPicUrl = Uri.EscapeDataString(newBannerPic);
            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok("Banner picture updated successfully");
        }

        // PUT Change privacy setting of user based on id
        [HttpPut("ModifyPrivacySetting/{id}/{newPrivacySetting}")]
        public async Task<IActionResult> ModifyPrivacySetting(int id, string newPrivacySetting)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            user.PrivacySetting = newPrivacySetting;
            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok("Privacy setting updated successfully");
        }

        [HttpGet("Login/{id}/{password}")]
        public async Task<ActionResult<object>> Login(string id, string password)
        {
            User user = _context.Users.FirstOrDefault(u => u.Idname == id || u.Email == id);
            if (user != null)
            {
                var attempt_password = HashPassword(password, user.PasswordSalt);
                Console.WriteLine(attempt_password);
                if (attempt_password == user.PasswordHash)
                {
                    return new
                    {
                        user.UserId,
                        user.Idname,
                        user.DisplayName,
                        user.Email,
                        user.Bio,
                        ProfilePicUrl = SafeUrlDecode(user.ProfilePicUrl),
                        BannerPicUrl = SafeUrlDecode(user.BannerPicUrl),
                        user.PrivacySetting,
                        user.CreatedAt,
                        user.UpdatedAt
                    };
                }
                else
                {
                    return NotFound();
                }
            }
            else
            {
                return NotFound();
            }
        }

        // PUT Change password of user based on id;
        [HttpPut("ModifyPassword/{id}/{newPassword}")]
        public async Task<IActionResult> ModifyPassword(int id, string newPassword)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            // Generate a new 5-digit salt
            var newSalt = GenerateSalt();

            // Hash the concatenated password and salt
            var hashedPassword = HashPassword(newPassword, newSalt);

            // Update the user with the new hashed password, salt, and update the UpdatedAt field
            user.PasswordHash = hashedPassword;
            user.PasswordSalt = newSalt;
            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok("Password changed successfully");
        }

        // Helper method to generate a 5-digit salt
        private string GenerateSalt()
        {
            Random random = new Random();
            return random.Next(10000, 99999).ToString(); // Generates a random 5-digit number
        }

        // Helper method to hash the password with salt using SHA-256
        private string HashPassword(string password, string salt)
        {
            // Concatenate password and salt
            string passwordWithSalt = password + salt;

            // Use SHA-256 to hash the concatenated string
            using (SHA256 sha256Hash = SHA256.Create())
            {
                byte[] bytes = sha256Hash.ComputeHash(Encoding.UTF8.GetBytes(passwordWithSalt));

                // Convert the byte array to a hexadecimal string
                StringBuilder builder = new StringBuilder();
                for (int i = 0; i < bytes.Length; i++)
                {
                    builder.Append(bytes[i].ToString("x2")); // Convert each byte to a 2-digit hex string
                }
                return builder.ToString();
            }
        }

        private bool UserExists(int id)
        {
            return _context.Users.Any(e => e.UserId == id);
        }
    }
}