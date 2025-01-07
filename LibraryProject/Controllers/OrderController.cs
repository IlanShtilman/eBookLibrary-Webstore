using LibraryProject.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LibraryProject.Controllers;

public class OrderController : Controller
{
    private readonly MVCProjectContext _context;

    public OrderController(MVCProjectContext context)
    {
        _context = context;
    }
    
    // GET
    public IActionResult Index()
    {
        return View();
    }
    
    //View Ordered Books
    public async Task<IActionResult> ViewOrderedBooks()
    {
        string username = HttpContext.Session.GetString("Username");

        if (string.IsNullOrEmpty(username))
        {
            return RedirectToAction("Login", "User");
        }
        
        ViewBag.Username = username;

        var orders = await _context.Orders
            .Where(o => o.Username == username)
            .GroupBy(o => o.OrderId) // Group by OrderId instead of OrderDate
            .Select(g => new
            {
                OrderId = g.Key,
                OrderDate = g.First().OrderDate, // Take the order date from any book in the order
                TotalPrice = g.Sum(o => o.Price * o.Quantity) + 10, // Multiply price by quantity
                Books = g.Count() // Number of books in the order
            })
            .OrderByDescending(o => o.OrderDate)
            .ToListAsync();

        return View(orders);
    }
    
    public async Task<IActionResult> OrderDetails(int orderId)
    {
        string username = HttpContext.Session.GetString("Username");

        if (string.IsNullOrEmpty(username))
        {
            return RedirectToAction("Login", "User");
        }

        var orderDetails = await _context.Orders
            .Where(o => o.OrderId == orderId && o.Username == username)
            .Join(_context.Books,
                order => order.BookId,
                book => book.BookId,
                (order, book) => new
                {
                    BookId = order.BookId,
                    BookTitle = book.Title,
                    Quantity = order.Quantity,
                    Action = order.Action,
                    Price = order.Price / order.Quantity,
                    TotalPrice = order.Price,
                    OrderDate = order.OrderDate
                })
            .ToListAsync();

        if (!orderDetails.Any())
        {
            return NotFound();
        }

        ViewBag.OrderDate = orderDetails.First().OrderDate;
        ViewBag.TotalOrderPrice = orderDetails.Sum(od => od.TotalPrice) + 10;
        
        return View(orderDetails);
    }
    
}