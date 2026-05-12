# Buca Geral - RH de Obras (Firebase)

Sistema de RH em **HTML + CSS + JavaScript puro**, com dados centralizados no **Firebase**.

## Estrutura

```text
Buca-Geral/
├── index.html          # Login
├── inicio.html         # Página inicial (stats + admissões + ranking)
├── funcionarios.html   # Funcionários (cards filtro, importação, CRUD)
├── obras.html          # Obras (listagem, edição e acesso à tela individual)
├── obra-[id].html      # Tela individual da obra (filtros, importação, CRUD)
├── usuarios.html       # CRUD de usuários do sistema
├── styles.css          # Estilos globais
├── firebase-config.js  # Firebase Auth + Firestore
└── app.js              # Regras e utilitários de frontend
```

## Funcionalidades

- Login via Firebase Authentication
- Página Início com total de obras/funcionários, admissões dos últimos 12 meses e top 5 cargos
- Filtros por cards (Total, Efetivo, PJ, Operacional, ADM, Mobilização, Alteração de Função, Terceiros)
- CRUD de funcionários em contexto geral e por obra
- Importação de planilhas (CSV/XLSX) com validação, preview e toast
- Exportação CSV de funcionários
- Sincronização em tempo real via Firestore

## Como usar

1. Abra `index.html` no navegador.
2. Faça login com um usuário Firebase.
3. O sistema sincroniza os dados em tempo real via Firestore.

## Firebase configurado

- projectId: `buca-geral`
- authDomain: `buca-geral.firebaseapp.com`
