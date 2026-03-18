// ═══════════════════════════════════════════════════════════════════════════════
// 🎲 RASTGELE OLAY HOOK — 60 saniyede bir olay tetikler
// ═══════════════════════════════════════════════════════════════════════════════
//
// Phase 3 FIX: Timed events now auto-resolve AND clear the event UI.
//   - gelir_durdur, gelir_yarim, gelir_x2, xp_x2 all have strict timers
//   - Dismissing the modal early also cleans up pending effect timers
//   - Returns kalanSure for countdown display in the modal
// ═══════════════════════════════════════════════════════════════════════════════

import { useEffect, useRef, useCallback, useState } from 'react';
import { rastgeleOlaySecimi } from '../constants';
import { useGame } from '../context/GameContext';

const OLAY_ARALIGI = 60000; // 60 saniye

export default function useRandomEvents() {
  const { state, dispatch } = useGame();
  const efektZamanlayici = useRef(null);
  const otomatikKapatZamanlayici = useRef(null);
  const countdownInterval = useRef(null);
  const [kalanSure, setKalanSure] = useState(0);

  // Tüm zamanlayıcıları temizle
  const temizleZamanlayicilar = useCallback(() => {
    if (efektZamanlayici.current) {
      clearTimeout(efektZamanlayici.current);
      efektZamanlayici.current = null;
    }
    if (otomatikKapatZamanlayici.current) {
      clearTimeout(otomatikKapatZamanlayici.current);
      otomatikKapatZamanlayici.current = null;
    }
    if (countdownInterval.current) {
      clearInterval(countdownInterval.current);
      countdownInterval.current = null;
    }
    setKalanSure(0);
  }, []);

  // Efekti sıfırla (gelir/xp çarpanlarını normale döndür)
  const efektSifirla = useCallback(
    (olay) => {
      switch (olay.etki) {
        case 'gelir_x2':
        case 'gelir_yarim':
          dispatch({ type: 'SET_INCOME_MULTIPLIER', payload: { carpan: 1 } });
          break;
        case 'gelir_durdur':
          dispatch({ type: 'SET_INCOME_PAUSED', payload: { durduruldu: false } });
          break;
        case 'xp_x2':
          dispatch({ type: 'SET_XP_MULTIPLIER', payload: { carpan: 1 } });
          break;
        default:
          break;
      }
    },
    [dispatch],
  );

  // Countdown başlat (süreli olaylar için)
  const countdownBaslat = useCallback((sure) => {
    setKalanSure(sure);
    countdownInterval.current = setInterval(() => {
      setKalanSure((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval.current);
          countdownInterval.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // Bir olayın efektini uygula
  const efektUygula = useCallback(
    (olay) => {
      switch (olay.etki) {
        case 'gelir_x2':
          dispatch({ type: 'SET_INCOME_MULTIPLIER', payload: { carpan: 2 } });
          countdownBaslat(olay.sure);
          // Süre bitince: efekti sıfırla + olayı otomatik kapat
          efektZamanlayici.current = setTimeout(() => {
            dispatch({ type: 'SET_INCOME_MULTIPLIER', payload: { carpan: 1 } });
            dispatch({ type: 'CLEAR_EVENT' });
            temizleZamanlayicilar();
          }, olay.sure * 1000);
          break;

        case 'gelir_yarim':
          dispatch({ type: 'SET_INCOME_MULTIPLIER', payload: { carpan: 0.5 } });
          countdownBaslat(olay.sure);
          efektZamanlayici.current = setTimeout(() => {
            dispatch({ type: 'SET_INCOME_MULTIPLIER', payload: { carpan: 1 } });
            dispatch({ type: 'CLEAR_EVENT' });
            temizleZamanlayicilar();
          }, olay.sure * 1000);
          break;

        case 'gelir_durdur':
          dispatch({ type: 'SET_INCOME_PAUSED', payload: { durduruldu: true } });
          countdownBaslat(olay.sure);
          efektZamanlayici.current = setTimeout(() => {
            dispatch({ type: 'SET_INCOME_PAUSED', payload: { durduruldu: false } });
            dispatch({ type: 'CLEAR_EVENT' });
            temizleZamanlayicilar();
          }, olay.sure * 1000);
          break;

        case 'xp_boost':
          dispatch({ type: 'BULK_ADD_XP', payload: { miktar: olay.miktar || 50 } });
          break;

        case 'xp_x2':
          dispatch({ type: 'SET_XP_MULTIPLIER', payload: { carpan: 2 } });
          countdownBaslat(olay.sure);
          efektZamanlayici.current = setTimeout(() => {
            dispatch({ type: 'SET_XP_MULTIPLIER', payload: { carpan: 1 } });
            dispatch({ type: 'CLEAR_EVENT' });
            temizleZamanlayicilar();
          }, olay.sure * 1000);
          break;

        case 'bonus_para':
          dispatch({ type: 'ADJUST_BUDGET', payload: { miktar: olay.miktar || 300 } });
          break;

        case 'para_kaybi':
          dispatch({ type: 'ADJUST_BUDGET', payload: { miktar: -(olay.miktar || 50) } });
          break;

        default:
          break;
      }
    },
    [dispatch, countdownBaslat, temizleZamanlayicilar],
  );

  // 60 saniyede bir rastgele olay tetikle
  useEffect(() => {
    const interval = setInterval(() => {
      // Halihazırda aktif olay varsa yeni olay tetikleme
      if (state.aktifOlay) return;

      const olay = rastgeleOlaySecimi();
      dispatch({ type: 'SET_EVENT', payload: { olay } });
      efektUygula(olay);
    }, OLAY_ARALIGI);

    return () => {
      clearInterval(interval);
    };
  }, [state.aktifOlay, dispatch, efektUygula]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      temizleZamanlayicilar();
    };
  }, [temizleZamanlayicilar]);

  // Olayı dismiss et — efekti de sıfırla (erken kapatma)
  const olayKapat = useCallback(() => {
    // Eğer süreli bir olay erken kapatılıyorsa, efekti hemen sıfırla
    if (state.aktifOlay) {
      efektSifirla(state.aktifOlay);
    }
    temizleZamanlayicilar();
    dispatch({ type: 'CLEAR_EVENT' });
  }, [dispatch, state.aktifOlay, efektSifirla, temizleZamanlayicilar]);

  return { olayKapat, kalanSure };
}
