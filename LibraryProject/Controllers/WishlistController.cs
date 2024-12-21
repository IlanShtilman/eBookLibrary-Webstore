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
            return RedirectToAction("Login", "User");
        }

        ViewBag.Username = username;
    
        var wishlists = await _context.Wishlist
            .Where(w => w.Username == username)
            .Join(_context.Books,
                w => w.BookId,
                b => b.BookId,
                (w, b) => b)
            .ToListAsync();

        return View("Wishlist", wishlists); 
    }
    
    [HttpPost]
    public async Task<IActionResult> RemoveFromWishlist(int bookId)
    {
        string username = HttpContext.Session.GetString("Username");
        if (string.IsNullOrEmpty(username))
        {
            return RedirectToAction("Login", "User");
        }

        // Find the wishlist entry
        var wishlistItem = await _context.Wishlist
            .FirstOrDefaultAsync(w => w.Username == username && w.BookId == bookId);

        if (wishlistItem != null)
        {
            _context.Wishlist.Remove(wishlistItem);
            await _context.SaveChangesAsync();
            return Json(new { success = true });
        }
        return Json(new { success = false });
    }
    
}

