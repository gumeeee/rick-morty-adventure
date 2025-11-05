  # 🚀 Rick and Morty Dashboard

  Dashboard interativo para explorar o universo de Rick and Morty, desenvolvido como
  teste técnico.

  [![CI Pipeline](https://github.com/gumeeee/rick-morty-adventure/workflows/CI%20Pipeline/badge.svg)](https://github.com/gumeeee/rick-morty-adventure/actions)
  [![Angular](https://img.shields.io/badge/Angular-18-red)](https://angular.io/)
  [![Docker](https://img.shields.io/badge/Docker-ready-blue)](https://www.docker.com/)

  **[🌐 Demo ao Vivo](https://main.d2yzbtm6ubfozo.amplifyapp.com/)**

  ---

  ## 📋 Features

  - ✅ Autenticação com JWT fake (login/registro/perfil)
  - ✅ Listagem de personagens, localizações e episódios
  - ✅ Páginas de detalhes com lazy loading
  - ✅ Filtros avançados e busca persistente
  - ✅ Integração com TMDB API (ratings dos episódios)
  - ✅ Design temático Rick and Morty com animações
  - ✅ Responsivo (mobile e desktop)
  - ✅ CI/CD com GitHub Actions + AWS Amplify
  - ✅ Docker support (dev e prod)

  ---

  ## 🛠 Tech Stack

  **Frontend:** Angular 18 (Standalone Components), TypeScript, SCSS, Bootstrap 5

  **State Management:** RxJS + Signals

  **APIs:** [Rick and Morty API](https://rickandmortyapi.com/) + [TMDB 
  API](https://www.themoviedb.org/)

  **DevOps:** GitHub Actions, AWS Amplify, Docker

  ---

  ## 🚀 Como Rodar

  ### 1️⃣ Localmente (requer Node.js 20+)

  ```bash
  # Clone e instale
  git clone https://github.com/gumeeee/rick-morty-adventure.git
  cd rick-morty-adventure
  npm install

  # Rode o projeto
  npm start

  # Acesse http://localhost:4200

  ---
  2️⃣ Docker - Desenvolvimento (com hot reload)

  # Clone
  git clone https://github.com/gumeeee/rick-morty-adventure.git
  cd rick-morty-adventure

  # Configure TMDB API Key (opcional)
  cp .env.example .env
  # Edite .env e adicione sua key

  # Rode
  docker-compose -f docker-compose.yml up

  # Acesse http://localhost:4200

  ---
  3️⃣ Docker - Produção (build otimizado)

  # Clone
  git clone https://github.com/gumeeee/rick-morty-adventure.git
  cd rick-morty-adventure

  # Configure TMDB API Key (opcional)
  cp .env.example .env
  # Edite .env e adicione sua key

  # Build e rode
  docker-compose up --build

  # Acesse http://localhost:4200

  ---
  🔑 TMDB API Key (Opcional)

  Para exibir ratings dos episódios, você precisa de uma TMDB API Key:

  1. Crie conta em https://www.themoviedb.org/
  2. Vá em Settings → API → Solicite API Key
  3. Configure:
    - Local: edite src/environments/environment.ts
    - Docker: edite arquivo .env

  ⚠️ O app funciona sem a key, mas não mostra ratings.
