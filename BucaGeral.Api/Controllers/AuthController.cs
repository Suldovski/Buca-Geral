using BucaGeral.Models;
using Microsoft.AspNetCore.Mvc;

namespace BucaGeral.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(IAuthService authService, ILogger<AuthController> logger)
    {
        _authService = authService;
        _logger = logger;
    }

    /// <summary>
    /// Fazer login com email e senha
    /// </summary>
    /// <param name="request">Email e Senha</param>
    /// <returns>Token JWT e dados do usuário</returns>
    [HttpPost("login")]
    public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(new { sucesso = false, mensagem = "Email e senha são obrigatórios" });

        var response = await _authService.LoginAsync(request);

        if (!response.Sucesso)
            return Unauthorized(response);

        return Ok(response);
    }

    /// <summary>
    /// Criar novo usuário
    /// </summary>
    /// <param name="request">Email, Senha, Nome e Perfil</param>
    /// <returns>Token JWT e dados do novo usuário</returns>
    [HttpPost("register")]
    public async Task<ActionResult<LoginResponse>> Register([FromBody] CriarUsuarioRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(new { sucesso = false, mensagem = "Email, senha e nome são obrigatórios" });

        var response = await _authService.CriarUsuarioAsync(request);

        if (!response.Sucesso)
            return BadRequest(response);

        return Created(nameof(Login), response);
    }

    /// <summary>
    /// Validar se token é válido
    /// </summary>
    /// <returns>Status do token</returns>
    [HttpGet("validate")]
    public IActionResult Validate()
    {
        var email = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;
        
        if (string.IsNullOrEmpty(email))
            return Unauthorized(new { valido = false });

        return Ok(new { valido = true, email });
    }
}
