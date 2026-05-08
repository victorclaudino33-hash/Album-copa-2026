<div align="center">
<img src="https://em-content.zobj.net/source/apple/391/soccer-ball_26bd.png" width="80px" />
# Álbum Figurinhas Copa 2026
 
**Seu álbum da Copa do Mundo no bolso — digital, em tempo real e salvo na nuvem.**
 
[![Deploy](https://img.shields.io/badge/Vercel-Deploy-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES2022-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
 
</div>
---
 
## ⚽ Sobre o projeto
 
O **Álbum Figurinhas Copa 2026** é um aplicativo web que permite acompanhar sua coleção de figurinhas da Copa do Mundo de forma digital e em tempo real.
 
Cada usuário cria uma conta — por e-mail ou Google — e o progresso fica salvo na nuvem. Acesse do celular, computador ou qualquer dispositivo sem perder nada.
 
---
 
## ✨ Funcionalidades
 
| Recurso | Descrição |
|---|---|
| 🔐 **Autenticação** | Login por e-mail/senha ou Google via Firebase Auth |
| ☁️ **Nuvem** | Progresso salvo automaticamente no Firestore |
| 🌍 **12 Grupos** | Todos os grupos da Copa com suas seleções |
| 🏆 **Seções especiais** | FIFA World Cup History e figurinhas Coca-Cola |
| 🔁 **3 estados** | Marque cada figurinha como faltando, colada ou repetida |
| ⚡ **Ações rápidas** | Marque o time inteiro de uma vez |
| 📊 **Estatísticas ao vivo** | Coladas, faltando e repetidas sempre atualizadas |
| 📋 **Lista de repetidas** | Veja todas as repetidas para organizar trocas |
| 🔍 **Filtros** | Filtre por grupo, faltando, coladas, repetidas ou completas |
 
---
 
## 🖥️ Preview
 
```
┌─────────────────────────────────────────────┐
│  ⚽ Copa 2026              user@email  [Sair]│
├─────────────────────────────────────────────┤
│   247          89          34               │
│  Coladas     Faltando   Repetidas           │
│ ████████████████░░░░░░░░  73% completo      │
├─────────────────────────────────────────────┤
│ 🌍 Todos │ Grupo A │ Grupo B │ Grupo C ...  │
│ [Todas] [⬜ Faltando] [✅ Coladas] [🔁 Rep] │
├─────────────────────────────────────────────┤
│  GRUPO C                                    │
│  🇧🇷 Brasil               20/20  ✅  ██████│
│  🇲🇦 Marrocos             14/20     ████░░│
│  🇭🇹 Haiti                 3/20     █░░░░ │
└─────────────────────────────────────────────┘
```
 
---
 
## 🚀 Como rodar localmente
 
Não é necessário nenhum processo de build. Basta servir os arquivos estáticos:
 
```bash
# Clone o repositório
git clone https://github.com/seu-usuario/album-copa2026.git
cd album-copa2026
 
# Sirva com qualquer servidor estático, por exemplo:
npx serve .
# ou
python3 -m http.server 3000
```
 
> ⚠️ **Importante:** abra sempre via servidor HTTP (`http://localhost`), nunca diretamente pelo sistema de arquivos (`file://`), pois o Firebase SDK exige origem HTTP para funcionar.
 
---
 
## ☁️ Deploy na Vercel
 
1. Suba o repositório para o GitHub
2. Importe na [Vercel](https://vercel.com/new):
   - **Framework Preset:** `Other`
   - **Build Command:** *(deixe em branco)*
   - **Output Directory:** *(deixe em branco)*
3. No **Firebase Console → Authentication → Settings → Authorized domains**, adicione seu domínio `.vercel.app`
4. Clique em **Deploy** ✅
---
 
## 🔥 Configuração do Firebase
 
As credenciais no `script.js` são chaves **públicas do SDK Web** — não são segredos de servidor. Mesmo assim, proteja seus dados com as **Security Rules** do Firestore:
 
```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /albums/{userId} {
      // Cada usuário só acessa e edita o próprio álbum
      allow read, write: if request.auth != null
                         && request.auth.uid == userId;
    }
  }
}
```
 
---
 
## 📁 Estrutura do projeto
 
```
album-copa2026/
├── index.html      ← Estrutura HTML e importações
├── style.css       ← Todos os estilos (CSS variables + componentes)
├── script.js       ← Firebase Auth + Firestore + lógica da UI
├── vercel.json     ← Rewrites e headers de cache para Vercel
└── README.md
```
 
---
 
## 🛠️ Tecnologias
 
- **HTML5 + CSS3 + JavaScript (ES Modules)** — sem frameworks, sem bundler
- **Firebase v10** — Authentication (e-mail + Google) e Firestore
- **Vercel** — deploy e CDN global
---
 
<div align="center">
Feito com ⚽ e muito ☕ para a Copa de 2026
 
</div>
