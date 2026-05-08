/**
 * script.js — Álbum Figurinhas Copa 2026
 *
 * Estrutura:
 *  1. Firebase: config, init, auth, firestore
 *  2. Dados do álbum (ALBUM) e helper getStickerTypes
 *  3. Estado da UI (aba ativa, filtro ativo)
 *  4. Funções de tela (showAuth / showApp)
 *  5. Toast
 *  6. Estatísticas e progresso
 *  7. Renderização de times e figurinhas
 *  8. Modal de repetidas
 *  9. Event listeners (tabs, filtros, modal, teclado)
 * 10. Funções expostas globalmente (chamadas via onclick no HTML)
 */

// =====================================================
// 1. FIREBASE — Importações via ESM (CDN modular v10)
// =====================================================
import { initializeApp }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// =====================================================
// CONFIGURAÇÃO FIREBASE
// =====================================================
const firebaseConfig = {
  apiKey:            "AIzaSyB_jKB8phBvC7eDHgY9WDrFqstYryE61mg",
  authDomain:        "album-copa2026-cf58e.firebaseapp.com",
  projectId:         "album-copa2026-cf58e",
  storageBucket:     "album-copa2026-cf58e.firebasestorage.app",
  messagingSenderId: "292916287350",
  appId:             "1:292916287350:web:e3cd3a4d8585ea6f390c57",
};

const app            = initializeApp(firebaseConfig);
const auth           = getAuth(app);
const db             = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// =====================================================
// ESTADO GLOBAL
// =====================================================
let currentUser = null;
let state       = {};     // { "BRA_1": 1, "ARG_2": 2, ... }
let saveTimeout = null;


// =====================================================
// AUTH — Inicialização: trata redirect do Google (mobile)
// e observa mudanças de login/logout
// =====================================================
async function initAuth() {
  // 1. Verifica se voltamos de um redirect do Google
  try {
    const result = await getRedirectResult(auth);
    // Se veio de redirect, o onAuthStateChanged já dispara
    // automaticamente com o usuário logado — não fazemos nada aqui.
    if (result) console.log("Redirect Google concluído:", result.user.email);
  } catch (e) {
    console.error("Erro no redirect Google:", e);
  }

  // 2. Observa qualquer mudança de autenticação (login, logout, redirect)
  onAuthStateChanged(auth, async (user) => {
    currentUser = user;
    if (user) {
      showApp();
      await loadUserData();
      updateAll();
    } else {
      showAuth();
    }
  });
}

initAuth();

// =====================================================
// FIRESTORE — Carrega dados do usuário logado
// =====================================================
async function loadUserData() {
  try {
    const ref  = doc(db, "albums", currentUser.uid);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      state = snap.data().stickers || {};
    } else {
      // Primeiro acesso: cria documento vazio
      await setDoc(ref, {
        stickers:  {},
        createdAt: new Date().toISOString(),
      });
      state = {};
    }
  } catch (e) {
    console.error("Erro ao carregar dados:", e);
    showToast("Erro ao carregar seus dados. Verifique a conexão.", "error");
  }
}

// =====================================================
// FIRESTORE — Salva com debounce de 800ms
// Evita múltiplas escritas em sequência rápida
// =====================================================
function scheduleSave() {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(saveNow, 800);
}

async function saveNow() {
  if (!currentUser) return;
  try {
    const ref = doc(db, "albums", currentUser.uid);
    await updateDoc(ref, {
      stickers:  state,
      updatedAt: new Date().toISOString(),
    });
  } catch (e) {
    console.error("Erro ao salvar:", e);
    showToast("Erro ao salvar. Tente novamente.", "error");
  }
}

