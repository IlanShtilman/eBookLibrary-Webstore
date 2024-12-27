using System.ComponentModel.DataAnnotations;

namespace LibraryProject.Models;

public class WaitingList
{
    [Key]
    public int WaitingListId { get; set; }
    public string Username { get; set; }
    public int BookId { get; set; }
    public DateTime JoinDate { get; set; }
    public int Position { get; set; }
    public bool IsNotified { get; set; }
    public DateTime? NotificationDate { get; set; }
    public DateTime? ExpiryDate { get; set; }
}
