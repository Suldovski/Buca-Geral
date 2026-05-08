using System.Globalization;
using BucaGeral.Api.Services;
using BucaGeral.Models;
using Google.Cloud.Firestore;
using Microsoft.AspNetCore.Mvc;
using OfficeOpenXml;

namespace BucaGeral.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FuncionariosController : ControllerBase
{
    private readonly FirestoreDb _firestore;
    private const string Collection = "funcionarios";

    public FuncionariosController(FirebaseService firebaseService)
    {
        _firestore = firebaseService.GetFirestore();
        ExcelPackage.LicenseContext = LicenseContext.NonCommercial;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? obraId = null)
    {
        Query query = _firestore.Collection(Collection);
        if (!string.IsNullOrWhiteSpace(obraId))
        {
            query = query.WhereEqualTo(nameof(Funcionario.ObraId), obraId);
        }

        var snapshot = await query.GetSnapshotAsync();
        var funcionarios = snapshot.Documents.Select(doc =>
        {
            var funcionario = doc.ConvertTo<Funcionario>();
            funcionario.Id = doc.Id;
            return funcionario;
        }).ToList();

        return Ok(funcionarios);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id)
    {
        var doc = await _firestore.Collection(Collection).Document(id).GetSnapshotAsync();
        if (!doc.Exists) return NotFound();

        var funcionario = doc.ConvertTo<Funcionario>();
        funcionario.Id = doc.Id;
        return Ok(funcionario);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Funcionario funcionario)
    {
        funcionario.CriadoEm = funcionario.CriadoEm == default ? DateTime.UtcNow : funcionario.CriadoEm;
        var docRef = await _firestore.Collection(Collection).AddAsync(funcionario);
        funcionario.Id = docRef.Id;
        await docRef.SetAsync(funcionario, SetOptions.Overwrite);
        return Ok(funcionario);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, [FromBody] Funcionario funcionario)
    {
        funcionario.Id = id;
        await _firestore.Collection(Collection).Document(id).SetAsync(funcionario, SetOptions.Overwrite);
        return Ok(funcionario);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        await _firestore.Collection(Collection).Document(id).DeleteAsync();
        return NoContent();
    }

    [HttpPost("importar")]
    public async Task<IActionResult> Importar(IFormFile arquivo, [FromQuery] string? obraId = null)
    {
        if (arquivo == null || arquivo.Length == 0)
            return BadRequest("Nenhum arquivo enviado.");

        using var stream = new MemoryStream();
        await arquivo.CopyToAsync(stream);
        stream.Position = 0;

        using var package = new ExcelPackage(stream);
        if (package.Workbook.Worksheets.Count == 0)
            return BadRequest("Planilha inválida.");

        var worksheet = package.Workbook.Worksheets[0];
        if (worksheet.Dimension == null)
            return BadRequest("Planilha sem dados.");
        var funcionarios = new List<Funcionario>();

        for (var row = 2; row <= worksheet.Dimension.End.Row; row++)
        {
            var funcionario = new Funcionario
            {
                RE = worksheet.Cells[row, 1]?.Text?.Trim() ?? string.Empty,
                Nome = worksheet.Cells[row, 2]?.Text?.Trim() ?? string.Empty,
                Cargo = worksheet.Cells[row, 3]?.Text?.Trim() ?? string.Empty,
                Setor = worksheet.Cells[row, 4]?.Text?.Trim() ?? string.Empty,
                DataAdmissao = TryParseDate(worksheet.Cells[row, 5]?.Text) ?? DateTime.UtcNow,
                Exp30 = TryParseDate(worksheet.Cells[row, 6]?.Text),
                Exp60 = TryParseDate(worksheet.Cells[row, 7]?.Text),
                SalarioHora = TryParseDecimal(worksheet.Cells[row, 8]?.Text),
                SalarioMes = TryParseDecimal(worksheet.Cells[row, 9]?.Text),
                VencimentoASO = TryParseDate(worksheet.Cells[row, 10]?.Text),
                Situacao = worksheet.Cells[row, 11]?.Text?.Trim() ?? string.Empty,
                TipoVinculo = worksheet.Cells[row, 12]?.Text?.Trim() ?? string.Empty,
                ObraId = !string.IsNullOrWhiteSpace(obraId)
                    ? obraId
                    : worksheet.Cells[row, 13]?.Text?.Trim() ?? string.Empty,
                Ativo = true,
                CriadoEm = DateTime.UtcNow
            };

            if (string.IsNullOrWhiteSpace(funcionario.Nome))
            {
                continue;
            }

            var docRef = await _firestore.Collection(Collection).AddAsync(funcionario);
            funcionario.Id = docRef.Id;
            await docRef.SetAsync(funcionario, SetOptions.Overwrite);
            funcionarios.Add(funcionario);
        }

        return Ok(new
        {
            mensagem = $"Importados {funcionarios.Count} funcionários.",
            total = funcionarios.Count
        });
    }