// =====================================================
// 2. DADOS DO ÁLBUM
// =====================================================
const ALBUM = {
  groups: [
    { id: 'A', teams: [
      { code: 'MEX', name: 'México',         flag: 'MEX' },
      { code: 'RSA', name: 'África do Sul',  flag: 'RSA' },
      { code: 'KOR', name: 'Coréia do Sul',  flag: 'KOR' },
      { code: 'CZE', name: 'Rep. Tcheca',    flag: 'CZE' },
    ]},
    { id: 'B', teams: [
      { code: 'CAN', name: 'Canadá',         flag: 'CAN' },
      { code: 'BIH', name: 'Bósnia',         flag: 'BIH' },
      { code: 'QAT', name: 'Catar',          flag: 'QAT' },
      { code: 'SUI', name: 'Suíça',          flag: 'SUI' },
    ]},
    { id: 'C', teams: [
      { code: 'BRA', name: 'Brasil',         flag: 'BRA' },
      { code: 'MAR', name: 'Marrocos',       flag: 'MAR' },
      { code: 'HAI', name: 'Haiti',          flag: 'HAI' },
      { code: 'SCO', name: 'Escócia',        flag: 'SCO' },
    ]},
    { id: 'D', teams: [
      { code: 'USA', name: 'Estados Unidos', flag: 'USA' },
      { code: 'PAR', name: 'Paraguai',       flag: 'PAR' },
      { code: 'AUS', name: 'Austrália',      flag: 'AUS' },
      { code: 'TUR', name: 'Turquia',        flag: 'TUR' },
    ]},
    { id: 'E', teams: [
      { code: 'GER', name: 'Alemanha',        flag: 'GER' },
      { code: 'CUW', name: 'Curaçao',         flag: 'CUW' },
      { code: 'CIV', name: 'Costa do Marfim', flag: 'CIV' },
      { code: 'ECU', name: 'Equador',         flag: 'ECU' },
    ]},
    { id: 'F', teams: [
      { code: 'NED', name: 'Holanda',        flag: 'NED' },
      { code: 'JPN', name: 'Japão',          flag: 'JPN' },
      { code: 'SWE', name: 'Suécia',         flag: 'SWE' },
      { code: 'TUN', name: 'Tunísia',        flag: 'TUN' },
    ]},
    { id: 'G', teams: [
      { code: 'BEL', name: 'Bélgica',        flag: 'BEL' },
      { code: 'EGY', name: 'Egito',          flag: 'EGY' },
      { code: 'IRN', name: 'Irã',            flag: 'IRN' },
      { code: 'NZL', name: 'Nova Zelândia',  flag: 'NZL' },
    ]},
    { id: 'H', teams: [
      { code: 'ESP', name: 'Espanha',        flag: 'ESP' },
      { code: 'CPV', name: 'Cabo Verde',     flag: 'CPV' },
      { code: 'KSA', name: 'Arábia Saudita', flag: 'KSA' },
      { code: 'URU', name: 'Uruguai',        flag: 'URU' },
    ]},
    { id: 'I', teams: [
      { code: 'FRA', name: 'França',         flag: 'FRA' },
      { code: 'SEN', name: 'Senegal',        flag: 'SEN' },
      { code: 'IRQ', name: 'Iraque',         flag: 'IRQ' },
      { code: 'NOR', name: 'Noruega',        flag: 'NOR' },
    ]},
    { id: 'J', teams: [
      { code: 'ARG', name: 'Argentina',      flag: 'ARG' },
      { code: 'ALG', name: 'Argélia',        flag: 'ALG' },
      { code: 'AUT', name: 'Áustria',        flag: 'AUT' },
      { code: 'JOR', name: 'Jordânia',       flag: 'JOR' },
    ]},
    { id: 'K', teams: [
      { code: 'POR', name: 'Portugal',       flag: 'POR' },
      { code: 'COD', name: 'Congo',          flag: 'COD' },
      { code: 'UZB', name: 'Uzbequistão',   flag: 'UZB' },
      { code: 'COL', name: 'Colômbia',      flag: 'COCOLL' },
    ]},
    { id: 'L', teams: [
      { code: 'ENG', name: 'Inglaterra',     flag: 'ENG󠁧󠁢󠁥' },
      { code: 'CRO', name: 'Croácia',        flag: 'CRO' },
      { code: 'GHA', name: 'Gana',           flag: 'GHA' },
      { code: 'PAN', name: 'Panamá',         flag: 'PAN' },
    ]},
    { id: 'FWC', special: true, teams: [
      { code: 'FWC', name: 'FIFA World Cup History',  flag: '🏆' },
      { code: 'CC',  name: 'Figurinhas Coca-Cola',    flag: '🥤' },
    ]},
  ],
};

