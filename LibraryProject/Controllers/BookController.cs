using LibraryProject.Data;
using LibraryProject.Data.Enums;
using LibraryProject.Models;
using Microsoft.AspNetCore.Mvc;

namespace LibraryProject.Controllers;

public class BookController : Controller
{
    private readonly MVCProjectContext _context;

    public BookController(MVCProjectContext context)
    {
        _context = context;
    }
    
    // GET
    public IActionResult Index()
    {
        return View();
    }
    
    public ActionResult ViewBook()
    {
        // An action for viewing book.
        Book book = new Book
        {
            BookId = 1,
            Title = "The book",
            Author = "Yossi Cohen",
            Publisher = "Toni Boni",
            PublishYear = 1990,
            Genre = Genre.Fantasy,
            BuyPrice = 15.99,
            BorrowPrice = 10.99
        };
        return View("ViewBook", book);
    }
    
    [HttpGet]
    public IActionResult AddBook()
    {
        // An action for user login.
        return View(new Book());
    }

    [HttpPost]
    public async Task<IActionResult> AddBook(Book book)
    {
        if (ModelState.IsValid)
        {
            try
            {
                _context.Books.Add(book);
                await _context.SaveChangesAsync();
                return RedirectToAction("Index", "Home");
            }
            catch (Exception ex)
            {
                ModelState.AddModelError("", "An error occured while registering book.");
                return View(book);
            }
        }
        return View(book);
    }
}