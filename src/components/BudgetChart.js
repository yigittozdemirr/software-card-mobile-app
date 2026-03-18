// ═══════════════════════════════════════════════════════════════════════════════
// 📈 BÜTÇE GRAFİĞİ — Son 10 bütçe değişimini gösteren bar chart
// ═══════════════════════════════════════════════════════════════════════════════
//
// react-native-svg kullanmadan, sadece Animated View'lar ile
// basit ama şık bir bar chart oluşturur.
// Yeşil barlar artışı, kırmızı barlar düşüşü gösterir.
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { TEMA } from '../constants';
import { useGame } from '../context/GameContext';

const BAR_YUKSEKLIK = 60; // Maksimum bar yüksekliği

function AnimatedBar({ deger, maxDeger, oncekiDeger, index }) {
  const yukseklik = useRef(new Animated.Value(0)).current;
  const normalizedHeight = maxDeger > 0 ? (deger / maxDeger) * BAR_YUKSEKLIK : 0;
  const arttiMi = oncekiDeger !== undefined ? deger > oncekiDeger : true;

  useEffect(() => {
    Animated.spring(yukseklik, {
      toValue: Math.max(4, normalizedHeight), // Minimum 4px görünürlük
      friction: 8,
      tension: 60,
      useNativeDriver: false,
    }).start();
  }, [normalizedHeight, yukseklik]);

  return (
    <View style={styles.barKonteyner}>
      <Animated.View
        style={[
          styles.bar,
          {
            height: yukseklik,
            backgroundColor: arttiMi ? TEMA.renkler.yesil : TEMA.renkler.kirmizi,
            opacity: 0.4 + (index / 10) * 0.6, // Son barlar daha opak
          },
        ]}
      />
    </View>
  );
}

export default function BudgetChart() {
  const { state } = useGame();
  const { budgetHistory } = state;

  if (!budgetHistory || budgetHistory.length < 2) return null;

  const maxDeger = Math.max(...budgetHistory, 1);
  const sonDeger = budgetHistory[budgetHistory.length - 1];
  const oncekiDeger = budgetHistory.length >= 2 ? budgetHistory[budgetHistory.length - 2] : sonDeger;
  const degisim = sonDeger - oncekiDeger;
  const degisimYuzde = oncekiDeger > 0 ? ((degisim / oncekiDeger) * 100).toFixed(1) : 0;

  return (
    <View style={styles.konteyner}>
      {/* Başlık */}
      <View style={styles.baslikSatir}>
        <Text style={styles.baslik}>📈 Bütçe Geçmişi</Text>
        <View
          style={[
            styles.degisimBadge,
            { backgroundColor: degisim >= 0 ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)' },
          ]}
        >
          <Text
            style={[
              styles.degisimMetin,
              { color: degisim >= 0 ? TEMA.renkler.yesil : TEMA.renkler.kirmizi },
            ]}
          >
            {degisim >= 0 ? '▲' : '▼'} {degisimYuzde}%
          </Text>
        </View>
      </View>

      {/* Bar Chart */}
      <View style={styles.chartAlani}>
        {budgetHistory.map((deger, i) => (
          <AnimatedBar
            key={`bar-${i}`}
            deger={deger}
            maxDeger={maxDeger}
            oncekiDeger={i > 0 ? budgetHistory[i - 1] : undefined}
            index={i}
          />
        ))}
      </View>

      {/* Alt etiketler */}
      <View style={styles.altSatir}>
        <Text style={styles.altEtiket}>Eski</Text>
        <Text style={styles.altEtiket}>
          Son: ${sonDeger.toLocaleString()}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  konteyner: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: TEMA.renkler.kartArkaPlan,
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },

  baslikSatir: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  baslik: {
    fontSize: 14,
    fontWeight: '700',
    color: TEMA.renkler.beyaz,
  },
  degisimBadge: {
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  degisimMetin: {
    fontSize: 12,
    fontWeight: '800',
  },

  chartAlani: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: BAR_YUKSEKLIK + 4,
    gap: 4,
  },
  barKonteyner: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: '100%',
    borderRadius: 4,
    minHeight: 4,
  },

  altSatir: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  altEtiket: {
    fontSize: 10,
    color: TEMA.renkler.ortaGri,
    fontWeight: '600',
  },
});