/**
 * Retorna os tipos de figurinha de um time.
 * Times especiais (FWC/CC) têm conjuntos distintos;
 * times normais têm sempre 20 figurinhas.
 */
function getStickerTypes(code, special) {
  if (special && code === 'FWC') {
    return [
      { n: '9',  ico: '📖', t: 'Intro'    },
      { n: '10', ico: '🏟️', t: 'Estádio'  },
      { n: '11', ico: '🌍', t: 'História' },
      { n: '12', ico: '🏆', t: 'Taças'    },
      { n: '13', ico: '⭐', t: 'Recorde'  },
      { n: '14', ico: '📸', t: 'Foto'     },
      { n: '15', ico: '🌟', t: 'Lenda'    },
      { n: '16', ico: '🎖️', t: 'Mérito'   },
      { n: '17', ico: '🏅', t: 'Honra'    },
      { n: '18', ico: '📜', t: 'Legado'   },
      { n: '19', ico: '👑', t: 'Glória'   },
    ];
  }

  if (special && code === 'CC') {
    return Array.from({ length: 14 }, (_, i) => ({
      n: `CC${i + 1}`, ico: '🥤', t: 'Coca-Cola',
    }));
  }

  // Time normal: emblema + 11 jogadores + foto + reservas + craque
  return [
    { n: '1',  ico: '🛡️', t: 'Emblema' },
    { n: '2',  ico: '👤', t: 'Jogador' }, { n: '3',  ico: '👤', t: 'Jogador' },
    { n: '4',  ico: '👤', t: 'Jogador' }, { n: '5',  ico: '👤', t: 'Jogador' },
    { n: '6',  ico: '👤', t: 'Jogador' }, { n: '7',  ico: '👤', t: 'Jogador' },
    { n: '8',  ico: '👤', t: 'Jogador' }, { n: '9',  ico: '👤', t: 'Jogador' },
    { n: '10', ico: '👤', t: 'Jogador' }, { n: '11', ico: '👤', t: 'Jogador' },
    { n: '12', ico: '👤', t: 'Jogador' },
    { n: '13', ico: '📸', t: 'Time'    },
    { n: '14', ico: '👤', t: 'Reserva' }, { n: '15', ico: '👤', t: 'Reserva' },
    { n: '16', ico: '👤', t: 'Reserva' }, { n: '17', ico: '👤', t: 'Reserva' },
    { n: '18', ico: '👤', t: 'Reserva' }, { n: '19', ico: '👤', t: 'Reserva' },
    { n: '20', ico: '⭐', t: 'Craque'  },
  ];
}

/** Total de figurinhas do álbum (calculado uma vez no boot) */
const TOTAL = (() => {
  let t = 0;
  ALBUM.groups.forEach(g =>
    g.teams.forEach(tm => { t += getStickerTypes(tm.code, g.special).length; })
  );
  return t;
})();

// =====================================================
// 3. ESTADO DA UI
// =====================================================
let activeTab    = 'all';
let activeFilter = 'all';

// =====================================================
// 4. TELAS — alterna entre Auth e App
// =====================================================
function showAuth() {
  document.getElementById('screen-auth').style.display = 'flex';
  document.getElementById('screen-app').style.display  = 'none';
}

function showApp() {
  document.getElementById('screen-auth').style.display = 'none';
  document.getElementById('screen-app').style.display  = 'block';
  if (currentUser) {
    document.getElementById('user-email-display').textContent =
      currentUser.displayName || currentUser.email || 'Usuário';
  }
}

