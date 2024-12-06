namespace LibraryProject.Middlewares;

public class AuthenticationMiddleware
{
    private readonly RequestDelegate _next;

    public AuthenticationMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task Invoke(HttpContext context)
    {
        var userName = context.Session.GetString("Username");
        var path = context.Request.Path;

        // Allow access to public routes
        var publicRoutes = new[] { 
            "/User/Login", 
            "/User/Register", 
            "/Home/Index", 
            "/Home/Privacy" 
            // Add other public routes as needed
        };

        if (userName == null && !publicRoutes.Any(route => path.StartsWithSegments(route)))
        {
            context.Response.Redirect("/User/Login");
            return;
        }

        await _next(context);
    }
}