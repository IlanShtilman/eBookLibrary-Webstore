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

            // Calculate the current price based on action and discount
            double pricePerItem;
            if (cartItem.Action.ToLower() == "buy")
            {
                // Check if book is on discount
                pricePerItem = book.IsOnDiscount ? book.DiscountedBuyPrice.Value : book.BuyPrice;
            }
            else
            {
                pricePerItem = book.BorrowPrice; // Borrow price doesn't have discounts
            }

            cartItem.Price = pricePerItem * quantity;

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
            // If removing a borrowed book, increment available copies
            if (cartItem.Action.ToLower() == "borrow")
            {
                var book = await _context.Books.FindAsync(bookId);
                book.AvailableCopies++;
            }

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
    
    var existingItem = await _context.ShoppingCarts
        .FirstOrDefaultAsync(s => s.BookId == bookId && s.Username == username);
    
    if (existingItem != null)
    {
        // If trying to change to borrow, check the current borrow count
        if (newAction.ToLower() == "borrow")
        {
            var currentBorrowCount = await _context.ShoppingCarts
                .CountAsync(sc => sc.Username == username && 
                           sc.Action.ToLower() == "borrow" && 
                           sc.BookId != bookId); // Exclude current book from count

            if (currentBorrowCount >= 3)
            {
                return Json(new { 
                    success = false, 
                    message = "You can only borrow up to 3 books at a time.",
                    currentAction = existingItem.Action
                });
            }
        }

        var book = await _context.Books.FindAsync(bookId);

        // If changing from borrow to buy, increment available copies
        if (existingItem.Action.ToLower() == "borrow" && newAction.ToLower() == "buy")
        {
            book.AvailableCopies++;
        }
        // If changing from buy to borrow, decrement available copies
        else if (existingItem.Action.ToLower() == "buy" && newAction.ToLower() == "borrow")
        {
            book.AvailableCopies--;
        }

        _context.ShoppingCarts.Remove(existingItem);

        // Calculate the appropriate price based on action and discount
        double price;
        if (newAction.ToLower() == "buy")
        {
            price = book.IsOnDiscount ? book.DiscountedBuyPrice.Value : book.BuyPrice;
        }
        else
        {
            price = book.BorrowPrice;
        }

        var newCartItem = new ShoppingCart
        {
            Username = username,
            BookId = bookId,
            Action = newAction.ToLower(),
            Quantity = 1,
            Price = price
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