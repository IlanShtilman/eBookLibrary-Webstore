using LibraryProject.Data;
using LibraryProject.Models;
using Microsoft.AspNetCore.Mvc;

namespace LibraryProject.Controllers;

// ContactController.cs
public class ContactController : Controller
{
    private readonly MVCProjectContext _context;

    public ContactController(MVCProjectContext context)
    {
        _context = context;
    }

    [HttpPost]
    public async Task<IActionResult> Submit([FromBody] Contact contact)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            contact.SubmissionDate = DateTime.Now;
            _context.Contacts.Add(contact);
            await _context.SaveChangesAsync();
            return Ok();
        }
        catch (Exception ex)
        {
            return StatusCode(500, "Failed to send message");
        }
    }
}