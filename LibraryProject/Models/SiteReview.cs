using System.ComponentModel.DataAnnotations;

namespace LibraryProject.Models;

public class SiteReview
{
    [Key]
    public int Id { get; set; }
    public string Username { get; set; }
    public string Title { get; set; }
    public string Content { get; set; }
    public int Rating { get; set; }
    public DateTime CreatedAt { get; set; }
}