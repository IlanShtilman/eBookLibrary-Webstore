using LibraryProject.Models;
using System.ComponentModel.DataAnnotations;

public class Wishlist
{
    [Key]
    public string Username { get; set; }
    public int BookId { get; set; }
}