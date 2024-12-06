using System.ComponentModel.DataAnnotations;
using LibraryProject.Data.Enums;

namespace LibraryProject.Models;

public class Book
{
    [Key]
    public int BookId { get; set; }
    public string Title { get; set; }
    public string Author { get; set; }
    public string Publisher { get; set; }
    public int PublishYear { get; set; }
    public Genre Genre { get; set; }
    public AgeRestriction AgeRestriction { get; set; }
    
    public bool IsAvailableToBuy { get; set; }
    public bool IsAvailableToBorrow { get; set; }
    public int TotalCopies { get; set; }
    public int AvailableCopies { get; set; }
    public double BorrowPrice { get; set; }
    public double BuyPrice { get; set; }
    //public decimal? DiscountPrice { get; set; }
    //public DateTime? DiscountStartDate { get; set; }
    //public DateTime? DiscountEndDate { get; set; }
    
    /// CHECK IT!!!!
    public bool IsEpubAvailable { get; set; }
    public bool IsF2bAvailable { get; set; }
    public bool IsMobiAvailable { get; set; }
    public bool IsPdfAvailable { get; set; }
    
    //Relations
    //public ICollection<Review> Reviews { get; set; }
    //public ICollection<UserBook> BookUsers { get; set; }
}