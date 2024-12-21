using System.Text;
using System.Text.Json.Nodes;
using LibraryProject.Data;
using LibraryProject.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Oracle.ManagedDataAccess.Client;

namespace LibraryProject.Controllers;

public class ShoppingCartController : Controller
{
    private string PaypalClientId { get; set; } = "";
    private string PaypalSecret { get; set; } = "";
    private string PaypalUrl { get; set; } = ""; 
    private readonly MVCProjectContext _context;

    public ShoppingCartController(MVCProjectContext context, IConfiguration configuration)
    {
        PaypalClientId = configuration["PaypalSettings:ClientId"];
        PaypalSecret = configuration["PaypalSettings:Secret"];
        PaypalUrl = configuration["PaypalSettings:Url"];
        _context = context;
    }

    // GET
    [HttpGet]
    public async Task<IActionResult> Index()
    {
        ViewBag.PaypalClientId = PaypalClientId;
        string username = HttpContext.Session.GetString("Username");
        if (string.IsNullOrEmpty(username))
        {
            return RedirectToAction("Login", "User");
        }

        var cartItems = await _context.ShoppingCarts
            .Where(s => s.Username == username)
            .Join(_context.Books,
                s => s.BookId,
                b => b.BookId,
                (s, b) => new
                {
                    s.Username,
                    s.BookId,
                    s.Action,
                    s.Quantity,
                    s.Price,
                    b.Title,
                    b.Author,
                    b.IsAvailableToBuy,
                    b.IsAvailableToBorrow
                })
            .ToListAsync();

        return View(cartItems);
    }

    [HttpPost]
    public async Task<IActionResult> UpdateQuantity(int bookId, int quantity)
    {
        string username = HttpContext.Session.GetString("Username");
        var cartItem = await _context.ShoppingCarts
            .FirstOrDefaultAsync(s => s.BookId == bookId && s.Username == username);

        if (cartItem != null)
        {
            var book = await _context.Books.FindAsync(bookId);
            cartItem.Quantity = quantity;

            // Calculate the current price based on action and discount
            double pricePerItem;
            if (cartItem.Action.ToLower() == "buy")
            {
                // Check if book is on discount
                pricePerItem = book.IsOnDiscount ? book.DiscountedBuyPrice.Value : book.BuyPrice;
            }
            else
            {
                pricePerItem = book.BorrowPrice; // Borrow price doesn't have discounts
            }

            cartItem.Price = pricePerItem * quantity;

            await _context.SaveChangesAsync();

            // Calculate new totals and count
            var newSubtotal = await _context.ShoppingCarts
                .Where(s => s.Username == username)
                .SumAsync(s => s.Price);

            var itemCount = await _context.ShoppingCarts
                .Where(s => s.Username == username)
                .CountAsync();

            return Json(new
            {
                success = true,
                newPrice = cartItem.Price,
                newSubtotal = newSubtotal,
                newTotal = newSubtotal + 10,
                itemCount = itemCount
            });
        }

        return Json(new { success = false });
    }

    [HttpPost]
    public async Task<IActionResult> RemoveItem(int bookId)
    {
        string username = HttpContext.Session.GetString("Username");
        var cartItem = await _context.ShoppingCarts
            .FirstOrDefaultAsync(s => s.BookId == bookId && s.Username == username);

        if (cartItem != null)
        {
            // If removing a borrowed book, increment available copies
            if (cartItem.Action.ToLower() == "borrow")
            {
                var book = await _context.Books.FindAsync(bookId);
                book.AvailableCopies++;
            }

            _context.ShoppingCarts.Remove(cartItem);
            await _context.SaveChangesAsync();

            var newSubtotal = await _context.ShoppingCarts
                .Where(s => s.Username == username)
                .SumAsync(s => s.Price);

            var itemCount = await _context.ShoppingCarts
                .Where(s => s.Username == username)
                .CountAsync();

            return Json(new
            {
                success = true,
                newSubtotal = newSubtotal,
                newTotal = newSubtotal + 10,
                itemCount = itemCount
            });
        }

        return Json(new { success = false });
    }

