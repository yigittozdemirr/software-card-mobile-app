import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { TEMA, YUKSELTMELER, formatPara } from '../constants';
import { useGame } from '../context/GameContext';
import { haptikGeriBildirim } from '../hooks/useHaptics';

export default function UpgradesScreen() {
  const { state, dispatch } = useGame();
  const { budget, upgrades } = state;

  const ownedGlobalCarpan = upgrades.reduce((acc, id) => {
    const u = YUKSELTMELER.find((up) => up.id === id);
    if (u && u.target === 'global') return acc * u.carpan;
    return acc;
  }, 1);

  const getAciklama = (upg) => {
    if (upg.target === 'global') {
      return `Tüm çalışanların gelirini kalıcı olarak x${upg.carpan} artırır.`;
    }
    return `${upg.index + 1}. geliştirici slotunun gelirini kalıcı olarak x${upg.carpan} artırır.`;
  };

  const handleBuyUpgrade = (upgrade) => {
    if (budget < upgrade.baslangicMaliyeti || upgrades.includes(upgrade.id)) return;
    haptikGeriBildirim('orta');
    dispatch({ type: 'BUY_UPGRADE', payload: { upgrade } });
  };

  return (
    <SafeAreaView style={styles.konteyner}>
      <View style={styles.header}>
        <Text style={styles.baslik}>Yükseltmeler 🚀</Text>
        <Text style={styles.aciklama}>Çalışanların verimliliğini kalıcı olarak artırın.</Text>
        
        <View style={styles.statsKutu}>
          <View style={styles.statGrup}>
            <Text style={styles.statEtiket}>MEVCUT BÜTÇE</Text>
            <Text style={[styles.statDeger, { color: TEMA.renkler.yesil }]}>{formatPara(budget)}</Text>
          </View>
          <View style={styles.statGrup}>
            <Text style={styles.statEtiket}>GENEL ÇARPAN (GLOBAL)</Text>
            <Text style={[styles.statDeger, { color: TEMA.renkler.altin }]}>x{ownedGlobalCarpan.toFixed(2)}</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollIcerik} showsVerticalScrollIndicator={false}>
        {YUKSELTMELER.map((upg) => {
          const isOwned = upgrades.includes(upg.id);
          const canAfford = budget >= upg.baslangicMaliyeti;

          return (
            <View key={upg.id} style={[styles.kart, isOwned && styles.kartSatinAlindi]}>
              <View style={styles.kartUst}>
                <View style={[styles.emojiKutu, isOwned ? styles.emojiKutuOwned : null]}>
                  <Text style={styles.emoji}>{upg.emoji}</Text>
                </View>
                <View style={styles.bilgiKutu}>
                  <Text style={[styles.upgAd, isOwned && styles.upgAdOwned]}>{upg.ad}</Text>
                  <Text style={styles.upgAciklama}>{getAciklama(upg)}</Text>
                </View>
              </View>

              <View style={styles.kartAlt}>
                <View style={styles.carpanKutu}>
                  <Text style={styles.carpanEtiket}>ÇARPAN ETKİSİ</Text>
                  <Text style={styles.carpanDeger}>x{upg.carpan}</Text>
                </View>
                
                {isOwned ? (
                  <View style={[styles.buton, styles.butonOwned]}>
                    <Text style={styles.butonMetinOwned}>Sahipsiniz ✅</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[styles.buton, canAfford ? styles.butonAl : styles.butonDisabled]}
                    onPress={() => handleBuyUpgrade(upg)}
                    disabled={!canAfford}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.butonMetin}>
                      {canAfford ? `Satın Al (-${formatPara(upg.baslangicMaliyeti)})` : `Yetersiz (${formatPara(upg.baslangicMaliyeti)})`}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  konteyner: {
    flex: 1,
    backgroundColor: TEMA.renkler.arkaPlan,
  },
  header: {
    paddingTop: Platform.OS === 'android' ? 48 : 20,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    backgroundColor: TEMA.renkler.headerGradientStart,
  },
  baslik: {
    fontSize: 28,
    fontWeight: '900',
    color: TEMA.renkler.beyaz,
    marginBottom: 4,
  },
  aciklama: {
    fontSize: 14,
    color: TEMA.renkler.acikGri,
    marginBottom: 16,
  },
  statsKutu: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  statGrup: {
    flex: 1,
  },
  statEtiket: {
    fontSize: 10,
    fontWeight: '700',
    color: TEMA.renkler.ortaGri,
    letterSpacing: 1,
    marginBottom: 2,
  },
  statDeger: {
    fontSize: 18,
    fontWeight: '800',
  },
  scrollIcerik: {
    padding: 20,
    paddingBottom: 100, // Bottom nav bar clearance
    gap: 16,
  },
  kart: {
    backgroundColor: TEMA.renkler.kartArkaPlan,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    ...TEMA.golge,
  },
  kartSatinAlindi: {
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  kartUst: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'center',
  },
  emojiKutu: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  emojiKutuOwned: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  emoji: {
    fontSize: 24,
  },
  bilgiKutu: {
    flex: 1,
  },
  upgAd: {
    fontSize: 16,
    fontWeight: '700',
    color: TEMA.renkler.beyaz,
    marginBottom: 4,
  },
  upgAdOwned: {
    color: TEMA.renkler.yesil,
  },
  upgAciklama: {
    fontSize: 12,
    color: TEMA.renkler.acikGri,
    lineHeight: 18,
  },
  kartAlt: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingTop: 12,
  },
  carpanKutu: {
    paddingRight: 16,
  },
  carpanEtiket: {
    fontSize: 9,
    fontWeight: '700',
    color: TEMA.renkler.ortaGri,
    letterSpacing: 1,
    marginBottom: 2,
  },
  carpanDeger: {
    fontSize: 18,
    fontWeight: '900',
    color: TEMA.renkler.altin,
  },
  buton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    minWidth: 140,
  },
  butonAl: {
    backgroundColor: TEMA.renkler.mavi,
  },
  butonDisabled: {
    backgroundColor: TEMA.renkler.ortaGri,
    opacity: 0.5,
  },
  butonOwned: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  butonMetin: {
    fontSize: 13,
    fontWeight: '700',
    color: TEMA.renkler.beyaz,
  },
  butonMetinOwned: {
    fontSize: 13,
    fontWeight: '700',
    color: TEMA.renkler.yesil,
  },
});
