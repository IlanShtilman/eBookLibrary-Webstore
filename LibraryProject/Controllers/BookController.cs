using LibraryProject.Data;
using LibraryProject.Data.Enums;
using LibraryProject.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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
    
    [HttpGet]
    public async Task<IActionResult> Store(string searchQuery = null, string genre = null)
    {
        var query = _context.Books.AsQueryable();

        // Apply search filter
        if (!string.IsNullOrEmpty(searchQuery))
        {
            query = query.Where(b => b.Title.Contains(searchQuery) || 
                                     b.Author.Contains(searchQuery));
        }

        // Apply genre filter
        if (!string.IsNullOrEmpty(genre) && genre.ToLower() != "all")
        {
            if (Enum.TryParse<Genre>(genre, true, out Genre genreEnum))
            {
                query = query.Where(b => b.Genre == genreEnum);
            }
        }

        var books = await query.ToListAsync();
        return View("BookStore", books);
    }
    [HttpGet]
    public async Task<JsonResult> FilterBooks(string searchQuery = null, string genre = null)
    {
        var query = _context.Books.AsQueryable();

        if (!string.IsNullOrEmpty(searchQuery))
        {
            query = query.Where(b => b.Title.Contains(searchQuery) || 
                                     b.Author.Contains(searchQuery));
        }

        if (!string.IsNullOrEmpty(genre) && genre.ToLower() != "all")
        {
            if (Enum.TryParse<Genre>(genre, true, out Genre genreEnum))
            {
                query = query.Where(b => b.Genre == genreEnum);
            }
        }

        var books = await query.ToListAsync();
        return Json(books);
    }
}
