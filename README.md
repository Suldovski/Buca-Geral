# Buca Geral - Sistema de Controle de RH Multi-Obras

Sistema web moderno para gestão centralizada de recursos humanos em múltiplas obras, desenvolvido com **Blazor WebAssembly** + **ASP.NET Core** + **Firebase**.

## 📋 Funcionalidades

- ✅ **Autenticação**: Login seguro para usuários RH Matriz
- ✅ **Gestão de Obras**: Cadastro e gerenciamento de obras
- ✅ **Gestão de Funcionários**: CRUD com edição inline
- ✅ **Exportação Consolidada**: Combina dados de múltiplas obras em um arquivo
- ✅ **Auditoria**: Histórico completo de alterações
- ✅ **Dashboards**: Relatórios e visualizações

## 🏗️ Arquitetura

```
Buca-Geral/
├── BucaGeral.Models/           # Modelos compartilhados (C#)
├── BucaGeral.Api/              # Backend ASP.NET Core
├── BucaGeral.Web/              # Frontend Blazor WebAssembly
└── README.md
```

### **Backend (ASP.NET Core)**
- Controllers RESTful
- Integração Firebase (Firestore + Auth)
- Services para lógica de negócio

### **Frontend (Blazor WebAssembly)**
- Componentes reutilizáveis
- CSS modular
- Autenticação Firebase

### **Banco de Dados**
- Firebase Firestore
- Firebase Authentication

## 🚀 Setup Inicial

### Pré-requisitos
- .NET 8 SDK
- Node.js (opcional, para ferramentas frontend)
- Conta Firebase

### Instalação

1. **Clone o repositório**
   ```bash
   git clone https://github.com/Suldovski/Buca-Geral.git
   cd Buca-Geral
   ```

2. **Configure Firebase**
   - Crie um projeto no [Firebase Console](https://console.firebase.google.com/)
   - Copie suas credenciais
   - Atualize `BucaGeral.Api/appsettings.json`

3. **Execute a API**
   ```bash
   cd BucaGeral.Api
   dotnet run
   ```

4. **Execute o Frontend**
   ```bash
   cd BucaGeral.Web
   dotnet run
   ```

5. **Acesse**
   - Frontend: `https://localhost:7001`
   - API: `https://localhost:7000`
   - Swagger API: `https://localhost:7000/swagger`

## 📁 Estrutura de Pastas

### BucaGeral.Api/
```
Controllers/        # EndPoints REST
Services/          # Lógica Firebase
appsettings.json   # Configurações
Program.cs         # Startup
```

### BucaGeral.Web/
```
Pages/             # Páginas Blazor (.razor)
Components/        # Componentes reutilizáveis
Services/          # Services cliente (API)
Styles/            # CSS modular
```

### BucaGeral.Models/
```
Usuario.cs         # Modelo de usuário
Obra.cs           # Modelo de obra
Funcionario.cs    # Modelo de funcionário
HistoricoAlteracao.cs  # Auditoria
```

## 🔐 Segurança

- ✅ CORS configurado para Blazor
- ✅ Firebase Security Rules (será configurado)
- ✅ Autenticação JWT (será implementado)
- ✅ Logs de auditoria

## 📦 Dependências

### Backend
- `Microsoft.AspNetCore.Cors`
- `FirebaseAdmin` (será adicionado)
- `Swashbuckle.AspNetCore`

### Frontend
- `Blazor`
- `FirebaseAuthentication.WebAssembly` (será adicionado)

## 🎯 Próximos Passos

- [ ] Implementar Firebase Admin SDK na API
- [ ] Criar componentes Blazor (Login, Dashboard, Tabelas)
- [ ] Implementar CSS modular com variáveis de tema
- [ ] Integração com Firestore
- [ ] Exportação em Excel
- [ ] Testes unitários

## 📞 Contato

Desenvolvido por **Suldovski**

## 📄 Licença

MIT License