// =====================================================
// 5. TOAST — notificações temporárias
// =====================================================
let toastTimer = null;

function showToast(msg, type = '') {
  const el    = document.getElementById('toast');
  el.textContent = msg;
  el.className   = 'show' + (type ? ' ' + type : '');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.className = ''; }, 3200);
}

// =====================================================
// 6. ESTATÍSTICAS E PROGRESSO
// =====================================================
function getStats() {
  let have = 0, rep = 0, miss = 0;
  ALBUM.groups.forEach(g => {
    g.teams.forEach(tm => {
      getStickerTypes(tm.code, g.special).forEach(t => {
        const v = state[tm.code + '_' + t.n] || 0;
        if      (v === 1) { have++; }
        else if (v === 2) { have++; rep++; }
        else              { miss++; }
      });
    });
  });
  return { have, rep, miss };
}

function teamStats(code, special) {
  const types = getStickerTypes(code, special);
  let have = 0;
  types.forEach(t => { if ((state[code + '_' + t.n] || 0) > 0) have++; });
  return { have, total: types.length };
}

function updateStats() {
  const { have, rep, miss } = getStats();
  document.getElementById('s-total').textContent = have;
  document.getElementById('s-miss').textContent  = miss;
  document.getElementById('s-rep').textContent   = rep;
  const pct = TOTAL > 0 ? Math.round((have / TOTAL) * 100) : 0;
  document.getElementById('prog-fill').style.width  = pct + '%';
  document.getElementById('prog-label').textContent =
    pct + '% completo (' + have + '/' + TOTAL + ')';
}

// =====================================================
// 7. RENDERIZAÇÃO
// =====================================================

/** Retorna os códigos de times visíveis conforme o filtro ativo */
function getVisibleTeams() {
  if (activeFilter === 'all') return null;
  const matches = [];
  ALBUM.groups.forEach(g => {
    g.teams.forEach(tm => {
      const { have, total } = teamStats(tm.code, g.special);
      if (activeFilter === 'missing'  && have < total)  matches.push(tm.code);
      if (activeFilter === 'have'     && have > 0)      matches.push(tm.code);
      if (activeFilter === 'complete' && have === total) matches.push(tm.code);
      if (activeFilter === 'repeat') {
        const hasRep = getStickerTypes(tm.code, g.special)
          .some(t => (state[tm.code + '_' + t.n] || 0) === 2);
        if (hasRep) matches.push(tm.code);
      }
    });
  });
  return matches;
}

/** Gera o HTML de um card de time com suas figurinhas */
function renderTeam(team, group) {
  const types           = getStickerTypes(team.code, group.special);
  const { have, total } = teamStats(team.code, group.special);
  const complete        = have === total;
  const pct             = Math.round((have / total) * 100);

  const stickersHtml = types.map(t => {
    const v   = state[team.code + '_' + t.n] || 0;
    const cls = v === 2 ? 'sticker repeat' : v === 1 ? 'sticker have' : 'sticker';
    const dr  = v === 2 ? 'data-r="×2"' : '';
    return `<div class="${cls}" ${dr}
      onclick="fbToggleSticker('${team.code}','${t.n}')"
      title="${t.t} #${t.n}">
      <div class="s-icon">${t.ico}</div>
      <div class="s-num">${t.n}</div>
      <div class="s-type">${t.t}</div>
    </div>`;
  }).join('');

  return `
    <div class="team-card" id="tc-${team.code}">
      <div class="team-header" onclick="toggleExpand('${team.code}')">
        <div class="team-info">
          <div class="team-flag">${team.flag}</div>
          <div>
            <div class="team-name">${team.name}${complete ? ' ✅' : ''}</div>
            <div class="team-code">${team.code} · ${have}/${total} figurinhas</div>
          </div>
        </div>
        <div class="team-progress">
          <div class="team-count">${have}/${total}</div>
          <div class="mini-bar">
            <div class="mini-fill${complete ? ' complete' : ''}" style="width:${pct}%"></div>
          </div>
        </div>
      </div>
      <div class="stickers-grid" id="sg-${team.code}" style="display:none">${stickersHtml}</div>
      <div class="sticker-legend" id="leg-${team.code}" style="display:none">
        <div class="legend-item"><div class="legend-dot miss"></div>Faltando</div>
        <div class="legend-item"><div class="legend-dot have"></div>Colada</div>
        <div class="legend-item"><div class="legend-dot rep"></div>Repetida</div>
        <span style="font-size:10px;color:var(--text2);margin-left:auto">Toque para alternar</span>
      </div>
      <div class="actions" id="ac-${team.code}" style="display:none">
        <button class="btn-sm btn-have" onclick="fbMarkAll('${team.code}','${!!group.special}','have')">✅ Todas coladas</button>
        <button class="btn-sm btn-miss" onclick="fbMarkAll('${team.code}','${!!group.special}','miss')">❌ Zerar</button>
        <button class="btn-sm btn-rep"  onclick="fbMarkAll('${team.code}','${!!group.special}','rep')">🔁 Todas repetidas</button>
      </div>
    </div>`;
}

