using Microsoft.AspNetCore.Mvc;
using FirebaseAdmin.Auth;
using BucaGeral.Api.Services;
using Google.Cloud.Firestore;
using System.Globalization;
using System.Linq;
using System.Text;

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

    [HttpPost("redefinir-senha")]
    public async Task<IActionResult> RedefinirSenha([FromBody] RedefinirSenhaRequest request)
    {
        var authHeader = Request.Headers.Authorization.ToString();
        if (string.IsNullOrWhiteSpace(authHeader) || !authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
            return Unauthorized(new { erro = "Token de autenticação não informado." });

        var token = authHeader["Bearer ".Length..].Trim();
        FirebaseToken decodedToken;
        UserRecord solicitante;
        try
        {
            decodedToken = await _firebase.GetAuth().VerifyIdTokenAsync(token);
            solicitante = await _firebase.GetAuth().GetUserAsync(decodedToken.Uid);
        }
        catch
        {
            return Unauthorized(new { erro = "Token inválido ou expirado." });
        }

        if (string.IsNullOrWhiteSpace(solicitante.Email))
            return Forbid();

        var usuarioSnap = await _firebase.GetFirestore()
            .Collection("usuarios_sistema")
            .WhereEqualTo("email", solicitante.Email)
            .Limit(1)
            .GetSnapshotAsync();

        var perfil = string.Empty;
        var usuarioDoc = usuarioSnap.Documents.FirstOrDefault();
        if (usuarioDoc != null && usuarioDoc.TryGetValue<string>("perfil", out var perfilLido))
            perfil = perfilLido;

        if (!EhPerfilAutorizado(perfil))
            return Forbid();

        if (string.IsNullOrWhiteSpace(request.Uid))
            return BadRequest(new { erro = "UID do usuário é obrigatório." });

        if (string.IsNullOrWhiteSpace(request.NovaSenha))
            return BadRequest(new { erro = "Nova senha é obrigatória." });

        try
        {
            await _firebase.GetAuth().UpdateUserAsync(new UserRecordArgs
            {
                Uid = request.Uid.Trim(),
                Password = request.NovaSenha
            });

            return Ok(new { mensagem = "Senha redefinida com sucesso." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { erro = $"Não foi possível redefinir a senha: {ex.Message}" });
        }
    }

    private static bool EhPerfilAutorizado(string? perfil)
    {
        var texto = (perfil ?? string.Empty)
            .Normalize(NormalizationForm.FormD)
            .Where(c => CharUnicodeInfo.GetUnicodeCategory(c) != UnicodeCategory.NonSpacingMark)
            .Select(char.ToUpperInvariant)
            .Aggregate(new StringBuilder(), (sb, c) =>
            {
                if (char.IsLetterOrDigit(c) || char.IsWhiteSpace(c))
                    sb.Append(c);
                return sb;
            })
            .ToString()
            .Trim();

        return texto is "RH MATRIZ" or "ADMIN";
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

public class RedefinirSenhaRequest
{
    public string Uid { get; set; } = string.Empty;
    public string NovaSenha { get; set; } = string.Empty;
}
