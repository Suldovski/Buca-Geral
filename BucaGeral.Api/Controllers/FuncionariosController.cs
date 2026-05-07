using Microsoft.AspNetCore.Mvc;
using Google.Cloud.Firestore;
using BucaGeral.Api.Services;
using BucaGeral.Models;

namespace BucaGeral.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FuncionariosController : ControllerBase
{
    private readonly FirestoreDb _firestore;
    private const string COLLECTION = "funcionarios";

    public FuncionariosController(FirebaseService firebaseService)
    {
        _firestore = firebaseService.GetFirestore();
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var snapshot = await _firestore.Collection(COLLECTION).GetSnapshotAsync();
        var funcionarios = snapshot.Documents.Select(doc =>
        {
            var f = doc.ConvertTo<Funcionario>();
            f.Id = doc.Id;
            return f;
        }).ToList();
        return Ok(funcionarios);
    }

    [HttpGet("obra/{obraId}")]
    public async Task<IActionResult> GetByObra(string obraId)
    {
        var query = _firestore.Collection(COLLECTION).WhereEqualTo("ObraId", obraId);
        var snapshot = await query.GetSnapshotAsync();
        var funcionarios = snapshot.Documents.Select(doc =>
        {
            var f = doc.ConvertTo<Funcionario>();
            f.Id = doc.Id;
            return f;
        }).ToList();
        return Ok(funcionarios);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Funcionario funcionario)
    {
        funcionario.Id = null;
        var docRef = await _firestore.Collection(COLLECTION).AddAsync(funcionario);
        funcionario.Id = docRef.Id;
        return Ok(funcionario);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, [FromBody] Funcionario funcionario)
    {
        var docRef = _firestore.Collection(COLLECTION).Document(id);
        var snapshot = await docRef.GetSnapshotAsync();
        if (!snapshot.Exists) return NotFound();
        funcionario.Id = id;
        await docRef.SetAsync(funcionario, SetOptions.Overwrite);
        return Ok(funcionario);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        var docRef = _firestore.Collection(COLLECTION).Document(id);
        var snapshot = await docRef.GetSnapshotAsync();
        if (!snapshot.Exists) return NotFound();
        await docRef.DeleteAsync();
        return NoContent();
    }
}
