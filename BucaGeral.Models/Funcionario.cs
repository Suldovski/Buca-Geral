namespace BucaGeral.Models;

public class Funcionario
{
    public string Id { get; set; } = string.Empty;
    public string Nome { get; set; } = string.Empty;
    public string Cargo { get; set; } = string.Empty;
    public string ObraId { get; set; } = string.Empty;
    public DateTime DataAdmissao { get; set; }
    public bool Ativo { get; set; } = true;
}
