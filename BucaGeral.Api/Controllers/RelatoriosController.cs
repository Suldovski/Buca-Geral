using Microsoft.AspNetCore.Mvc;
using Google.Cloud.Firestore;
using BucaGeral.Api.Services;
using BucaGeral.Models;
using OfficeOpenXml;
using System.IO;

namespace BucaGeral.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RelatoriosController : ControllerBase
{
    private readonly FirestoreDb _firestore;
    private const string OBRAS_COLLECTION = "obras";
    private const string FUNCIONARIOS_COLLECTION = "funcionarios";

    public RelatoriosController(FirebaseService firebaseService)
    {
        _firestore = firebaseService.GetFirestore();
        // EPPlus 8+ usa LicenseContext (ainda funciona, mas vamos suprimir aviso)
        ExcelPackage.LicenseContext = LicenseContext.NonCommercial;
    }

    [HttpGet("exportar")]
    public async Task<IActionResult> ExportarExcel()
    {
        // Buscar todas as obras
        var obrasSnapshot = await _firestore.Collection(OBRAS_COLLECTION).GetSnapshotAsync();
        var obras = obrasSnapshot.Documents.Select(doc =>
        {
            var o = doc.ConvertTo<Obra>();
            o.Id = doc.Id;
            return o;
        }).ToList();

        // Buscar todos os funcionários
        var funcSnapshot = await _firestore.Collection(FUNCIONARIOS_COLLECTION).GetSnapshotAsync();
        var funcionarios = funcSnapshot.Documents.Select(doc =>
        {
            var f = doc.ConvertTo<Funcionario>();
            f.Id = doc.Id;
            return f;
        }).ToList();

        // Criar o arquivo Excel
        using var package = new ExcelPackage();
        
        // Planilha de Obras
        var wsObras = package.Workbook.Worksheets.Add("Obras");
        wsObras.Cells[1, 1].Value = "ID";
        wsObras.Cells[1, 2].Value = "Nome";
        wsObras.Cells[1, 3].Value = "Localização";
        wsObras.Cells[1, 4].Value = "Data Início";
        wsObras.Cells[1, 5].Value = "Status";
        
        for (int i = 0; i < obras.Count; i++)
        {
            var obra = obras[i];
            wsObras.Cells[i + 2, 1].Value = obra.Id;
            wsObras.Cells[i + 2, 2].Value = obra.Nome;
            wsObras.Cells[i + 2, 3].Value = obra.Localizacao;
            wsObras.Cells[i + 2, 4].Value = obra.DataInicio.ToString("dd/MM/yyyy");
            wsObras.Cells[i + 2, 5].Value = obra.Ativo ? "Ativa" : "Inativa";
        }
        wsObras.Cells.AutoFitColumns();

        // Planilha de Funcionários
        var wsFunc = package.Workbook.Worksheets.Add("Funcionários");
        wsFunc.Cells[1, 1].Value = "ID";
        wsFunc.Cells[1, 2].Value = "Nome";
        wsFunc.Cells[1, 3].Value = "Cargo";
        wsFunc.Cells[1, 4].Value = "ID da Obra";
        wsFunc.Cells[1, 5].Value = "Nome da Obra";
        wsFunc.Cells[1, 6].Value = "Data Admissão";
        wsFunc.Cells[1, 7].Value = "Ativo";

        for (int i = 0; i < funcionarios.Count; i++)
        {
            var func = funcionarios[i];
            var obraNome = obras.FirstOrDefault(o => o.Id == func.ObraId)?.Nome ?? "Não vinculado";
            wsFunc.Cells[i + 2, 1].Value = func.Id;
            wsFunc.Cells[i + 2, 2].Value = func.Nome;
            wsFunc.Cells[i + 2, 3].Value = func.Cargo;
            wsFunc.Cells[i + 2, 4].Value = func.ObraId;
            wsFunc.Cells[i + 2, 5].Value = obraNome;
            wsFunc.Cells[i + 2, 6].Value = func.DataAdmissao.ToString("dd/MM/yyyy");
            wsFunc.Cells[i + 2, 7].Value = func.Ativo ? "Sim" : "Não";
        }
        wsFunc.Cells.AutoFitColumns();

        // Gerar o arquivo
        var stream = new MemoryStream();
        await package.SaveAsAsync(stream);
        stream.Position = 0;
        
        var fileName = $"BucaGeral_Relatorio_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx";
        return File(stream, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
    }
}
