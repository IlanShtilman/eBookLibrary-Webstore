using LibraryProject.Data;
using LibraryProject.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LibraryProject.Controllers;

public class ShoppingCartController : Controller
{
    private readonly MVCProjectContext _context;

    public ShoppingCartController(MVCProjectContext context)
    {
        _context = context;
    }
    
    // GET
    [HttpGet]
    public async Task<IActionResult> Index()
    {
        string username = HttpContext.Session.GetString("Username");
        if (string.IsNullOrEmpty(username))
        {
            return RedirectToAction("Login", "User");
        }

        var cartItems = await _context.ShoppingCarts
            .Where(s => s.Username == username)
            .Join(_context.Books, 
                s => s.BookId, 
                b => b.BookId, 
                (s, b) => new 
                {
                    s.Username,
                    s.BookId,
                    s.Action,
                    s.Quantity,
                    s.Price,
                    b.Title,
                    b.Author
                })
            .ToListAsync();
        
        return View(cartItems);
    }
}