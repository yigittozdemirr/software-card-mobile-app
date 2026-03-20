// ═══════════════════════════════════════════════════════════════════════════════
// 📋 PROJE KARTI — Phase 4: PENDING/ACTIVE lifecycle + Progress Bar
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { TEMA, getDevGuc, formatPara } from '../constants';
import { useGame } from '../context/GameContext';
import { haptikGeriBildirim } from '../hooks/useHaptics';

export default function ProjectCard({ proje }) {
  const { state, dispatch } = useGame();
  const { id, ad, emoji, gerekliGuc, odul, ceza, sure, kalanSure, status, progress } = proje;

  const isPending = status === 'PENDING';
  const isActive = status === 'ACTIVE';

  // ── Takım gücü hesaplama (yeni seviye sistemi) ──
  const takimGucu = state.developers
    .filter((d) => d.durum === 'calisiyor')
    .reduce((toplam, d) => toplam + getDevGuc(d), 0);

  const gucYeterli = takimGucu >= gerekliGuc;
  const sureYuzdesi = kalanSure / sure;
  const sureKritik = isActive && sureYuzdesi <= 0.25;
  const progressYuzdesi = Math.min(100, progress || 0);
  const tamamlanabilir = isActive && progressYuzdesi >= 100;

  // ── Zamanlayıcı animasyonu ──
  const timerAnim = useRef(new Animated.Value(isPending ? 1 : sureYuzdesi)).current;

  useEffect(() => {
    if (isPending) return;
    Animated.timing(timerAnim, {
      toValue: sureYuzdesi,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [sureYuzdesi, timerAnim, isPending]);

  const timerGenislik = timerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  // ── Progress bar animasyonu ──
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progressYuzdesi / 100,
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [progressYuzdesi, progressAnim]);

  const progressGenislik = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  // ── Kritik süre nabız efekti (sadece ACTIVE) ──
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (sureKritik && kalanSure > 0) {
      const nabiz = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.02, duration: 500, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        ]),
      );
      nabiz.start();
      return () => nabiz.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [sureKritik, kalanSure, pulseAnim]);

  // ── Projeyi kabul et (PENDING → ACTIVE) ──
  const handleKabulEt = () => {
    haptikGeriBildirim('orta');
    dispatch({ type: 'ACCEPT_PROJECT', payload: { projeId: id } });
  };

  // Süre formatı (dakika:saniye)
  const dakika = Math.floor(kalanSure / 60);
  const saniye = kalanSure % 60;
  const sureMetni = `${dakika}:${saniye.toString().padStart(2, '0')}`;

  // ── Timer rengi: aktif + yetersiz güç → KIRMIZI ──
  const timerRenk = isActive && !gucYeterli ? TEMA.renkler.kirmizi : (sureKritik ? TEMA.renkler.kirmizi : TEMA.renkler.cyan);

  return (
    <Animated.View style={[
      styles.kart,
      isPending && styles.kartPending,
      { transform: [{ scale: pulseAnim }] },
    ]}>
      {/* Durum etiketi */}
      <View style={[styles.durumBadge, isPending ? styles.durumPending : styles.durumActive]}>
        <Text style={styles.durumMetin}>
          {isPending ? '⏳ BEKLİYOR' : '🔄 AKTİF'}
        </Text>
      </View>

      {/* Üst bölüm: Proje adı + süre */}
      <View style={styles.ustSatir}>
        <View style={styles.baslikAlani}>
          <Text style={styles.emoji}>{emoji}</Text>
          <Text style={styles.projeAd} numberOfLines={1}>{ad}</Text>
        </View>
        {isActive ? (
          <View style={[styles.sureBadge, sureKritik && styles.sureBadgeKritik, !gucYeterli && styles.sureBadgeYetersiz]}>
            <Text style={[styles.sureMetin, { color: timerRenk }]}>
              ⏱ {sureMetni}
            </Text>
          </View>
        ) : (
          <View style={styles.sureBadge}>
            <Text style={[styles.sureMetin, { color: TEMA.renkler.ortaGri }]}>
              ⏱ {sureMetni}
            </Text>
          </View>
        )}
      </View>

      {/* Zamanlayıcı çubuğu (sadece ACTIVE) */}
      {isActive && (
        <View style={styles.timerArkaPlan}>
          <Animated.View
            style={[
              styles.timerDolgu,
              {
                width: timerGenislik,
                backgroundColor: timerRenk,
              },
            ]}
          />
        </View>
      )}

      {/* İlerleme çubuğu (sadece ACTIVE) */}
      {isActive && (
        <View style={styles.progressContainer}>
          <Text style={styles.progressEtiket}>
            İLERLEME {Math.round(progressYuzdesi)}%
          </Text>
          <View style={styles.progressArkaPlan}>
            <Animated.View
              style={[
                styles.progressDolgu,
                {
                  width: progressGenislik,
                  backgroundColor: gucYeterli ? TEMA.renkler.yesil : TEMA.renkler.kirmizi,
                },
              ]}
            />
          </View>
          {!gucYeterli && (
            <Text style={styles.progressUyari}>⚠ Yetersiz güç — ilerleme durdu</Text>
          )}
        </View>
      )}

      {/* Bilgi satırı: Güç + Ödül/Ceza */}
      <View style={styles.bilgiSatiri}>
        <View style={styles.bilgiItem}>
          <Text style={styles.bilgiEtiket}>GEREKEN GÜÇ</Text>
          <Text style={[styles.bilgiDeger, gucYeterli ? styles.gucYesil : styles.gucKirmizi]}>
            {takimGucu}/{gerekliGuc} ⚡
          </Text>
        </View>
        <View style={styles.bilgiItem}>
          <Text style={styles.bilgiEtiket}>ÖDÜL</Text>
          <Text style={[styles.bilgiDeger, { color: TEMA.renkler.yesil }]}>+{formatPara(odul)}</Text>
        </View>
        <View style={styles.bilgiItem}>
          <Text style={styles.bilgiEtiket}>CEZA</Text>
          <Text style={[styles.bilgiDeger, { color: TEMA.renkler.kirmizi }]}>-{formatPara(ceza)}</Text>
        </View>
      </View>

      {/* Aksiyon alanı */}
      {isPending ? (
        <TouchableOpacity
          style={styles.butonKabulEt}
          onPress={handleKabulEt}
          activeOpacity={0.8}
        >
          <Text style={styles.butonMetin}>PROJEYİ AL 📥</Text>
        </TouchableOpacity>
      ) : (
        <View style={[styles.buton, styles.butonDisabled]}>
          <Text style={styles.butonMetin}>
            OTOMATİK TAMAMLANIYOR... ⚙️
          </Text>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  kart: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: TEMA.renkler.projeKartArkaPlan,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.15)',
    ...TEMA.golgeHafif,
  },
  kartPending: {
    borderColor: 'rgba(148, 163, 184, 0.15)',
    opacity: 0.92,
  },

  durumBadge: {
    alignSelf: 'flex-start',
    borderRadius: 6,
    paddingVertical: 2,
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  durumPending: {
    backgroundColor: 'rgba(148, 163, 184, 0.15)',
  },
  durumActive: {
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
  },
  durumMetin: {
    fontSize: 10,
    fontWeight: '800',
    color: TEMA.renkler.acikGri,
    letterSpacing: 0.5,
  },

  ustSatir: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  baslikAlani: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  emoji: {
    fontSize: 22,
    marginRight: 10,
  },
  projeAd: {
    fontSize: 15,
    fontWeight: '700',
    color: TEMA.renkler.beyaz,
    flex: 1,
  },

  sureBadge: {
    backgroundColor: 'rgba(6, 182, 212, 0.12)',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginLeft: 8,
  },
  sureBadgeKritik: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  sureBadgeYetersiz: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  sureMetin: {
    fontSize: 13,
    fontWeight: '800',
    color: TEMA.renkler.cyan,
  },

  timerArkaPlan: {
    height: 5,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  timerDolgu: {
    height: '100%',
    borderRadius: 3,
  },

  // Progress bar
  progressContainer: {
    marginBottom: 12,
  },
  progressEtiket: {
    fontSize: 9,
    fontWeight: '700',
    color: TEMA.renkler.ortaGri,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  progressArkaPlan: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressDolgu: {
    height: '100%',
    borderRadius: 4,
  },
  progressUyari: {
    fontSize: 10,
    fontWeight: '600',
    color: TEMA.renkler.kirmizi,
    marginTop: 4,
    opacity: 0.8,
  },

  bilgiSatiri: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  bilgiItem: {
    alignItems: 'center',
    flex: 1,
  },
  bilgiEtiket: {
    fontSize: 9,
    fontWeight: '700',
    color: TEMA.renkler.ortaGri,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  bilgiDeger: {
    fontSize: 15,
    fontWeight: '800',
    color: TEMA.renkler.beyaz,
  },
  gucYesil: {
    color: TEMA.renkler.yesil,
  },
  gucKirmizi: {
    color: TEMA.renkler.kirmizi,
  },

  // Butonlar
  butonKabulEt: {
    backgroundColor: TEMA.renkler.cyan,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
  },
  buton: {
    backgroundColor: TEMA.renkler.yesil,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  butonDisabled: {
    backgroundColor: TEMA.renkler.ortaGri,
    opacity: 0.5,
  },
  butonMetin: {
    fontSize: 14,
    fontWeight: '700',
    color: TEMA.renkler.beyaz,
  },
});
