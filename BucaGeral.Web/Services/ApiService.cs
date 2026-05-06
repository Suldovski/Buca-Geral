@using BucaGeral.Models
@namespace BucaGeral.Web.Services
@inject HttpClient Http
@inject ILogger<ApiService> Logger

/// <summary>
/// Serviço cliente para consumir a API ASP.NET Core
/// Responsável por todas as requisições HTTP
/// </summary>
public class ApiService
{
    private readonly HttpClient _http;
    private readonly ILogger<ApiService> _logger;
    private string _baseUrl = "https://localhost:7000/api";
    private string _token = "";

    public ApiService(HttpClient http, ILogger<ApiService> logger)
    {
        _http = http;
        _logger = logger;
    }

    // ============== AUTENTICAÇÃO ==============

    public async Task<string> RegisterAsync(string email, string senha, string nome, string login)
    {
        try
        {
            var request = new { email, senha, nome, login };
            var response = await _http.PostAsJsonAsync($"{_baseUrl}/auth/register", request);
            
            if (response.IsSuccessStatusCode)
            {
                var result = await response.Content.ReadAsAsync<dynamic>();
                _token = result.token;
                return result.uid;
            }

            return null;
        }
        catch (Exception ex)
        {
            _logger.LogError($"Erro ao registrar: {ex.Message}");
            throw;
        }
    }

