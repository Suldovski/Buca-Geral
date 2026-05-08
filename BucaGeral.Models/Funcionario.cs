namespace BucaGeral.Models;

public class Funcionario
{
    public string Id { get; set; } = string.Empty;
    public string RE { get; set; } = string.Empty;
    public string Nome { get; set; } = string.Empty;
    public string Cargo { get; set; } = string.Empty;
    public string Setor { get; set; } = string.Empty;
    public DateTime DataAdmissao { get; set; }
    public DateTime? Exp30 { get; set; }
    public DateTime? Exp60 { get; set; }
    public decimal SalarioHora { get; set; }
    public decimal SalarioMes { get; set; }
    public DateTime? VencimentoASO { get; set; }
    public string Situacao { get; set; } = string.Empty;
    public string TipoVinculo { get; set; } = string.Empty;
    public string ObraId { get; set; } = string.Empty;
    public bool Ativo { get; set; } = true;
    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
    public string CriadoPor { get; set; } = string.Empty;
}
