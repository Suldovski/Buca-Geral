using Microsoft.AspNetCore.Mvc;
using Google.Cloud.Firestore;
using BucaGeral.Api.Services;
using BucaGeral.Models;

namespace BucaGeral.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ObrasController : ControllerBase
{
    private readonly FirestoreDb _firestore;
    private const string COLLECTION = "obras";

    public ObrasController(FirebaseService firebaseService)
    {
        _firestore = firebaseService.GetFirestore();
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var snapshot = await _firestore.Collection(COLLECTION).GetSnapshotAsync();
        var obras = snapshot.Documents.Select(doc =>
        {
            var o = doc.ConvertTo<Obra>();
            o.Id = doc.Id;
            return o;
        }).ToList();
        return Ok(obras);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id)
    {
        var doc = await _firestore.Collection(COLLECTION).Document(id).GetSnapshotAsync();
        if (!doc.Exists) return NotFound();
        var obra = doc.ConvertTo<Obra>();
        obra.Id = doc.Id;
        return Ok(obra);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Obra obra)
    {
        var docRef = await _firestore.Collection(COLLECTION).AddAsync(obra);
        obra.Id = docRef.Id;
        return Ok(obra);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, [FromBody] Obra obra)
    {
        var docRef = _firestore.Collection(COLLECTION).Document(id);
        await docRef.SetAsync(obra, SetOptions.Overwrite);
        return Ok(obra);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        var docRef = _firestore.Collection(COLLECTION).Document(id);
        await docRef.DeleteAsync();
        return NoContent();
    }
}
