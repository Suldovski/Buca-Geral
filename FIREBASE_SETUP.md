# Configuração Firebase para Buca Geral

## 📋 Pré-requisitos

1. Conta Firebase (https://firebase.google.com)
2. Projeto criado no Firebase Console
3. Firestore Database ativado
4. Authentication habilitado

---

## 🔧 **Passo 1: Criar Projeto no Firebase**

1. Acesse [Firebase Console](https://console.firebase.google.com)
2. Clique em "Criar um novo projeto"
3. Digite um nome (ex: "Buca-Geral")
4. Clique em "Continuar"
5. Desative Google Analytics (opcional)
6. Clique em "Criar projeto"

---

## 🔐 **Passo 2: Baixar Credenciais do Firebase Admin SDK**

### Para C# (ASP.NET Core):

1. No Firebase Console, vá para **⚙️ Configurações do Projeto**
2. Clique em "Contas de Serviço"
3. Selecione **"C#/.NET"**
4. Clique em "Gerar nova chave privada"
5. Um arquivo JSON será baixado: `firebase-credentials.json`
6. **Copie este arquivo para a pasta raiz do projeto `BucaGeral.Api/`**

### Conteúdo do arquivo (exemplo):
```json
{
  "type": "service_account",
  "project_id": "seu-projeto-id",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk@seu-projeto.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs"
}
```

---

## 📊 **Passo 3: Criar Firestore Database**

1. No Firebase Console, vá para **Firestore Database**
2. Clique em "Criar banco de dados"
3. Escolha: **Modo de produção** (para produção) ou **Modo teste** (desenvolvimento)
4. Escolha região: **South America (São Paulo)** se possível
5. Clique em "Criar"

---

## 🔐 **Passo 4: Configurar Security Rules (Firestore)**

No Firebase Console, vá para **Firestore Database → Regras** e adicione:

```firestore rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir leitura e escrita durante desenvolvimento
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // Em produção, adicionar regras mais restritivas
    // match /obras/{obraId} {
    //   allow read, write: if request.auth.uid == resource.data.criadorId;
    // }
  }
}
```

---

## 🔑 **Passo 5: Configurar Authentication**

1. No Firebase Console, vá para **Authentication**
2. Clique em "Começar"
3. Habilite **Email/Senha**
4. Opcionalmente, habilite **Google Sign-In**

---

## 📝 **Passo 6: Atualizar appsettings.json**

Edite `BucaGeral.Api/appsettings.json` com os dados do seu projeto:

```json
{
  "Firebase": {
    "ProjectId": "seu-projeto-id",
    "ApiKey": "YOUR_FIREBASE_API_KEY",
    "AuthDomain": "seu-projeto.firebaseapp.com",
    "StorageBucket": "seu-projeto.appspot.com",
    "MessagingSenderId": "123456789",
    "AppId": "1:123456789:web:abcdef123456"
  }
}
```

Os dados encontram-se em **⚙️ Configurações do Projeto → Geral → Seu app**

---

## 🚀 **Passo 7: Variáveis de Ambiente (Opcional)**

Para ambiente de desenvolvimento com emulador:

```bash
# No terminal (Windows PowerShell)
$env:FIRESTORE_EMULATOR_HOST = "localhost:8080"

# No terminal (Linux/Mac)
export FIRESTORE_EMULATOR_HOST=localhost:8080
```

---

## ✅ **Passo 8: Testar a Conexão**

### Compilar o projeto:
```bash
dotnet build
```

### Rodar a API:
```bash
cd BucaGeral.Api
dotnet run
```

### Testar com Swagger:
```
https://localhost:7000/swagger
```

### Endpoints disponíveis:

#### Obras
- `GET /api/obra` - Listar todas as obras
- `GET /api/obra/ativas` - Listar apenas obras ativas
- `GET /api/obra/{id}` - Obter obra por ID
- `POST /api/obra` - Criar obra
- `PUT /api/obra/{id}` - Atualizar obra
- `DELETE /api/obra/{id}` - Deletar obra

#### Funcionários
- `GET /api/funcionario/obra/{obraId}` - Listar funcionários de uma obra
- `GET /api/funcionario/{id}` - Obter funcionário por ID
- `POST /api/funcionario` - Criar funcionário
- `PUT /api/funcionario/{id}` - Atualizar funcionário
- `DELETE /api/funcionario/{id}` - Deletar funcionário

#### Importação
- `POST /api/importacao/validar?obraId={id}` - Validar arquivo Excel
- `POST /api/importacao/funcionarios?obraId={id}` - Importar funcionários do Excel

---

## 🐛 **Troubleshooting**

### Erro: "Arquivo firebase-credentials.json não encontrado"
- Certifique-se de que o arquivo está na pasta `BucaGeral.Api/`
- Ou configure a variável de ambiente: `GOOGLE_APPLICATION_CREDENTIALS`

### Erro: "ProjectId não configurado"
- Verifique o `appsettings.json`
- Adicione o `ProjectId` do Firebase Console

### Erro: "Permission denied" no Firestore
- Verifique as Security Rules
- Use modo "teste" para desenvolvimento (sem autenticação)

---

## 📚 **Próximas Etapas**

1. ✅ Implementar Autenticação JWT
2. ✅ Criar Policies de autorização
3. ✅ Implementar Exportação em Excel
4. ✅ Deploy no Azure App Service / Render / Railway
5. ✅ Configurar CI/CD com GitHub Actions

