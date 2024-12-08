namespace LibraryProject.Models;

public class Review
{
    public int Id { get; set; }
    public int Rating { get; set; }
    public string Title { get; set; }
    public string Content { get; set; }
    public DateTime CreatedAt { get; set; }
    
}