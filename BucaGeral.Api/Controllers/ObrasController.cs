using Microsoft.AspNetCore.Mvc;

namespace BucaGeral.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ObrasController : ControllerBase
{
    private static List<object> obras = new();

    [HttpGet]
    public IActionResult Get()
    {
        return Ok(obras);
    }

    [HttpPost]
    public IActionResult Post([FromBody] object obra)
    {
        obras.Add(obra);
        return Ok(obra);
    }
}
