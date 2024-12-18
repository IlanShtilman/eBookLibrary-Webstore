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
                    b.Author,
                    b.IsAvailableToBuy,
                    b.IsAvailableToBorrow
                })
            .ToListAsync();

        return View(cartItems);
    }

    [HttpPost]
    public async Task<IActionResult> UpdateQuantity(int bookId, int quantity)
    {
        string username = HttpContext.Session.GetString("Username");
        var cartItem = await _context.ShoppingCarts
            .FirstOrDefaultAsync(s => s.BookId == bookId && s.Username == username);

        if (cartItem != null)
        {
            var book = await _context.Books.FindAsync(bookId);
            cartItem.Quantity = quantity;
            cartItem.Price = cartItem.Action.ToLower() == "buy"
                ? book.BuyPrice * quantity
                : book.BorrowPrice * quantity;

            await _context.SaveChangesAsync();

            // Calculate new totals and count
            var newSubtotal = await _context.ShoppingCarts
                .Where(s => s.Username == username)
                .SumAsync(s => s.Price);

            var itemCount = await _context.ShoppingCarts
                .Where(s => s.Username == username)
                .CountAsync();

            return Json(new
            {
                success = true,
                newPrice = cartItem.Price,
                newSubtotal = newSubtotal,
                newTotal = newSubtotal + 10,
                itemCount = itemCount
            });
        }

        return Json(new { success = false });
    }

    [HttpPost]
    public async Task<IActionResult> RemoveItem(int bookId)
    {
        string username = HttpContext.Session.GetString("Username");
        var cartItem = await _context.ShoppingCarts
            .FirstOrDefaultAsync(s => s.BookId == bookId && s.Username == username);

        if (cartItem != null)
        {
            _context.ShoppingCarts.Remove(cartItem);
            await _context.SaveChangesAsync();

            var newSubtotal = await _context.ShoppingCarts
                .Where(s => s.Username == username)
                .SumAsync(s => s.Price);

            var itemCount = await _context.ShoppingCarts
                .Where(s => s.Username == username)
                .CountAsync();

            return Json(new
            {
                success = true,
                newSubtotal = newSubtotal,
                newTotal = newSubtotal + 10,
                itemCount = itemCount
            });
        }

        return Json(new { success = false });
    }

    [HttpPost]
    public async Task<IActionResult> UpdateAction(int bookId, string newAction)
    {
        string username = HttpContext.Session.GetString("Username");
    
        // First remove the existing item
        var existingItem = await _context.ShoppingCarts
            .FirstOrDefaultAsync(s => s.BookId == bookId && s.Username == username);
        
        if (existingItem != null)
        {
            _context.ShoppingCarts.Remove(existingItem);
            await _context.SaveChangesAsync();

            // Get book details
            var book = await _context.Books.FindAsync(bookId);
        
            // Create new cart item with the new action
            var newCartItem = new ShoppingCart
            {
                Username = username,
                BookId = bookId,
                Action = newAction.ToLower(),
                Quantity = 1,  // Start with quantity 1
                Price = newAction.ToLower() == "buy" ? book.BuyPrice : book.BorrowPrice
            };
        
            _context.ShoppingCarts.Add(newCartItem);
            await _context.SaveChangesAsync();

            // Calculate new totals
            var newSubtotal = await _context.ShoppingCarts
                .Where(s => s.Username == username)
                .SumAsync(s => s.Price);

            return Json(new { 
                success = true, 
                newPrice = newCartItem.Price,
                newQuantity = newCartItem.Quantity,
                newSubtotal = newSubtotal,
                newTotal = newSubtotal + 10,
                currentAction = newCartItem.Action
            });
        }
    
        return Json(new { success = false });
    }
}