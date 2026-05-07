using Microsoft.AspNetCore.Mvc;
using FirebaseAdmin.Auth;
using BucaGeral.Api.Services;

namespace BucaGeral.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsuariosController : ControllerBase
{
    private readonly FirebaseAuth _auth;
    
    public UsuariosController(FirebaseService firebaseService)
    {
        _auth = firebaseService.GetAuth();
    }

    [HttpGet]
    public async Task<IActionResult> Listar()
    {
        var users = await _auth.ListUsersAsync(new ListUsersOptions()).ToListAsync();
        var lista = users.Select(u => new { u.Uid, u.Email, u.DisplayName }).ToList();
        return Ok(lista);
    }

    [HttpPost]
    public async Task<IActionResult> Criar([FromBody] CriarUsuarioRequest request)
    {
        var userArgs = new UserRecordArgs.Builder()
            .SetEmail(request.Email)
            .SetPassword(request.Senha)
            .SetDisplayName(request.Nome)
            .Build();
        var user = await _auth.CreateUserAsync(userArgs);
        return Ok(new { user.Uid, user.Email, user.DisplayName });
    }

    [HttpDelete("{uid}")]
    public async Task<IActionResult> Excluir(string uid)
    {
        await _auth.DeleteUserAsync(uid);
        return NoContent();
    }
}

public class CriarUsuarioRequest { public string Email { get; set; } = ""; public string Senha { get; set; } = ""; public string Nome { get; set; } = ""; }
