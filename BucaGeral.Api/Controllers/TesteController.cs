using Microsoft.AspNetCore.Mvc;

namespace BucaGeral.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TesteController : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        return Ok(new { 
            mensagem = "API Buca-Geral funcionando!",
            data = DateTime.Now,
            status = "online"
        });
    }
}