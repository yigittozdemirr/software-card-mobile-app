// ═══════════════════════════════════════════════════════════════════════════════
// 🎮 OYUN STATE YÖNETİMİ — Phase 3: Tycoon Economy Refactor
// ═══════════════════════════════════════════════════════════════════════════════
//
// Değişiklikler:
//   • Budget $0 başlangıç
//   • 12 geliştirici, kademeli açılma
//   • Manuel eğitim (TRAIN_DEVELOPER) ile seviye atlama
//   • Pasif XP kaldırıldı, yerine para ile level-up
//   • Gelir: developer.gelirBase * GELIR_SEVIYE_CARPANLARI[seviye-1]
// ═══════════════════════════════════════════════════════════════════════════════

import React, { createContext, useContext, useReducer } from 'react';
import {
  BASLANGIC_BUTCE,
  YAZILIMCILAR,
  GELIR_SEVIYE_CARPANLARI,
  GUC_SEVIYE_CARPANLARI,
  MAX_SEVIYE,
  YUKSELTMELER,
  getEgitimMaliyeti,
  getGelirHizi,
} from '../constants';

// ── Başlangıç State ────────────────────────────────────────────────────────────

// Geliştirici listesini hazırla: sadece ilk dev açık, diğerleri kilitli
const hazirlaDevListesi = () =>
  YAZILIMCILAR.map((dev, index) => ({
    ...dev,
    durum: 'musait',
    seviye: 1,
    intervalId: null,
    kpiLocked: index !== 0, // Sadece ilk dev açık
  }));

export const baslangicState = {
  budget: BASLANGIC_BUTCE,
  toplamKazanilan: 0,
  toplamHarcanan: 0,
  developers: hazirlaDevListesi(),
  achievements: [],

  // Proje sistemi
  projects: [],
  tamamlananProjeler: 0,

  // Olay sistemi
  aktifOlay: null,
  gelirCarpani: 1,
  gelirDurduruldu: false,
  bugsCount: 0,
  xpCarpani: 1,

  // Yükseltmeler
  upgrades: [],

  // Bütçe geçmişi (grafik için)
  budgetHistory: [BASLANGIC_BUTCE],
};

// ── Reducer ────────────────────────────────────────────────────────────────────

