// ═══════════════════════════════════════════════════════════════════════════════
// 📊 XP PROGRESS BAR — Animasyonlu seviye ilerleme çubuğu
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { TEMA, XP_ESIKLERI, getSeviyeRengi, getSeviyeEtiketi } from '../constants';

export default function XPBar({ seviye, xp }) {
  // XP eşiği (Advanced için Infinity → gösterimde 1 kullanılır)
  const esik = XP_ESIKLERI[seviye];
  const gercekEsik = esik === Infinity ? 1 : esik;
  const yuzde = esik === Infinity ? 1 : xp / gercekEsik;
  const renk = getSeviyeRengi(seviye);

  // Animasyonlu dolum efekti
  const animDeger = useRef(new Animated.Value(0)).current;
  const animRef = useRef(null);

  useEffect(() => {
    // Stop previous animation before starting a new one
    if (animRef.current) {
      animRef.current.stop();
    }
    const anim = Animated.timing(animDeger, {
      toValue: yuzde,
      duration: 400,
      useNativeDriver: false, // width animasyonu native driver desteklemez
    });
    animRef.current = anim;
    anim.start(() => { animRef.current = null; });

    // Cleanup on unmount
    return () => {
      if (animRef.current) {
        animRef.current.stop();
        animRef.current = null;
      }
    };
  }, [yuzde, animDeger]);

  // Animated width hesaplama
  const animliGenislik = animDeger.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.konteyner}>
      {/* Seviye etiketi ve XP değeri */}
      <View style={styles.ustSatir}>
        <Text style={[styles.seviyeEtiket, { color: renk }]}>
          {getSeviyeEtiketi(seviye)}
        </Text>
        <Text style={styles.xpMetin}>
          {esik === Infinity ? 'MAX' : `${xp}/${gercekEsik} XP`}
        </Text>
      </View>

      {/* Progress bar */}
      <View style={styles.barArkaPlan}>
        <Animated.View
          style={[
            styles.barDolgu,
            {
              width: animliGenislik,
              backgroundColor: renk,
            },
          ]}
        />
        {/* Parlama efekti */}
        <Animated.View
          style={[
            styles.barParlama,
            {
              width: animliGenislik,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  konteyner: {
    marginTop: 8,
  },
  ustSatir: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  seviyeEtiket: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  xpMetin: {
    fontSize: 11,
    fontWeight: '600',
    color: TEMA.renkler.acikGri,
  },
  barArkaPlan: {
    height: 8,
    backgroundColor: TEMA.renkler.xpBarArkaPlan,
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  barDolgu: {
    height: '100%',
    borderRadius: 4,
    position: 'absolute',
    left: 0,
    top: 0,
  },
  barParlama: {
    height: '50%',
    borderRadius: 4,
    position: 'absolute',
    left: 0,
    top: 0,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
});
