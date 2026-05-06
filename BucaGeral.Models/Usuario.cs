namespace BucaGeral.Models;

public class Usuario
{
    public string Id { get; set; }
    public string Email { get; set; }
    public string Login { get; set; }
    public string Nome { get; set; }
    public bool Ativo { get; set; }
    public DateTime DataCriacao { get; set; }
}
