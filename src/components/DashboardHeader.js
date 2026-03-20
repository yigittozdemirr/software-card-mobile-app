// ═══════════════════════════════════════════════════════════════════════════════
// 📊 DASHBOARD HEADER — Phase 3: Dynamic company title + new economy
// ═══════════════════════════════════════════════════════════════════════════════
//
// Garajdaki Girişim → Startup → Scaleup → Unicorn → Mega Corp
// Dinamik $/sn hesaplama: getGelirHizi per developer
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, Platform } from 'react-native';
import { TEMA, getGelirHizi, getSirketSeviyesi, formatPara, YUKSELTMELER } from '../constants';
import { useGame } from '../context/GameContext';

export default function DashboardHeader() {
  const { state } = useGame();
  const { budget, developers, gelirCarpani, gelirDurduruldu, bugsCount, tamamlananProjeler, upgrades } = state;

  // ── Bütçe bounce animasyonu ──
  const budgetScale = useRef(new Animated.Value(1)).current;
  const prevBudget = useRef(budget);
  const bounceAnimRef = useRef(null);

  useEffect(() => {
    if (budget !== prevBudget.current) {
      prevBudget.current = budget;

      // Stop any running bounce before starting a new one
      if (bounceAnimRef.current) {
        bounceAnimRef.current.stop();
      }
      budgetScale.setValue(1);

      const anim = Animated.sequence([
        Animated.timing(budgetScale, {
          toValue: 1.12,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.spring(budgetScale, {
          toValue: 1,
          friction: 4,
          tension: 100,
          useNativeDriver: true,
        }),
      ]);
      bounceAnimRef.current = anim;
      anim.start(() => { bounceAnimRef.current = null; });
    }
  }, [budget, budgetScale]);

  const aktifCalisan = developers.filter((d) => d.durum === 'calisiyor').length;
  const toplamGelir = (gelirDurduruldu || bugsCount > 0)
    ? 0
    : developers
        .filter((d) => d.durum === 'calisiyor')
        .reduce((toplam, d, _, arr) => {
          const devIndex = developers.indexOf(d);
          let gCarpan = 1;
          let oCarpan = 1;
          (upgrades || []).forEach((uid) => {
            const u = YUKSELTMELER.find((x) => x.id === uid);
            if (!u) return;
            if (u.target === 'global') gCarpan *= u.carpan;
            else if (u.target === 'devIndex' && u.index === devIndex) oCarpan *= u.carpan;
          });
          return toplam + Math.round(getGelirHizi(d) * gCarpan * oCarpan * gelirCarpani);
        }, 0);
  const acilanDev = developers.filter((d) => !d.kpiLocked).length;

  // ── Şirket seviyesi (dinamik tema) ──
  const sirketSeviyesi = getSirketSeviyesi(budget);

  // Aktif efekt göstergesi
  const efektAktif = gelirCarpani !== 1 || gelirDurduruldu;
  const efektMetni = gelirDurduruldu
    ? '💥 Gelir Durduruldu!'
    : gelirCarpani > 1
    ? `☕ Gelir x${gelirCarpani}`
    : gelirCarpani < 1
    ? `😩 Gelir x${gelirCarpani}`
    : '';

  return (
    <View style={[styles.konteyner, { backgroundColor: sirketSeviyesi.arkaPlan }]}>
      {/* Başlık — dinamik şirket adı */}
      <Text style={styles.baslik}>{sirketSeviyesi.baslik || '🏠 Garajdaki Girişim'}</Text>
      <View style={styles.sirketSeviyeBadge}>
        <Text style={styles.sirketSeviyeMetin}>
          {sirketSeviyesi.emoji} {sirketSeviyesi.ad}
        </Text>
      </View>

      {/* Bütçe gösterimi */}
      <View style={styles.butceKutu}>
        <Text style={styles.butceEtiket}>ŞİRKET BÜTÇESİ</Text>
        <Animated.Text
          style={[styles.butceDeger, { transform: [{ scale: budgetScale }] }]}
        >
          {formatPara(budget)}
        </Animated.Text>
        {/* Aktif efekt göstergesi */}
        {efektAktif && (
          <View style={styles.efektBadge}>
            <Text style={styles.efektMetin}>{efektMetni}</Text>
          </View>
        )}
      </View>

      {/* İstatistik kartları */}
      <View style={styles.istatistikSatiri}>
        <View style={styles.istatistikKart}>
          <Text style={styles.istatistikEmoji}>👥</Text>
          <Text style={styles.istatistikDeger}>{acilanDev}/{developers.length}</Text>
          <Text style={styles.istatistikEtiket}>Kadro</Text>
        </View>

        <View style={[styles.istatistikKart, styles.istatistikKartVurgu]}>
          <Text style={styles.istatistikEmoji}>💰</Text>
          <Text style={[styles.istatistikDeger, { color: TEMA.renkler.yesil }]}>
            +${toplamGelir}/sn
          </Text>
          <Text style={styles.istatistikEtiket}>Gelir</Text>
        </View>

        <View style={styles.istatistikKart}>
          <Text style={styles.istatistikEmoji}>⚡</Text>
          <Text style={styles.istatistikDeger}>{aktifCalisan}</Text>
          <Text style={styles.istatistikEtiket}>Aktif</Text>
        </View>

        <View style={styles.istatistikKart}>
          <Text style={styles.istatistikEmoji}>📋</Text>
          <Text style={styles.istatistikDeger}>{tamamlananProjeler}</Text>
          <Text style={styles.istatistikEtiket}>Proje</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  konteyner: {
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? 48 : 20,
    paddingBottom: 24,
    paddingHorizontal: 20,
    width: '100%',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 8,
  },
  baslik: {
    fontSize: 24,
    fontWeight: '900',
    color: TEMA.renkler.beyaz,
    letterSpacing: -0.5,
  },
  sirketSeviyeBadge: {
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
    paddingVertical: 4,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginTop: 6,
    marginBottom: 16,
  },
  sirketSeviyeMetin: {
    fontSize: 12,
    fontWeight: '700',
    color: TEMA.renkler.mor,
    letterSpacing: 0.5,
  },

  // Bütçe kutusu
  butceKutu: {
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 32,
    marginBottom: 16,
    width: '100%',
    maxWidth: 380,
  },
  butceEtiket: {
    fontSize: 10,
    fontWeight: '800',
    color: TEMA.renkler.yesil,
    letterSpacing: 2,
    marginBottom: 4,
  },
  butceDeger: {
    fontSize: 38,
    fontWeight: '900',
    color: TEMA.renkler.beyaz,
    letterSpacing: -1,
  },
  efektBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingVertical: 3,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 6,
  },
  efektMetin: {
    fontSize: 11,
    fontWeight: '700',
    color: TEMA.renkler.altin,
  },

  // İstatistik kartları
  istatistikSatiri: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
    maxWidth: 380,
  },
  istatistikKart: {
    flex: 1,
    backgroundColor: TEMA.renkler.kartArkaPlan,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  istatistikKartVurgu: {
    borderColor: 'rgba(16, 185, 129, 0.15)',
    backgroundColor: 'rgba(16, 185, 129, 0.06)',
  },
  istatistikEmoji: {
    fontSize: 16,
    marginBottom: 3,
  },
  istatistikDeger: {
    fontSize: 16,
    fontWeight: '800',
    color: TEMA.renkler.beyaz,
  },
  istatistikEtiket: {
    fontSize: 9,
    fontWeight: '600',
    color: TEMA.renkler.acikGri,
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
