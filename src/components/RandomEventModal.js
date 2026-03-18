// ═══════════════════════════════════════════════════════════════════════════════
// 🎲 RASTGELE OLAY MODALI — Phase 3: Countdown + "Onar!" butonu
// ═══════════════════════════════════════════════════════════════════════════════
//
// Negatif süreli olaylar: canlı geri sayım + "🔧 Onar!" butonu
// Pozitif süreli olaylar: canlı geri sayım + "Harika!" butonu
// Anlık olaylar: normal dismiss butonu
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet, Dimensions } from 'react-native';
import { TEMA } from '../constants';
import { haptikGeriBildirim } from '../hooks/useHaptics';

const { height: EKRAN_YUKSEKLIK } = Dimensions.get('window');

export default function RandomEventModal({ olay, onKapat, kalanSure }) {
  const translateY = useRef(new Animated.Value(EKRAN_YUKSEKLIK)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    if (!olay) return;

    // FIX: Stop any running animations before resetting values
    translateY.stopAnimation();
    overlayOpacity.stopAnimation();
    cardScale.stopAnimation();

    // Reset animated values
    translateY.setValue(EKRAN_YUKSEKLIK);
    overlayOpacity.setValue(0);
    cardScale.setValue(0.85);

    // Haptic feedback
    haptikGeriBildirim(olay.tur === 'pozitif' ? 'hafif' : 'agir');

    // Giriş animasyonu
    const girisAnim = Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        friction: 8,
        tension: 50,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(cardScale, {
        toValue: 1,
        friction: 6,
        tension: 70,
        useNativeDriver: true,
      }),
    ]);
    girisAnim.start();

    // Cleanup: stop animations on unmount/re-trigger
    return () => {
      translateY.stopAnimation();
      overlayOpacity.stopAnimation();
      cardScale.stopAnimation();
    };
  }, [olay, translateY, overlayOpacity, cardScale]);

  const handleKapat = () => {
    // Çıkış animasyonu
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: EKRAN_YUKSEKLIK,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onKapat) onKapat();
    });
  };

  if (!olay) return null;

  const pozitifMi = olay.tur === 'pozitif';
  const vurguRenk = pozitifMi ? TEMA.renkler.yesil : TEMA.renkler.kirmizi;
  const sureliOlayMi = olay.sure > 0;
  const negatifSureliMi = !pozitifMi && sureliOlayMi;

  // Buton metni belirleme
  const butonMetni = negatifSureliMi
    ? '🔧 Onar!'
    : pozitifMi
    ? 'Harika! 🎉'
    : 'Anlaşıldı 💪';

  return (
    <View style={styles.konteyner}>
      {/* Overlay */}
      <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          onPress={handleKapat}
          activeOpacity={1}
        />
      </Animated.View>

      {/* Olay Kartı */}
      <Animated.View
        style={[
          styles.kart,
          {
            transform: [{ translateY }, { scale: cardScale }],
            borderColor: vurguRenk + '40',
          },
        ]}
      >
        {/* Üst etiket */}
        <View style={[styles.etiketBand, { backgroundColor: vurguRenk + '15' }]}>
          <Text style={[styles.etiketMetin, { color: vurguRenk }]}>
            {pozitifMi ? '✨ POZİTİF OLAY' : '⚠️ NEGATİF OLAY'}
          </Text>
        </View>

        {/* Emoji */}
        <View style={[styles.emojiKutu, { backgroundColor: vurguRenk + '15' }]}>
          <Text style={styles.emoji}>{olay.emoji}</Text>
        </View>

        {/* Başlık ve açıklama */}
        <Text style={styles.baslik}>{olay.baslik}</Text>
        <Text style={styles.aciklama}>{olay.aciklama}</Text>

        {/* Canlı Countdown (süreli olaylar için) */}
        {sureliOlayMi && kalanSure > 0 && (
          <View style={[styles.countdownKutu, { backgroundColor: vurguRenk + '12' }]}>
            <Text style={[styles.countdownSayi, { color: vurguRenk }]}>
              ⏱ {kalanSure}
            </Text>
            <Text style={[styles.countdownEtiket, { color: vurguRenk }]}>
              saniye kaldı
            </Text>
          </View>
        )}

        {/* Süre bilgisi (sadece süresi 0 olan anlık olaylar için eski badge) */}
        {sureliOlayMi && kalanSure === 0 && (
          <View style={[styles.sureBadge, { backgroundColor: vurguRenk + '12' }]}>
            <Text style={[styles.sureMetin, { color: vurguRenk }]}>
              ✅ Süre doldu — olay sona erdi
            </Text>
          </View>
        )}

        {/* Aksiyon butonu */}
        <TouchableOpacity
          style={[styles.buton, { backgroundColor: vurguRenk }]}
          onPress={handleKapat}
          activeOpacity={0.8}
        >
          <Text style={styles.butonMetin}>{butonMetni}</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  konteyner: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  kart: {
    width: '85%',
    maxWidth: 360,
    backgroundColor: TEMA.renkler.kartArkaPlan,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1.5,
    ...TEMA.golge,
  },

  etiketBand: {
    paddingVertical: 4,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginBottom: 16,
  },
  etiketMetin: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },

  emojiKutu: {
    width: 72,
    height: 72,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emoji: {
    fontSize: 36,
  },

  baslik: {
    fontSize: 20,
    fontWeight: '800',
    color: TEMA.renkler.beyaz,
    textAlign: 'center',
    marginBottom: 8,
  },
  aciklama: {
    fontSize: 14,
    color: TEMA.renkler.acikGri,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },

  // Canlı geri sayım
  countdownKutu: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 14,
    marginBottom: 16,
    gap: 6,
  },
  countdownSayi: {
    fontSize: 28,
    fontWeight: '900',
  },
  countdownEtiket: {
    fontSize: 13,
    fontWeight: '600',
  },

  sureBadge: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 16,
  },
  sureMetin: {
    fontSize: 13,
    fontWeight: '700',
  },

  buton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  butonMetin: {
    fontSize: 16,
    fontWeight: '700',
    color: TEMA.renkler.beyaz,
  },
});