    [HttpDelete("apagar-todos")]
    public async Task<IActionResult> ApagarTodos([FromQuery] string? obraId = null)
    {
        Query query = _firestore.Collection(Collection);
        if (!string.IsNullOrWhiteSpace(obraId))
        {
            query = query.WhereEqualTo(nameof(Funcionario.ObraId), obraId);
        }

        var snapshot = await query.GetSnapshotAsync();
        foreach (var doc in snapshot.Documents)
        {
            await doc.Reference.DeleteAsync();
        }

        return NoContent();
    }

    [HttpGet("exportar")]
    public async Task<IActionResult> Exportar([FromQuery] string? obraId = null)
    {
        Query query = _firestore.Collection(Collection);
        if (!string.IsNullOrWhiteSpace(obraId))
        {
            query = query.WhereEqualTo(nameof(Funcionario.ObraId), obraId);
        }

        var snapshot = await query.GetSnapshotAsync();
        var funcionarios = snapshot.Documents.Select(doc =>
        {
            var funcionario = doc.ConvertTo<Funcionario>();
            funcionario.Id = doc.Id;
            return funcionario;
        }).ToList();

        using var package = new ExcelPackage();
        var worksheet = package.Workbook.Worksheets.Add("Funcionarios");

        worksheet.Cells[1, 1].Value = "RE";
        worksheet.Cells[1, 2].Value = "Nome";
        worksheet.Cells[1, 3].Value = "Cargo";
        worksheet.Cells[1, 4].Value = "Setor";
        worksheet.Cells[1, 5].Value = "Admissão";
        worksheet.Cells[1, 6].Value = "Exp30";
        worksheet.Cells[1, 7].Value = "Exp60";
        worksheet.Cells[1, 8].Value = "Salário Hora";
        worksheet.Cells[1, 9].Value = "Salário Mês";
        worksheet.Cells[1, 10].Value = "Venc. ASO";
        worksheet.Cells[1, 11].Value = "Situação";
        worksheet.Cells[1, 12].Value = "Tipo Vínculo";
        worksheet.Cells[1, 13].Value = "ObraId";

        for (var i = 0; i < funcionarios.Count; i++)
        {
            var f = funcionarios[i];
            var line = i + 2;
            worksheet.Cells[line, 1].Value = f.RE;
            worksheet.Cells[line, 2].Value = f.Nome;
            worksheet.Cells[line, 3].Value = f.Cargo;
            worksheet.Cells[line, 4].Value = f.Setor;
            worksheet.Cells[line, 5].Value = f.DataAdmissao == default ? string.Empty : f.DataAdmissao.ToString("yyyy-MM-dd");
            worksheet.Cells[line, 6].Value = f.Exp30?.ToString("yyyy-MM-dd");
            worksheet.Cells[line, 7].Value = f.Exp60?.ToString("yyyy-MM-dd");
            worksheet.Cells[line, 8].Value = f.SalarioHora;
            worksheet.Cells[line, 9].Value = f.SalarioMes;
            worksheet.Cells[line, 10].Value = f.VencimentoASO?.ToString("yyyy-MM-dd");
            worksheet.Cells[line, 11].Value = f.Situacao;
            worksheet.Cells[line, 12].Value = f.TipoVinculo;
            worksheet.Cells[line, 13].Value = f.ObraId;
        }

        worksheet.Cells.AutoFitColumns();

        var stream = new MemoryStream();
        await package.SaveAsAsync(stream);
        stream.Position = 0;

        return File(
            stream,
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "funcionarios.xlsx");
    }

    private static DateTime? TryParseDate(string? input)
    {
        if (string.IsNullOrWhiteSpace(input)) return null;

        var formats = new[] { "dd/MM/yyyy", "yyyy-MM-dd", "MM/dd/yyyy", "dd-MM-yyyy" };
        if (DateTime.TryParseExact(input.Trim(), formats, CultureInfo.InvariantCulture, DateTimeStyles.None, out var date))
            return date;

        if (DateTime.TryParse(input, out date))
            return date;

        return null;
    }

    private static decimal TryParseDecimal(string? input)
    {
        if (string.IsNullOrWhiteSpace(input)) return 0;

        var normalized = input.Trim().Replace("R$", string.Empty).Replace(" ", string.Empty);
        if (decimal.TryParse(normalized, NumberStyles.Any, new CultureInfo("pt-BR"), out var value))
            return value;
        if (decimal.TryParse(normalized, NumberStyles.Any, CultureInfo.InvariantCulture, out value))
            return value;

        return 0;
    }
}