    [HttpPost]
    public async Task<IActionResult> UpdateAction(int bookId, string newAction)
    {
        string username = HttpContext.Session.GetString("Username");
        
        var existingItem = await _context.ShoppingCarts
            .FirstOrDefaultAsync(s => s.BookId == bookId && s.Username == username);
        
        if (existingItem != null)
        {
            // If trying to change to borrow, check the current borrow count
            if (newAction.ToLower() == "borrow")
            {
                var currentBorrowCount = await _context.ShoppingCarts
                    .CountAsync(sc => sc.Username == username && 
                               sc.Action.ToLower() == "borrow" && 
                               sc.BookId != bookId); // Exclude current book from count

                if (currentBorrowCount >= 3)
                {
                    return Json(new { 
                        success = false, 
                        message = "You can only borrow up to 3 books at a time.",
                        currentAction = existingItem.Action
                    });
                }
            }

            var book = await _context.Books.FindAsync(bookId);

            // If changing from borrow to buy, increment available copies
            if (existingItem.Action.ToLower() == "borrow" && newAction.ToLower() == "buy")
            {
                book.AvailableCopies++;
            }
            // If changing from buy to borrow, decrement available copies
            else if (existingItem.Action.ToLower() == "buy" && newAction.ToLower() == "borrow")
            {
                book.AvailableCopies--;
            }

            _context.ShoppingCarts.Remove(existingItem);

            // Calculate the appropriate price based on action and discount
            double price;
            if (newAction.ToLower() == "buy")
            {
                price = book.IsOnDiscount ? book.DiscountedBuyPrice.Value : book.BuyPrice;
            }
            else
            {
                price = book.BorrowPrice;
            }

            var newCartItem = new ShoppingCart
            {
                Username = username,
                BookId = bookId,
                Action = newAction.ToLower(),
                Quantity = 1,
                Price = price
            };
        
            _context.ShoppingCarts.Add(newCartItem);
            await _context.SaveChangesAsync();

            // Calculate new totals
            var newSubtotal = await _context.ShoppingCarts
                .Where(s => s.Username == username)
                .SumAsync(s => s.Price);

            return Json(new { 
                success = true, 
                newPrice = newCartItem.Price,
                newQuantity = newCartItem.Quantity,
                newSubtotal = newSubtotal,
                newTotal = newSubtotal + 10,
                currentAction = newCartItem.Action
            });
        }

        return Json(new { success = false });
    }

    /*
    public async Task<string> Token()
    {
        return await GetPaypalAccessToken();
    }
    */
    
    private async Task<string> GetPaypalAccessToken()
    {
        string accessToken = "";
        
        string url = PaypalUrl + "/v1/oauth2/token";
        using (var client = new HttpClient())
        {
            string credentials64 = Convert.ToBase64String(Encoding.UTF8.GetBytes(PaypalClientId + ":" + PaypalSecret));
            client.DefaultRequestHeaders.Add("Authorization", "Basic " + credentials64);
            var requestMessage = new HttpRequestMessage(HttpMethod.Post, url);
            requestMessage.Content = new StringContent("grant_type=client_credentials", null, "application/x-www-form-urlencoded");
            var httpResponse = await client.SendAsync(requestMessage);

            if (httpResponse.IsSuccessStatusCode)
            {
                var strResponse = await httpResponse.Content.ReadAsStringAsync();
                var jsonResponse = JsonNode.Parse(strResponse);
                if (jsonResponse != null)
                {
                    accessToken = jsonResponse["access_token"]?.ToString() ?? "";
                }
            }
        }
        
        return accessToken;
    }

    [HttpPost]
    public async Task<JsonResult> CreateOrder([FromBody] JsonObject data)
    {
        try 
        {
            var totalAmount = data?["amount"]?.ToString();
            
            // Validate amount format
            if (!decimal.TryParse(totalAmount, out decimal amount))
            {
                return new JsonResult(new { error = "Invalid amount format" }) { StatusCode = 400 };
            }

            // Ensure amount is positive and has exactly 2 decimal places
            amount = Math.Round(amount, 2);
            if (amount <= 0)
            {
                return new JsonResult(new { error = "Amount must be greater than 0" }) { StatusCode = 400 };
            }

            // Format amount with exactly 2 decimal places
            string formattedAmount = amount.ToString("0.00");

            // Create the request body
            JsonObject createOrderRequest = new JsonObject
            {
                {
                    "intent", "CAPTURE"
                },
                {
                    "purchase_units", new JsonArray
                    {
                        new JsonObject
                        {
                            {
                                "amount", new JsonObject
                                {
                                    { "currency_code", "USD" },
                                    { "value", formattedAmount }
                                }
                            }
                        }
                    }
                }
            };

            // Get access token
            string accessToken = await GetPaypalAccessToken();
            if (string.IsNullOrEmpty(accessToken))
            {
                return new JsonResult(new { error = "Failed to authenticate with PayPal" }) { StatusCode = 500 };
            }

            // Send request
            string url = $"{PaypalUrl}/v2/checkout/orders";
            using (var client = new HttpClient())
            {
                client.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");
                
                var requestMessage = new HttpRequestMessage(HttpMethod.Post, url);
                var jsonContent = createOrderRequest.ToString();
                
                requestMessage.Content = new StringContent(jsonContent, Encoding.UTF8, "application/json");

                var httpResponse = await client.SendAsync(requestMessage);
                var responseContent = await httpResponse.Content.ReadAsStringAsync();
                
                if (httpResponse.IsSuccessStatusCode)
                {
                    var jsonResponse = JsonNode.Parse(responseContent);
                    string paypalOrderId = jsonResponse?["id"]?.ToString();

                    if (!string.IsNullOrEmpty(paypalOrderId))
                    {
                        return new JsonResult(new { id = paypalOrderId });
                    }
                    
                    return new JsonResult(new { error = "Invalid PayPal response" }) { StatusCode = 500 };
                }
                
                return new JsonResult(new { error = $"PayPal API error: {responseContent}" }) { StatusCode = (int)httpResponse.StatusCode };
            }
        }
        catch (Exception ex)
        {
            return new JsonResult(new { error = "Internal server error" }) { StatusCode = 500 };
        }
    }

