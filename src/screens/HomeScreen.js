// ═══════════════════════════════════════════════════════════════════════════════
// 🏠 ANA EKRAN — Dashboard + Geliştirici Listesi + Proje Tahtası
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useEffect, useCallback, useMemo } from 'react';
import { ScrollView, Text, View, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { TEMA, BASARIMLAR, rastgeleProjeSecimi, getGelirHizi, YUKSELTMELER } from '../constants';
import { useGame } from '../context/GameContext';

// Bileşenler
import DashboardHeader from '../components/DashboardHeader';
import DeveloperCard from '../components/DeveloperCard';
import ProjectCard from '../components/ProjectCard';
import BudgetChart from '../components/BudgetChart';

// Hook'lar
import useAutoSave from '../hooks/useAutoSave';
import useRandomEvents from '../hooks/useRandomEvents';

// Overlay bileşenleri
import AchievementToast from '../components/AchievementToast';
import RandomEventModal from '../components/RandomEventModal';
import BugPopupOverlay from '../components/BugPopupOverlay';

import { useState, useRef } from 'react';
import { haptikGeriBildirim } from '../hooks/useHaptics';

// ── Tıklama Efekti Bileşeni ──
const ClickEffect = React.memo(({ effect, onRemove }) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start(() => onRemove(effect.id));
  }, []);

  return (
    <Animated.Text
      style={[
        styles.clickText,
        {
          left: effect.x - 15,
          top: effect.y - 30,
          opacity: anim.interpolate({ inputRange: [0, 0.8, 1], outputRange: [1, 1, 0] }),
          transform: [
            { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [0, -50] }) },
          ],
        },
      ]}
      pointerEvents="none"
    >
      +1
    </Animated.Text>
  );
});

