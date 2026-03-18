// ═══════════════════════════════════════════════════════════════════════════════
// 💾 AUTO-SAVE HOOK — Phase 3: Updated for new developer schema
// ═══════════════════════════════════════════════════════════════════════════════

import { useEffect, useRef, useCallback } from 'react';
import { AppState, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useGame } from '../context/GameContext';

const KAYIT_ANAHTARI = '@ITManager_GameState_v3';
const KAYIT_ARALIGI = 10000; // 10 saniye

/**
 * State'i kayıt için temizler: serialize edilemeyen alanları çıkarır
 */
function temizleState(state) {
  return {
    budget: state.budget,
    toplamKazanilan: state.toplamKazanilan,
    toplamHarcanan: state.toplamHarcanan,
    achievements: state.achievements,
    tamamlananProjeler: state.tamamlananProjeler,
    budgetHistory: state.budgetHistory,
    developers: state.developers.map((dev) => ({
      id: dev.id,
      ad: dev.ad,
      unvan: dev.unvan,
      uzmanlik: dev.uzmanlik,
      emoji: dev.emoji,
      maliyetBase: dev.maliyetBase,
      gelirBase: dev.gelirBase,
      seviye: dev.seviye,
      durum: dev.durum === 'calisiyor' ? 'ispiyor' : dev.durum,
      kpiLocked: dev.kpiLocked,
      // intervalId kasıtlı olarak çıkarılır
    })),
  };
}

/**
 * Kayıtlı oyun state'ini AsyncStorage'dan yükler.
 */
export async function oyunYukle() {
  try {
    const json = await AsyncStorage.getItem(KAYIT_ANAHTARI);
    if (json) {
      return JSON.parse(json);
    }
  } catch (hata) {
    console.warn('Oyun yükleme hatası:', hata);
  }
  return null;
}

/**
 * Auto-save hook
 */
export default function useAutoSave() {
  const { state } = useGame();
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const kaydet = useCallback(async () => {
    try {
      const temiz = temizleState(stateRef.current);
      await AsyncStorage.setItem(KAYIT_ANAHTARI, JSON.stringify(temiz));
    } catch (hata) {
      console.warn('Otomatik kayıt hatası:', hata);
    }
  }, []);

  // 10 saniyede bir otomatik kayıt
  useEffect(() => {
    const interval = setInterval(kaydet, KAYIT_ARALIGI);
    return () => clearInterval(interval);
  }, [kaydet]);

  // App arka plana geçtiğinde kaydet
  useEffect(() => {
    if (Platform.OS === 'web') return;

    const abonelik = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'background' || nextState === 'inactive') {
        kaydet();
      }
    });

    return () => abonelik?.remove();
  }, [kaydet]);

  return { kaydet };
}
