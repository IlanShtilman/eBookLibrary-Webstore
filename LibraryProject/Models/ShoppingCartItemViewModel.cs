namespace LibraryProject.Models;

public class ShoppingCartItemViewModel
{
    public string Username { get; set; }
    public int BookId { get; set; }
    public string Title { get; set; }
    public string Author { get; set; }
    public string Action { get; set; }
    public int Quantity { get; set; }
    public double Price { get; set; }
}