/** Abre/fecha o painel de figurinhas de um time */
window.toggleExpand = function(code) {
  const sg  = document.getElementById('sg-'  + code);
  const ac  = document.getElementById('ac-'  + code);
  const leg = document.getElementById('leg-' + code);
  const isOpen = sg.style.display === 'grid';
  sg.style.display  = isOpen ? 'none' : 'grid';
  ac.style.display  = isOpen ? 'none' : 'flex';
  leg.style.display = isOpen ? 'none' : 'flex';
};

/** Re-renderiza todo o conteúdo respeitando aba e filtro ativos */
function renderContent() {
  const vf = getVisibleTeams();
  let html = '';
  ALBUM.groups.forEach(g => {
    if (activeTab !== 'all' && activeTab !== g.id) return;
    const teamsHtml = g.teams
      .filter(tm => !vf || vf.includes(tm.code))
      .map(tm => renderTeam(tm, g))
      .join('');
    if (!teamsHtml.trim()) return;
    html += `<div class="group-header">GRUPO ${g.id}</div>${teamsHtml}`;
  });
  if (!html) {
    html = `<div class="empty-state">
      <div class="empty-ico">🔍</div>
      <div>Nenhuma seleção encontrada para esse filtro</div>
    </div>`;
  }
  document.getElementById('content').innerHTML = html;
}

/** Atualiza stats + conteúdo de uma vez */
function updateAll() {
  updateStats();
  renderContent();
}

// =====================================================
// 8. MODAL — Lista de figurinhas repetidas
// =====================================================
window.openRepeats = function() {
  const items = [];
  ALBUM.groups.forEach(g => {
    g.teams.forEach(tm => {
      getStickerTypes(tm.code, g.special).forEach(t => {
        if ((state[tm.code + '_' + t.n] || 0) === 2) {
          items.push({ flag: tm.flag, name: tm.name, n: t.n, type: t.t });
        }
      });
    });
  });

  const list = document.getElementById('rep-list');
  if (!items.length) {
    list.innerHTML =
      '<div style="color:var(--text2);text-align:center;padding:24px">Nenhuma figurinha repetida ainda 🎉</div>';
  } else {
    list.innerHTML = `
      <p style="font-size:12px;color:var(--text2);margin-bottom:12px">
        Total: <b style="color:var(--gold)">${items.length}</b> repetida(s)
      </p>
      ${items.map(i => `
        <div class="repeat-item">
          <div style="display:flex;align-items:center;gap:8px">
            <span>${i.flag}</span><span>${i.name}</span>
          </div>
          <div style="display:flex;align-items:center">
            <span style="font-size:11px;color:var(--text2);margin-right:8px">${i.type}</span>
            <span class="repeat-badge">#${i.n}</span>
          </div>
        </div>`).join('')}`;
  }
  document.getElementById('rep-modal').classList.add('open');
};