    public async Task<string> LoginAsync(string emailOuLogin, string senha)
    {
        try
        {
            var request = new { emailOuLogin, senha };
            var response = await _http.PostAsJsonAsync($"{_baseUrl}/auth/login", request);
            
            if (response.IsSuccessStatusCode)
            {
                var result = await response.Content.ReadAsAsync<dynamic>();
                _token = result.token;
                _http.DefaultRequestHeaders.Authorization = 
                    new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _token);
                return _token;
            }

            return null;
        }
        catch (Exception ex)
        {
            _logger.LogError($"Erro ao fazer login: {ex.Message}");
            throw;
        }
    }

    public async Task LogoutAsync()
    {
        _token = "";
        _http.DefaultRequestHeaders.Authorization = null;
        await Task.CompletedTask;
    }

    public async Task<Usuario> GetPerfilAsync(string uid)
    {
        try
        {
            var response = await _http.GetAsync($"{_baseUrl}/auth/profile/{uid}");
            if (response.IsSuccessStatusCode)
            {
                return await response.Content.ReadAsAsync<Usuario>();
            }
            return null;
        }
        catch (Exception ex)
        {
            _logger.LogError($"Erro ao obter perfil: {ex.Message}");
            throw;
        }
    }

    // ============== OBRAS ==============

    public async Task<List<Obra>> GetObrasAsync()
    {
        try
        {
            var response = await _http.GetAsync($"{_baseUrl}/obra");
            if (response.IsSuccessStatusCode)
            {
                return await response.Content.ReadAsAsync<List<Obra>>();
            }
            return new List<Obra>();
        }
        catch (Exception ex)
        {
            _logger.LogError($"Erro ao obter obras: {ex.Message}");
            throw;
        }
    }

    public async Task<Obra> GetObraAsync(string id)
    {
        try
        {
            var response = await _http.GetAsync($"{_baseUrl}/obra/{id}");
            if (response.IsSuccessStatusCode)
            {
                return await response.Content.ReadAsAsync<Obra>();
            }
            return null;
        }
        catch (Exception ex)
        {
            _logger.LogError($"Erro ao obter obra: {ex.Message}");
            throw;
        }
    }

    public async Task<Obra> SaveObraAsync(Obra obra)
    {
        try
        {
            HttpResponseMessage response;
            
            if (string.IsNullOrEmpty(obra.Id))
            {
                response = await _http.PostAsJsonAsync($"{_baseUrl}/obra", obra);
            }
            else
            {
                response = await _http.PutAsJsonAsync($"{_baseUrl}/obra/{obra.Id}", obra);
            }

            if (response.IsSuccessStatusCode)
            {
                return await response.Content.ReadAsAsync<Obra>();
            }
            return null;
        }
        catch (Exception ex)
        {
            _logger.LogError($"Erro ao salvar obra: {ex.Message}");
            throw;
        }
    }

    public async Task DeleteObraAsync(string id)
    {
        try
        {
            var response = await _http.DeleteAsync($"{_baseUrl}/obra/{id}");
            if (!response.IsSuccessStatusCode)
            {
                throw new Exception("Erro ao deletar obra");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError($"Erro ao deletar obra: {ex.Message}");
            throw;
        }
    }

    // ============== FUNCIONÁRIOS ==============

    public async Task<List<Funcionario>> GetFuncionariosAsync()
    {
        try
        {
            var response = await _http.GetAsync($"{_baseUrl}/funcionario");
            if (response.IsSuccessStatusCode)
            {
                return await response.Content.ReadAsAsync<List<Funcionario>>();
            }
            return new List<Funcionario>();
        }
        catch (Exception ex)
        {
            _logger.LogError($"Erro ao obter funcionários: {ex.Message}");
            throw;
        }
    }

    public async Task<List<Funcionario>> GetFuncionariosByObraAsync(string obraId)
    {
        try
        {
            var response = await _http.GetAsync($"{_baseUrl}/funcionario/obra/{obraId}");
            if (response.IsSuccessStatusCode)
            {
                return await response.Content.ReadAsAsync<List<Funcionario>>();
            }
            return new List<Funcionario>();
        }
        catch (Exception ex)
        {
            _logger.LogError($"Erro ao obter funcionários da obra: {ex.Message}");
            throw;
        }
    }

    public async Task<Funcionario> GetFuncionarioAsync(string id)
    {
        try
        {
            var response = await _http.GetAsync($"{_baseUrl}/funcionario/{id}");
            if (response.IsSuccessStatusCode)
            {
                return await response.Content.ReadAsAsync<Funcionario>();
            }
            return null;
        }
        catch (Exception ex)
        {
            _logger.LogError($"Erro ao obter funcionário: {ex.Message}");
            throw;
        }
    }

    public async Task<Funcionario> SaveFuncionarioAsync(Funcionario funcionario)
    {
        try
        {
            HttpResponseMessage response;
            
            if (string.IsNullOrEmpty(funcionario.Id))
            {
                response = await _http.PostAsJsonAsync($"{_baseUrl}/funcionario", funcionario);
            }
            else
            {
                response = await _http.PutAsJsonAsync($"{_baseUrl}/funcionario/{funcionario.Id}", funcionario);
            }

            if (response.IsSuccessStatusCode)
            {
                return await response.Content.ReadAsAsync<Funcionario>();
            }
            return null;
        }
        catch (Exception ex)
        {
            _logger.LogError($"Erro ao salvar funcionário: {ex.Message}");
            throw;
        }
    }

    public async Task DeleteFuncionarioAsync(string id)
    {
        try
        {
            var response = await _http.DeleteAsync($"{_baseUrl}/funcionario/{id}");
            if (!response.IsSuccessStatusCode)
            {
                throw new Exception("Erro ao deletar funcionário");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError($"Erro ao deletar funcionário: {ex.Message}");
            throw;
        }
    }

    // ============== HISTÓRICO ==============

    public async Task<List<HistoricoAlteracao>> GetHistoricoFuncionarioAsync(string funcionarioId)
    {
        try
        {
            var response = await _http.GetAsync($"{_baseUrl}/funcionario/{funcionarioId}/historico");
            if (response.IsSuccessStatusCode)
            {
                return await response.Content.ReadAsAsync<List<HistoricoAlteracao>>();
            }
            return new List<HistoricoAlteracao>();
        }
        catch (Exception ex)
        {
            _logger.LogError($"Erro ao obter histórico: {ex.Message}");
            throw;
        }
    }

    // ============== EXPORTAÇÃO ==============

    public async Task ExportarFuncionariosAsync(List<string> obras, string status, DateTime? dataInicio, DateTime? dataFim, string formato)
    {
        try
        {
            var request = new 
            { 
                obras, 
                status, 
                dataInicio, 
                dataFim, 
                formato 
            };

            var response = await _http.PostAsJsonAsync($"{_baseUrl}/exportacao/funcionarios", request);
            
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsByteArrayAsync();
                var nomeArquivo = formato == "excel" ? "funcionarios.xlsx" : "funcionarios.csv";
                
                // Simular download (será implementado com JS interop)
                _logger.LogInformation($"Arquivo {nomeArquivo} pronto para download");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError($"Erro ao exportar: {ex.Message}");
            throw;
        }
    }
}