function gameReducer(state, action) {
  try {
  switch (action.type) {

    // ── İşe Alma (per-dev maliyet) ──────────────────────────────────────────

    case 'HIRE': {
      const dev = state.developers.find((d) => d.id === action.payload.devId);
      if (!dev || dev.kpiLocked) return state;
      const maliyet = dev.maliyetBase;
      if (state.budget < maliyet) return state;
      return {
        ...state,
        budget: state.budget - maliyet,
        toplamHarcanan: state.toplamHarcanan + maliyet,
        developers: state.developers.map((d) =>
          d.id === action.payload.devId
            ? { ...d, durum: 'ispiyor' }
            : d,
        ),
      };
    }

    case 'START_WORK': {
      return {
        ...state,
        developers: state.developers.map((dev) =>
          dev.id === action.payload.devId
            ? { ...dev, durum: 'calisiyor', intervalId: action.payload.intervalId }
            : dev,
        ),
      };
    }

    case 'STOP_WORK': {
      return {
        ...state,
        developers: state.developers.map((dev) => {
          if (dev.id !== action.payload.devId) return dev;
          if (dev.intervalId) clearInterval(dev.intervalId);
          return { ...dev, durum: 'musait', intervalId: null };
        }),
      };
    }

    // Pasif gelir: geçici gelirCarpani ve Kalıcı Upgrade çarpanlarını harmanlar
    case 'ADD_INCOME': {
      if (state.gelirDurduruldu || state.bugsCount > 0) return state;
      
      const devIndex = state.developers.findIndex((d) => d.id === action.payload.devId);
      if (devIndex === -1) return state;
      const dev = state.developers[devIndex];

      let globalCarpan = 1;
      let ozelCarpan = 1;

      state.upgrades.forEach((upgradeId) => {
        const upg = YUKSELTMELER.find((u) => u.id === upgradeId);
        if (upg) {
          if (upg.target === 'global') {
            globalCarpan *= upg.carpan;
          } else if (upg.target === 'devIndex' && upg.index === devIndex) {
            ozelCarpan *= upg.carpan;
          }
        }
      });

      const finalCarpan = globalCarpan * ozelCarpan * state.gelirCarpani;
      const gelir = Math.round(getGelirHizi(dev) * finalCarpan);
      
      return {
        ...state,
        budget: state.budget + gelir,
        toplamKazanilan: state.toplamKazanilan + gelir,
      };
    }

    // ── Clicker Mechanic (+1 Para) ──────────────────────────────────────────
    case 'INCREMENT_BUDGET_CLICK': {
      return {
        ...state,
        budget: state.budget + 1,
        toplamKazanilan: state.toplamKazanilan + 1,
      };
    }

    case 'BUY_UPGRADE': {
      const upgrade = action.payload.upgrade;
      if (state.budget < upgrade.baslangicMaliyeti || state.upgrades.includes(upgrade.id)) return state;
      
      return {
        ...state,
        budget: state.budget - upgrade.baslangicMaliyeti,
        toplamHarcanan: state.toplamHarcanan + upgrade.baslangicMaliyeti,
        upgrades: [...state.upgrades, upgrade.id],
      };
    }

    // ── Manuel Eğitim (Level Up) ────────────────────────────────────────────

    case 'TRAIN_DEVELOPER': {
      const devIndex = state.developers.findIndex((d) => d.id === action.payload.devId);
      if (devIndex === -1) return state;

      const dev = state.developers[devIndex];
      if (dev.seviye >= MAX_SEVIYE) return state;

      const maliyet = getEgitimMaliyeti(devIndex, dev.seviye);
      if (state.budget < maliyet) return state;

      const yeniSeviye = dev.seviye + 1;

      // Yeni developers dizisi oluştur
      let yeniDevs = state.developers.map((d) =>
        d.id === action.payload.devId
          ? { ...d, seviye: yeniSeviye }
          : d,
      );

      // ── Kademeli Açılma: Seviye 3'e ulaşınca sonraki dev'i aç ──
      if (yeniSeviye >= 3) {
        // Bu dev'in index'inden sonra ilk kilitli dev'i aç
        const sonrakiKilitliIndex = yeniDevs.findIndex(
          (d, i) => i > devIndex && d.kpiLocked,
        );
        if (sonrakiKilitliIndex !== -1) {
          yeniDevs = yeniDevs.map((d, i) =>
            i === sonrakiKilitliIndex ? { ...d, kpiLocked: false } : d,
          );
        }
      }

      return {
        ...state,
        budget: state.budget - maliyet,
        toplamHarcanan: state.toplamHarcanan + maliyet,
        developers: yeniDevs,
      };
    }

    case 'UNLOCK_ACHIEVEMENT': {
      if (state.achievements.includes(action.payload.achievementId)) return state;
      return {
        ...state,
        achievements: [...state.achievements, action.payload.achievementId],
      };
    }

    // ── Proje Aksiyonları ────────────────────────────────────────────────────

    case 'SET_PROJECTS': {
      return { ...state, projects: action.payload.projects };
    }

    case 'ACCEPT_PROJECT': {
      return {
        ...state,
        projects: state.projects.map((p) =>
          p.id === action.payload.projeId && p.status === 'PENDING'
            ? { ...p, status: 'ACTIVE' }
            : p,
        ),
      };
    }

    case 'TICK_PROJECTS': {
      const takimGucu = action.payload?.takimGucu ?? 0;
      let kazanilanOdul = 0;
      let tamamlananSayisi = 0;
      const aktifVeyaDevam = [];

      state.projects.forEach((p) => {
        if (p.status !== 'ACTIVE') {
          aktifVeyaDevam.push(p);
          return;
        }

        const yeniSure = Math.max(0, p.kalanSure - 1);
        
        // Takım gücü ne kadar yüksekse o kadar hızlı biter (örneğin güç * 1.5 % ilerleme)
        const progressArtis = Math.max(takimGucu * 0.5, 0.1);
        const yeniProgress = (p.progress || 0) + progressArtis;
        
        if (yeniProgress >= 100) {
          kazanilanOdul += p.odul;
          tamamlananSayisi += 1;
        } else {
           aktifVeyaDevam.push({ ...p, kalanSure: yeniSure, progress: yeniProgress });
        }
      });

      return { 
        ...state, 
        projects: aktifVeyaDevam,
        budget: state.budget + kazanilanOdul,
        toplamKazanilan: state.toplamKazanilan + kazanilanOdul,
        tamamlananProjeler: state.tamamlananProjeler + tamamlananSayisi,
      };
    }

    case 'COMPLETE_PROJECT': {
      const proje = state.projects.find((p) => p.id === action.payload.projeId);
      if (!proje || proje.status !== 'ACTIVE') return state;
      return {
        ...state,
        budget: state.budget + proje.odul,
        toplamKazanilan: state.toplamKazanilan + proje.odul,
        tamamlananProjeler: state.tamamlananProjeler + 1,
        projects: state.projects.filter((p) => p.id !== action.payload.projeId),
      };
    }

    case 'FAIL_PROJECT': {
      const proje = state.projects.find((p) => p.id === action.payload.projeId);
      if (!proje || proje.status !== 'ACTIVE') return state;
      return {
        ...state,
        budget: Math.max(0, state.budget - proje.ceza),
        projects: state.projects.filter((p) => p.id !== action.payload.projeId),
      };
    }

    // ── Olay Aksiyonları ────────────────────────────────────────────────────

    case 'SET_EVENT': {
      return { ...state, aktifOlay: action.payload.olay };
    }

    case 'CLEAR_EVENT': {
      return { ...state, aktifOlay: null };
    }

    case 'SPAWN_BUGS': {
      return { ...state, bugsCount: 5 };
    }

    case 'FIX_BUG': {
      return { ...state, bugsCount: Math.max(0, state.bugsCount - 1) };
    }

    case 'SET_INCOME_MULTIPLIER': {
      return { ...state, gelirCarpani: action.payload.carpan };
    }

    case 'SET_INCOME_PAUSED': {
      return { ...state, gelirDurduruldu: action.payload.durduruldu };
    }

    case 'SET_XP_MULTIPLIER': {
      return { ...state, xpCarpani: action.payload.carpan };
    }

    case 'ADJUST_BUDGET': {
      const miktar = action.payload.miktar;
      return {
        ...state,
        budget: Math.max(0, state.budget + miktar),
        toplamKazanilan: miktar > 0
          ? state.toplamKazanilan + miktar
          : state.toplamKazanilan,
        toplamHarcanan: miktar < 0
          ? state.toplamHarcanan + Math.abs(miktar)
          : state.toplamHarcanan,
      };
    }

    case 'BULK_ADD_XP': {
      // Legacy — no longer adds XP, kept for backward compat
      return state;
    }

    // ── Oyun Sıfırlama ────────────────────────────────────────────────────

    case 'RESET_GAME': {
      // Tüm çalışan interval'leri temizle
      state.developers.forEach((dev) => {
        if (dev.intervalId) clearInterval(dev.intervalId);
      });
      return { ...baslangicState, developers: hazirlaDevListesi() };
    }

    // ── Persistence ─────────────────────────────────────────────────────────

    case 'ADD_BUDGET_SNAPSHOT': {
      const yeniGecmis = [...state.budgetHistory, state.budget].slice(-10);
      return { ...state, budgetHistory: yeniGecmis };
    }

    case 'LOAD_SAVED_STATE': {
      const saved = action.payload.savedState;

      // Kayıtlı developer'ları güncelle — eski 3-dev formatını handle et
      let mergedDevs = hazirlaDevListesi();

      if (saved.developers && saved.developers.length > 0) {
        // Eğer kayıtlı dev listesi var ise, mevcut listeyle eşleştir
        mergedDevs = mergedDevs.map((defaultDev) => {
          const savedDev = saved.developers.find((sd) => sd.id === defaultDev.id);
          if (savedDev) {
            return {
              ...defaultDev,
              seviye: savedDev.seviye || 1,
              durum: savedDev.durum === 'calisiyor' ? 'ispiyor' : (savedDev.durum || 'musait'),
              kpiLocked: savedDev.kpiLocked !== undefined ? savedDev.kpiLocked : defaultDev.kpiLocked,
              intervalId: null,
            };
          }
          return defaultDev;
        });
      }

      return {
        ...state,
        budget: saved.budget ?? state.budget,
        toplamKazanilan: saved.toplamKazanilan ?? state.toplamKazanilan,
        toplamHarcanan: saved.toplamHarcanan ?? state.toplamHarcanan,
        achievements: saved.achievements ?? state.achievements,
        tamamlananProjeler: saved.tamamlananProjeler ?? state.tamamlananProjeler,
        budgetHistory: saved.budgetHistory ?? state.budgetHistory,
        developers: mergedDevs,
        // Olay efektlerini sıfırla
        aktifOlay: null,
        gelirCarpani: 1, // Olay çarpanları geçici olduğu için sıfırla
        gelirDurduruldu: false,
        bugsCount: 0,
        xpCarpani: 1,
        upgrades: saved.upgrades ?? state.upgrades,
      };
    }

    default:
      return state;
  }
  } catch (error) {
    // ── Error Resiliency: prevent app crash from non-fatal reducer errors ──
    console.error('🔴 GameReducer Error:', error, '| Action:', action.type);
    return state; // Return previous state unchanged on error
  }
}

// ── Context & Provider ─────────────────────────────────────────────────────────

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, baslangicState);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
