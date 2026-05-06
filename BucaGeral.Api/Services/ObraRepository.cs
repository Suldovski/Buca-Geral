using Google.Cloud.Firestore;
using BucaGeral.Models;

namespace BucaGeral.Api.Services;

public interface IObraRepository
{
    Task<Obra> GetByIdAsync(string id);
    Task<List<Obra>> GetAllAsync();
    Task<List<Obra>> GetAtivasAsync();
    Task<string> AddAsync(Obra obra);
    Task UpdateAsync(string id, Obra obra);
    Task DeleteAsync(string id);
}

public class ObraRepository : IObraRepository
{
    private readonly FirestoreDb _firestoreDb;
    private const string COLECAO = "obras";

    public ObraRepository(FirestoreDb firestoreDb)
    {
        _firestoreDb = firestoreDb;
    }

    public async Task<Obra> GetByIdAsync(string id)
    {
        try
        {
            var doc = await _firestoreDb.Collection(COLECAO).Document(id).GetSnapshotAsync();
            return doc.Exists ? doc.ConvertTo<Obra>() : null;
        }
        catch (Exception ex)
        {
            throw new Exception($"Erro ao obter obra: {ex.Message}", ex);
        }
    }

    public async Task<List<Obra>> GetAllAsync()
    {
        try
        {
            var query = await _firestoreDb.Collection(COLECAO).GetSnapshotAsync();
            var obras = new List<Obra>();

            foreach (var doc in query.Documents)
            {
                obras.Add(doc.ConvertTo<Obra>());
            }

            return obras;
        }
        catch (Exception ex)
        {
            throw new Exception($"Erro ao listar obras: {ex.Message}", ex);
        }
    }

    public async Task<List<Obra>> GetAtivasAsync()
    {
        try
        {
            var query = await _firestoreDb.Collection(COLECAO)
                .WhereEqualTo("ativo", true)
                .GetSnapshotAsync();

            var obras = new List<Obra>();
            foreach (var doc in query.Documents)
            {
                obras.Add(doc.ConvertTo<Obra>());
            }

            return obras;
        }
        catch (Exception ex)
        {
            throw new Exception($"Erro ao listar obras ativas: {ex.Message}", ex);
        }
    }

    public async Task<string> AddAsync(Obra obra)
    {
        try
        {
            var docRef = await _firestoreDb.Collection(COLECAO).AddAsync(obra);
            return docRef.Id;
        }
        catch (Exception ex)
        {
            throw new Exception($"Erro ao adicionar obra: {ex.Message}", ex);
        }
    }

    public async Task UpdateAsync(string id, Obra obra)
    {
        try
        {
            await _firestoreDb.Collection(COLECAO).Document(id).SetAsync(obra, SetOptions.MergeAll);
        }
        catch (Exception ex)
        {
            throw new Exception($"Erro ao atualizar obra: {ex.Message}", ex);
        }
    }

    public async Task DeleteAsync(string id)
    {
        try
        {
            await _firestoreDb.Collection(COLECAO).Document(id).DeleteAsync();
        }
        catch (Exception ex)
        {
            throw new Exception($"Erro ao deletar obra: {ex.Message}", ex);
        }
    }
}
