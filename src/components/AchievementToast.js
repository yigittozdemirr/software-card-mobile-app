// ═══════════════════════════════════════════════════════════════════════════════
// 🏆 BAŞARIM TOAST — Phase 3: Fixed animation reset for consecutive toasts
// ═══════════════════════════════════════════════════════════════════════════════
//
// FIX: Animated values are now reset at the START of each new basarim,
// ensuring consecutive toast notifications render text correctly.
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, Dimensions } from 'react-native';
import { TEMA } from '../constants';

const { width: EKRAN_GENISLIK } = Dimensions.get('window');

export default function AchievementToast({ basarim, onBitti }) {
  const translateY = useRef(new Animated.Value(-120)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (!basarim) return;

    // ── FIX: Stop any running animations before resetting values ──
    // This prevents "driver-switching" crash on Android when
    // consecutive toasts fire while previous animation is still native-driven
    translateY.stopAnimation();
    opacity.stopAnimation();
    scale.stopAnimation();

    // Reset animated values for new toast
    translateY.setValue(-120);
    opacity.setValue(0);
    scale.setValue(0.8);

    // Giriş animasyonu: yukarıdan aşağı kayma + fadeIn + scale
    const girisAnim = Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        friction: 8,
        tension: 60,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 6,
        tension: 80,
        useNativeDriver: true,
      }),
    ]);
    girisAnim.start();

    // 3 saniye sonra çıkış animasyonu
    const zamanlayici = setTimeout(() => {
      const cikisAnim = Animated.parallel([
        Animated.timing(translateY, {
          toValue: -120,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]);
      cikisAnim.start(() => {
        // Animasyon bittikten sonra parent'a bildir
        if (onBitti) onBitti();
      });
    }, 3000);

    // Cleanup: stop all animations and clear timer on unmount/re-trigger
    return () => {
      clearTimeout(zamanlayici);
      translateY.stopAnimation();
      opacity.stopAnimation();
      scale.stopAnimation();
    };
  }, [basarim, translateY, opacity, scale, onBitti]);

  if (!basarim) return null;

  return (
    <Animated.View
      style={[
        styles.konteyner,
        {
          transform: [{ translateY }, { scale }],
          opacity,
        },
      ]}
    >
      {/* Altın çerçeve efekti */}
      <View style={styles.icKonteyner}>
        {/* Emoji */}
        <View style={styles.emojiKutu}>
          <Text style={styles.emoji}>{basarim.emoji}</Text>
        </View>

        {/* Metin */}
        <View style={styles.metinAlani}>
          <Text style={styles.basarimEtiket}>BAŞARIM KAZANILDI!</Text>
          <Text style={styles.basarimBaslik}>{basarim.baslik}</Text>
          <Text style={styles.basarimAciklama}>{basarim.aciklama}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  konteyner: {
    position: 'absolute',
    top: 50,
    alignSelf: 'center',
    width: EKRAN_GENISLIK - 40,
    zIndex: 1000,
  },
  icKonteyner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: TEMA.renkler.toastArkaPlan,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: TEMA.renkler.toastBorder,
    ...TEMA.golge,
  },
  emojiKutu: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  emoji: {
    fontSize: 24,
  },
  metinAlani: {
    flex: 1,
  },
  basarimEtiket: {
    fontSize: 9,
    fontWeight: '800',
    color: TEMA.renkler.altin,
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  basarimBaslik: {
    fontSize: 16,
    fontWeight: '700',
    color: TEMA.renkler.beyaz,
    marginBottom: 2,
  },
  basarimAciklama: {
    fontSize: 12,
    color: TEMA.renkler.acikGri,
  },
});
