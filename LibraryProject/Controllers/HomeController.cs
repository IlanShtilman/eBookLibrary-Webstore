using System.Diagnostics;
using LibraryProject.Data;
using LibraryProject.Data.Enums;
using LibraryProject.Data;
using Microsoft.AspNetCore.Mvc;
using LibraryProject.Models;
using Microsoft.EntityFrameworkCore;

namespace LibraryProject.Controllers;

public class HomeController : Controller
{
    private readonly MVCProjectContext _context;
    private readonly ILogger<HomeController> _logger;

    public HomeController(ILogger<HomeController> logger, MVCProjectContext context)
    {
        _logger = logger;
        _context = context;
    }
    
    
    public async Task<IActionResult> Index()
    {
        ViewBag.Username = HttpContext.Session.GetString("Username");
        string username = HttpContext.Session.GetString("Username");
        ViewBag.Role = 0;
        ViewBag.isLogged = 0;
        if (username != null)
        {
            ViewBag.isLogged = 1;
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == username);
            if (user.Role == UserRole.Admin)
            {
                ViewBag.Role = 1;
            }
        }
        var reviews = await _context.Reviews
            .OrderByDescending(r => r.CreatedAt)
            .Take(5)
            .ToListAsync();
        ViewBag.Username = HttpContext.Session.GetString("Username");    
        return View(reviews);
    }
    
    
    public IActionResult Privacy()
    {
        return View();
    }

    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error()
    {
        return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
    }
}