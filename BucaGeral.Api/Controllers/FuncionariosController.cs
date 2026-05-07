using Microsoft.AspNetCore.Mvc;

namespace BucaGeral.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FuncionariosController : ControllerBase
{
    private static List<object> funcionarios = new();

    [HttpGet]
    public IActionResult Get()
    {
        return Ok(funcionarios);
    }

    [HttpPost]
    public IActionResult Post([FromBody] object funcionario)
    {
        funcionarios.Add(funcionario);
        return Ok(funcionario);
    }
}