export default function HomeScreen() {
  const { state, dispatch } = useGame();
  const { developers, achievements, projects, aktifOlay, budget } = state;

  // ── Hook'ları aktifleştir ──
  useAutoSave();
  const { olayKapat, kalanSure } = useRandomEvents();

  // ── Başarım Toast State ──
  const [aktifToast, setAktifToast] = useState(null);
  const [toastKuyrugu, setToastKuyrugu] = useState([]);

  // ── Clicker State ──
  const [clickEffects, setClickEffects] = useState([]);

  const handleScreenTap = useCallback((e) => {
    // Butonlar dışındaki boş alanlara tıklayınca
    const { pageX, pageY } = e.nativeEvent;
    const id = Date.now().toString() + Math.random().toString();
    setClickEffects((prev) => [...prev, { id, x: pageX, y: pageY }]);
    dispatch({ type: 'INCREMENT_BUDGET_CLICK' });
    haptikGeriBildirim('hafif');
  }, [dispatch]);

  const removeClickEffect = useCallback((id) => {
    setClickEffects((prev) => prev.filter((effect) => effect.id !== id));
  }, []);

  useEffect(() => {
    const aktifProjeler = projects.filter((p) => p.status === 'ACTIVE');
    if (aktifProjeler.length === 0) return;

    const interval = setInterval(() => {
      const takimGucu = developers
        .filter((d) => d.durum === 'calisiyor')
        .reduce((toplam, d) => toplam + (d.seviye || 1), 0);
      dispatch({ type: 'TICK_PROJECTS', payload: { takimGucu } });
    }, 1000);

    return () => clearInterval(interval);
  }, [projects, developers, dispatch]);

  // Süresi dolan ACTIVE projeleri tespit et ve cezalandır
  useEffect(() => {
    projects.forEach((proje) => {
      if (proje.status === 'ACTIVE' && proje.kalanSure <= 0) {
        dispatch({ type: 'FAIL_PROJECT', payload: { projeId: proje.id } });
      }
    });
  }, [projects, dispatch]);

  // Proje tahtasını başlat/tamamla
  useEffect(() => {
    if (projects.length === 0) {
      const yeniProjeler = rastgeleProjeSecimi(3, []);
      dispatch({ type: 'SET_PROJECTS', payload: { projects: yeniProjeler } });
    } else if (projects.length < 3) {
      const yeniProjeler = rastgeleProjeSecimi(3 - projects.length, projects);
      dispatch({
        type: 'SET_PROJECTS',
        payload: { projects: [...projects, ...yeniProjeler] },
      });
    }
  }, [projects.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Bütçe geçmişi snapshot ──
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch({ type: 'ADD_BUDGET_SNAPSHOT' });
    }, 5000);
    return () => clearInterval(interval);
  }, [dispatch]);

  useEffect(() => {
    try {
      const yeniBasarimlar = BASARIMLAR.filter(
        (b) => !achievements.includes(b.id) && b.kosul(state),
      );
      if (yeniBasarimlar.length > 0) {
        yeniBasarimlar.forEach((b) => {
          dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: { achievementId: b.id } });
        });
        setToastKuyrugu((prev) => [...prev, ...yeniBasarimlar]);
      }
    } catch (e) {
      console.warn('Basarim kontrol hatasi:', e);
    }
  }, [state, achievements, dispatch]);

  // ── Toast Kuyruğu ──
  useEffect(() => {
    if (!aktifToast && toastKuyrugu.length > 0) {
      setAktifToast(toastKuyrugu[0]);
      setToastKuyrugu((prev) => prev.slice(1));
    }
  }, [aktifToast, toastKuyrugu]);

  const handleToastBitti = useCallback(() => {
    setAktifToast(null);
  }, []);

  return (
    <View style={styles.konteyner}>
      {/* ── Başarım Toast Overlay ── */}
      <AchievementToast basarim={aktifToast} onBitti={handleToastBitti} />

      {/* ── Rastgele Olay Modal ── */}
      {aktifOlay && (
        <RandomEventModal olay={aktifOlay} onKapat={olayKapat} kalanSure={kalanSure} />
      )}

      {/* ── Yazılım Hatası (Bug) Popupları ── */}
      <BugPopupOverlay />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollIcerik}
        showsVerticalScrollIndicator={false}
        onStartShouldSetResponder={() => true}
        onResponderRelease={handleScreenTap}
      >
        <DashboardHeader />

        <TouchableOpacity
          style={styles.uretButon}
          onPress={() => {
            dispatch({ type: 'INCREMENT_BUDGET_CLICK' });
            haptikGeriBildirim('hafif');
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.uretEmoji}>💰</Text>
          <Text style={styles.uretMetin}>Üret +$1</Text>
        </TouchableOpacity>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionBaslik}>📋 Aktif Projeler</Text>
          <Text style={styles.sectionAlt} numberOfLines={1}>Takım gücünüzle otomatik tamamlanır</Text>
        </View>
        {projects.map((proje) => (
          <ProjectCard key={proje.id} proje={proje} />
        ))}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionBaslik}>👨‍💻 Geliştirici Kadrosu</Text>
          <Text style={styles.sectionAlt} numberOfLines={1}>Lv.3'e ulaştığında bir sonraki geliştirici açılır</Text>
        </View>
        {developers.map((dev, index) => (
          <DeveloperCard key={dev.id} developer={dev} index={index} />
        ))}

        <BudgetChart />

        <Text style={styles.footer}>Geliştiricileri işe alın, eğitin ve şirketinizi büyütün! 🚀</Text>
      </ScrollView>

      {/* Tıklama Efektleri Overlay */}
      {clickEffects.map((effect) => (
        <ClickEffect key={effect.id} effect={effect} onRemove={removeClickEffect} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  konteyner: {
    flex: 1,
    backgroundColor: TEMA.renkler.arkaPlan,
  },
  scrollIcerik: {
    flexGrow: 1,
    alignItems: 'center',
    paddingBottom: 100,
    paddingHorizontal: 16,
    maxWidth: 500,
    alignSelf: 'center',
    width: '100%',
  },
  uretButon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 2,
    borderColor: TEMA.renkler.yesil,
    borderRadius: 50,
    paddingVertical: 14,
    paddingHorizontal: 40,
    marginTop: 12,
    marginBottom: 4,
    gap: 10,
  },
  uretEmoji: {
    fontSize: 24,
  },
  uretMetin: {
    fontSize: 18,
    fontWeight: '900',
    color: TEMA.renkler.yesil,
    letterSpacing: 0.5,
  },
  sectionHeader: {
    width: '100%',
    maxWidth: 360,
    marginTop: 16,
    marginBottom: 8,
  },
  sectionBaslik: {
    fontSize: 17,
    fontWeight: '800',
    color: TEMA.renkler.beyaz,
  },
  sectionAlt: {
    fontSize: 11,
    color: TEMA.renkler.acikGri,
    marginTop: 2,
  },
  footer: {
    fontSize: 12,
    color: TEMA.renkler.acikGri,
    marginTop: 16,
    marginBottom: 20,
    opacity: 0.6,
    textAlign: 'center',
  },
  clickText: {
    position: 'absolute',
    fontSize: 24,
    fontWeight: '900',
    color: TEMA.renkler.yesil,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    zIndex: 1000,
    elevation: 1000,
  },
});