window.closeRepeats = function() {
  document.getElementById('rep-modal').classList.remove('open');
};

// =====================================================
// 9. EVENT LISTENERS
// =====================================================

// Navegação por abas de grupo
document.getElementById('tabs').addEventListener('click', e => {
  const t = e.target.closest('.tab');
  if (!t) return;
  activeTab = t.dataset.tab;
  document.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
  t.classList.add('active');
  renderContent();
});

// Filtros rápidos (chips)
document.querySelector('.filter-bar').addEventListener('click', e => {
  const c = e.target.closest('.chip');
  if (!c) return;
  activeFilter = c.dataset.filter;
  document.querySelectorAll('.chip').forEach(x => x.classList.remove('active'));
  c.classList.add('active');
  renderContent();
});

// Fecha o modal ao clicar no fundo escuro
document.getElementById('rep-modal').addEventListener('click', e => {
  if (e.target === document.getElementById('rep-modal')) window.closeRepeats();
});

// Fecha o modal com tecla Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') window.closeRepeats();
});

// =====================================================
// 10. AÇÕES GLOBAIS — chamadas via onclick no HTML
// =====================================================

/** Alterna o estado de uma figurinha: vazia → colada → repetida → vazia */
window.fbToggleSticker = function(code, n) {
  const k   = code + '_' + n;
  const cur = state[k] || 0;
  state[k]  = (cur + 1) % 3;
  scheduleSave();
  updateAll();
};

/** Marca todas as figurinhas de um time de uma vez */
window.fbMarkAll = function(code, special, val) {
  const types = getStickerTypes(code, special === 'true');
  types.forEach(t => {
    const k = code + '_' + t.n;
    if (val === 'have') state[k] = 1;
    if (val === 'miss') state[k] = 0;
    if (val === 'rep')  state[k] = 2;
  });
  scheduleSave();
  updateAll();
};

/** Login com e-mail e senha */
window.fbLogin = async function() {
  const email = document.getElementById('auth-email').value.trim();
  const pass  = document.getElementById('auth-pass').value;
  const btn   = document.getElementById('btn-login');
  if (!email || !pass) { showToast('Preencha e-mail e senha.', 'warn'); return; }

  btn.disabled    = true;
  btn.textContent = 'Entrando...';
  try {
    await signInWithEmailAndPassword(auth, email, pass);
  } catch (e) {
    btn.disabled    = false;
    btn.textContent = 'Entrar';
    if (['auth/user-not-found', 'auth/wrong-password', 'auth/invalid-credential'].includes(e.code)) {
      showToast('E-mail ou senha incorretos.', 'error');
    } else {
      showToast('Erro: ' + e.message, 'error');
    }
  }
};

/** Cadastro com e-mail e senha */
window.fbRegister = async function() {
  const email = document.getElementById('auth-email').value.trim();
  const pass  = document.getElementById('auth-pass').value;
  if (!email || pass.length < 6) {
    showToast('Senha precisa ter ao menos 6 caracteres.', 'warn');
    return;
  }
  try {
    await createUserWithEmailAndPassword(auth, email, pass);
    showToast('Conta criada com sucesso! Bem-vindo! 🎉', 'success');
  } catch (e) {
    if (e.code === 'auth/email-already-in-use') {
      showToast('E-mail já cadastrado. Faça login.', 'warn');
    } else {
      showToast('Erro: ' + e.message, 'error');
    }
  }
};

/** Login via Google — popup no desktop, redirect no mobile */
window.fbGoogleLogin = async function() {
  try {
    const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
    if (isMobile) {
      await signInWithRedirect(auth, googleProvider);
    } else {
      await signInWithPopup(auth, googleProvider);
    }
  } catch (e) {
    showToast('Erro no login com Google: ' + e.message, 'error');
  }
};

/** Logout — salva antes de sair */
window.fbLogout = async function() {
  await saveNow();
  await signOut(auth);
  state       = {};
  currentUser = null;
};
