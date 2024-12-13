using LibraryProject.Data;
using LibraryProject.Data.Enums;
using LibraryProject.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LibraryProject.Controllers;

public class WishlistController : Controller
{
    private readonly MVCProjectContext _context;

    public WishlistController(MVCProjectContext context)
    {
        _context = context;
    }
    
    //View User Wish list
    public async Task<IActionResult> Index()
    {
        string username = HttpContext.Session.GetString("Username");
        if (string.IsNullOrEmpty(username))
        {
            // User is not logged in, redirect to the Login page
            return RedirectToAction("Login", "User");
        }

        var wishlists = await _context.Wishlist
            .Where(w => w.Username == username)
            .ToListAsync();

        return View("Wishlist", wishlists);
    }
}

