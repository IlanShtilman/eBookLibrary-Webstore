using LibraryProject.Data;
using LibraryProject.Data.Enums;
using LibraryProject.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LibraryProject.Controllers;

public class UserController : Controller
{
    private readonly MVCProjectContext _context;

    public UserController(MVCProjectContext context)
    {
        _context = context;
    }

    public async Task<IActionResult> Index()
    {
        var users = await _context.Users.ToListAsync();
        return View(users);
    }
    
    public ActionResult ViewUser(User user)
    {
        // An action for viewing user profile that logged in.
        if (ModelState.IsValid)
        {
            return View("ViewUser", user);
        }
        else
        {
            return View("Register", user);
        }
    }

    public ActionResult ChangePassword(string password, string newPass, string newPassConfirm)
    {
        // An action for changing user's password that logged in.
        return View("ChangePassword");

    }
    // Register Get/Post
    [HttpGet]
    public IActionResult Register()
    {
        return View(new User()); // Pass a new User object
    }
    [HttpPost]
    public async Task<IActionResult> Register(User user, string PassConfirm)
    {
        //ModelState.Clear();
        var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Username == user.Username);
        var existingEmail = await _context.Users.FirstOrDefaultAsync(u => u.Email == user.Email);
        if (existingUser != null)
        {
            ModelState.AddModelError("Username", "Username is already taken");
            return View(user);
        }

        if (existingEmail != null)
        {
            ModelState.AddModelError("Email", "Email is already taken");
            return View(user);
        }
        
        if (user.Password != PassConfirm)
        {
            ModelState.AddModelError("Password", "Passwords do not match");
            return View(user);
        }

        if (ModelState.IsValid)
        {
            try
            {
                user.Password = BCrypt.Net.BCrypt.HashPassword(user.Password);
                user.Role = UserRole.User;
                _context.Users.Add(user);
                await _context.SaveChangesAsync();
                HttpContext.Session.SetString("Username", user.Username);
                return RedirectToAction("Index", "Home");
            }
            catch (Exception ex)
            {
                ModelState.AddModelError("", "An error occured while registering user.");
                return View(user);
            }
        }
        return View(user);
    }
    
    //Login Get/Post
    [HttpGet]
    public IActionResult Login()
    {
        // An action for user login.
        return View("Login");
    }

    public async Task<IActionResult> Login(string Email, string Password)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == Email);

        if (user == null || !BCrypt.Net.BCrypt.Verify(Password, user.Password))
        {
            ViewBag.Message = user == null ? "No user found with this email" : "Incorrect password";
            return View("Login");
        }

        // Store username in session
        HttpContext.Session.SetString("Username", user.Username);
    
        return RedirectToAction("Index", "Home");
    }

    public IActionResult Logout()
    {
        HttpContext.Session.Clear(); // Clear all session data
        return RedirectToAction("Index", "Home");
    }
    
}