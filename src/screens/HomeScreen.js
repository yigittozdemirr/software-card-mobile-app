// ═══════════════════════════════════════════════════════════════════════════════
// 🏠 ANA EKRAN — Dashboard + Geliştirici Listesi + Proje Tahtası
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useEffect, useCallback } from 'react';
import { ScrollView, Text, View, StyleSheet, InteractionManager } from 'react-native';
import { TEMA, BASARIMLAR, rastgeleProjeSecimi, getDevGuc } from '../constants';
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

import { useState, useRef } from 'react';

export default function HomeScreen() {
  const { state, dispatch } = useGame();
  const { developers, achievements, projects, aktifOlay, budget } = state;

  // ── Hook'ları aktifleştir ──
  useAutoSave();
  const { olayKapat, kalanSure } = useRandomEvents();

  // ── Başarım Toast State ──
  const [aktifToast, setAktifToast] = useState(null);
  const [toastKuyrugu, setToastKuyrugu] = useState([]);

  // ── Proje sistemi: Zamanlayıcı (sadece ACTIVE projeler için) ──
  useEffect(() => {
    // Sadece ACTIVE projeler varsa timer çalıştır
    const aktifProjeler = projects.filter((p) => p.status === 'ACTIVE');
    if (aktifProjeler.length === 0) return;

    const interval = setInterval(() => {
      // Defer heavy state update until after pending animations complete
      InteractionManager.runAfterInteractions(() => {
        const takimGucu = developers
          .filter((d) => d.durum === 'calisiyor')
          .reduce((toplam, d) => toplam + getDevGuc(d), 0);
        dispatch({ type: 'TICK_PROJECTS', payload: { takimGucu } });
      });
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

  // ── Başarım Kontrol (deferred to avoid choking JS thread during animations) ──
  useEffect(() => {
    const handle = InteractionManager.runAfterInteractions(() => {
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
        console.warn('⚠️ Başarım kontrol hatası:', e);
      }
    });

    return () => handle.cancel();
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

      <ScrollView
        contentContainerStyle={styles.scrollIcerik}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Dashboard Header ── */}
        <DashboardHeader />

        {/* ── Geliştirici Kartları ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionEmoji}>👨‍💻</Text>
          <Text style={styles.sectionBaslik}>Geliştirici Kadrosu</Text>
          <Text style={styles.sectionAlt}>
            Lv.3'e ulaştığında bir sonraki geliştirici açılır
          </Text>
        </View>
        {developers.map((dev, index) => (
          <DeveloperCard key={dev.id} developer={dev} index={index} />
        ))}

        {/* ── Proje Tahtası ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionEmoji}>📋</Text>
          <Text style={styles.sectionBaslik}>Proje Tahtası</Text>
          <Text style={styles.sectionAlt}>Projeyi kabul edin, takım gücünüz yeterliyse tamamlayın</Text>
        </View>
        {projects.map((proje) => (
          <ProjectCard key={proje.id} proje={proje} />
        ))}

        {/* ── Bütçe Grafiği ── */}
        <BudgetChart />

        {/* ── Footer ── */}
        <Text style={styles.footer}>
          Geliştiricileri işe alın, eğitin ve şirketinizi büyütün! 🚀
        </Text>
      </ScrollView>
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
    paddingBottom: 100, // Tab bar boşluğu
    paddingHorizontal: 20,
  },

  // Section headers
  sectionHeader: {
    width: '100%',
    maxWidth: 380,
    marginTop: 16,
    marginBottom: 12,
  },
  sectionEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  sectionBaslik: {
    fontSize: 18,
    fontWeight: '800',
    color: TEMA.renkler.beyaz,
    letterSpacing: -0.3,
  },
  sectionAlt: {
    fontSize: 11,
    color: TEMA.renkler.acikGri,
    marginTop: 2,
  },

  // Footer
  footer: {
    fontSize: 12,
    color: TEMA.renkler.acikGri,
    marginTop: 16,
    opacity: 0.6,
    textAlign: 'center',
  },
});
