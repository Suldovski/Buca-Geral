using Microsoft.AspNetCore.Mvc;
using FirebaseAdmin.Auth;
using BucaGeral.Api.Services;

namespace BucaGeral.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly FirebaseService _firebase;
    
    public AuthController(FirebaseService firebase)
    {
        _firebase = firebase;
    }
    
    [HttpPost("registrar")]
    public async Task<IActionResult> Registrar([FromBody] RegistrarRequest request)
    {
        try
        {
            var userRecord = await _firebase.GetAuth().CreateUserAsync(new UserRecordArgs
            {
                Email = request.Email,
                Password = request.Senha,
                DisplayName = request.Nome
            });
            
            return Ok(new { 
                mensagem = "Usuário criado com sucesso!",
                uid = userRecord.Uid,
                email = userRecord.Email
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { erro = ex.Message });
        }
    }
    
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        try
        {
            var user = await _firebase.GetAuth().GetUserByEmailAsync(request.Email);
            
            return Ok(new { 
                mensagem = "Usuário encontrado!",
                uid = user.Uid,
                email = user.Email,
                nome = user.DisplayName
            });
        }
        catch (Exception ex)
        {
            return Unauthorized(new { erro = "Email ou senha inválidos", detalhe = ex.Message });
        }
    }
}

public class RegistrarRequest
{
    public string Email { get; set; } = string.Empty;
    public string Senha { get; set; } = string.Empty;
    public string Nome { get; set; } = string.Empty;
}

public class LoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Senha { get; set; } = string.Empty;
}
