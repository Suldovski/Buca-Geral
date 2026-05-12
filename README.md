# Buca Geral - RH de Obras (Firebase)

Sistema de RH em **HTML + CSS + JavaScript puro**, com dados centralizados no **Firebase**.

## Estrutura

```text
Buca-Geral/
├── index.html          # Login
├── dashboard.html      # Dashboard em tempo real
├── funcionarios.html   # CRUD de funcionários
├── obras.html          # CRUD de obras
├── usuarios.html       # CRUD de usuários do sistema
├── styles.css          # Estilos globais
├── firebase-config.js  # Firebase Auth + Firestore
└── app.js              # Regras de frontend
```

## Funcionalidades

- Login via Firebase Authentication
- CRUD de funcionários, obras e usuários do sistema
- Dashboard com estatísticas em tempo real
- Filtros por obra, cargo e busca por nome/cargo
- Exportação CSV de funcionários

## Como usar

1. Abra `index.html` no navegador.
2. Faça login com um usuário existente na coleção `usuarios_sistema`.
3. O sistema sincroniza os dados em tempo real via Firestore.

## Firebase configurado

- projectId: `buca-geral`
- authDomain: `buca-geral.firebaseapp.com`