    [HttpPost]
    public async Task<JsonResult> CompleteOrder([FromBody] JsonObject data)
    {
        var orderId = data?["orderId"]?.ToString();
        if (orderId == null)
        {
            return new JsonResult("error");
        }
        
        string accessToken = await GetPaypalAccessToken();
        
        string url = PaypalUrl + "/v2/checkout/orders/" + orderId + "/capture";

        using (var client = new HttpClient())
        {
            client.DefaultRequestHeaders.Add("Authorization", "Bearer " + accessToken);
            
            var requestMessage = new HttpRequestMessage(HttpMethod.Post, url);
            requestMessage.Content = new StringContent("", Encoding.UTF8, "application/json");
            
            var httpResponse = await client.SendAsync(requestMessage);

            if (httpResponse.IsSuccessStatusCode)
            {
                var strResponse = await httpResponse.Content.ReadAsStringAsync();
                var jsonResponse = JsonNode.Parse(strResponse);

                if (jsonResponse != null)
                {
                    string paypalOrderStatus = jsonResponse["status"]?.ToString() ?? "";
                    if (paypalOrderStatus == "COMPLETED")
                    {
                        string username = HttpContext.Session.GetString("Username");
                        if (username == null)
                        {
                            return new JsonResult(new
                            {
                                status = "error",
                                message = "User not logged in."
                            });
                        }

                        int nextOrderId;
                        using (var connection = new OracleConnection(_context.Database.GetConnectionString()))
                        {
                            await connection.OpenAsync();
                            using (var command = new OracleCommand("SELECT PERSTIN.ORDER_SEQ.NEXTVAL FROM DUAL", connection))
                            {
                                nextOrderId = Convert.ToInt32(await command.ExecuteScalarAsync());
                            }
                        }

                        var cartItems = await _context.ShoppingCarts
                            .Where(item => item.Username == username)
                            .ToListAsync();

                        using (var connection = new OracleConnection(_context.Database.GetConnectionString()))
                        {
                            await connection.OpenAsync();
                            foreach (var item in cartItems)
                            {
                                using (var command = new OracleCommand(
                                           "INSERT INTO Orders (OrderId, Username, BookId, Action, Quantity, Price, OrderDate) VALUES (:OrderId, :Username, :BookId, :Action, :Quantity, :Price, :OrderDate)", connection))
                                {
                                    command.Parameters.Add(new OracleParameter("OrderId", nextOrderId));
                                    command.Parameters.Add(new OracleParameter("Username", item.Username));
                                    command.Parameters.Add(new OracleParameter("BookId", item.BookId));
                                    command.Parameters.Add(new OracleParameter("Action", item.Action));
                                    command.Parameters.Add(new OracleParameter("Quantity", item.Quantity));
                                    command.Parameters.Add(new OracleParameter("Price", item.Price));
                                    command.Parameters.Add(new OracleParameter("OrderDate", DateTime.Now));
                                    await command.ExecuteNonQueryAsync();
                                }
                            }
                        }
                        
                        _context.ShoppingCarts.RemoveRange(cartItems);
                        await _context.SaveChangesAsync();
                        
                        // SAVE ORDER IN DB!!!
                        return new JsonResult(new
                        {
                            status = "success",
                            redirectUrl = Url.Action("Index", "Home")
                        });
                    }
                }
            }
        }

        return new JsonResult("error");
    }
    
}