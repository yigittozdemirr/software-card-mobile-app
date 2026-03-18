// ═══════════════════════════════════════════════════════════════════════════════
// 🏆 BAŞARIMLAR EKRANI — Tüm başarımların detaylı listesi
// ═══════════════════════════════════════════════════════════════════════════════

import React from 'react';
import { ScrollView, View, Text, StyleSheet, Platform } from 'react-native';
import { TEMA, BASARIMLAR } from '../constants';
import { useGame } from '../context/GameContext';

export default function AchievementsScreen() {
  const { state } = useGame();
  const { achievements } = state;

  const acilanSayi = achievements.length;
  const toplamSayi = BASARIMLAR.length;
  const ilerlemeYuzde = Math.round((acilanSayi / toplamSayi) * 100);

  return (
    <View style={styles.konteyner}>
      <ScrollView
        contentContainerStyle={styles.scrollIcerik}
        showsVerticalScrollIndicator={false}
      >
        {/* Başlık */}
        <View style={styles.baslikAlani}>
          <Text style={styles.baslikEmoji}>🏆</Text>
          <Text style={styles.baslik}>Başarımlar</Text>
          <Text style={styles.altBaslik}>
            {acilanSayi}/{toplamSayi} başarım açıldı ({ilerlemeYuzde}%)
          </Text>
        </View>

        {/* İlerleme Çubuğu */}
        <View style={styles.ilerlemeCubugu}>
          <View style={styles.ilerlemeArkaPlan}>
            <View
              style={[
                styles.ilerlemeDolgu,
                { width: `${ilerlemeYuzde}%` },
              ]}
            />
          </View>
        </View>

        {/* Başarım Listesi */}
        {BASARIMLAR.map((basarim) => {
          const acildiMi = achievements.includes(basarim.id);

          return (
            <View
              key={basarim.id}
              style={[
                styles.basarimKart,
                acildiMi && styles.basarimKartAcik,
              ]}
            >
              {/* Sol: Emoji */}
              <View
                style={[
                  styles.emojiKutu,
                  acildiMi && styles.emojiKutuAcik,
                ]}
              >
                <Text style={styles.emoji}>
                  {acildiMi ? basarim.emoji : '🔒'}
                </Text>
              </View>

              {/* Orta: Başlık + Açıklama */}
              <View style={styles.metinAlani}>
                <Text
                  style={[
                    styles.basarimBaslik,
                    !acildiMi && styles.basarimKilitli,
                  ]}
                >
                  {acildiMi ? basarim.baslik : '???'}
                </Text>
                <Text
                  style={[
                    styles.basarimAciklama,
                    !acildiMi && styles.aciklamaKilitli,
                  ]}
                >
                  {acildiMi ? basarim.aciklama : 'Bu başarım henüz açılmadı'}
                </Text>
              </View>

              {/* Sağ: Durum badge */}
              <View
                style={[
                  styles.durumBadge,
                  acildiMi && styles.durumAcik,
                ]}
              >
                <Text style={[styles.durumMetin, acildiMi && styles.durumMetinAcik]}>
                  {acildiMi ? '✅' : '🔒'}
                </Text>
              </View>
            </View>
          );
        })}

        {/* Alt Boşluk */}
        <View style={{ height: 100 }} />
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
    paddingHorizontal: 20,
  },

  // Başlık alanı
  baslikAlani: {
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? 52 : 24,
    paddingBottom: 8,
  },
  baslikEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  baslik: {
    fontSize: 28,
    fontWeight: '900',
    color: TEMA.renkler.beyaz,
    letterSpacing: -0.5,
  },
  altBaslik: {
    fontSize: 14,
    color: TEMA.renkler.acikGri,
    marginTop: 6,
  },

  // İlerleme çubuğu
  ilerlemeCubugu: {
    width: '100%',
    maxWidth: 380,
    marginTop: 16,
    marginBottom: 24,
  },
  ilerlemeArkaPlan: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  ilerlemeDolgu: {
    height: '100%',
    backgroundColor: TEMA.renkler.altin,
    borderRadius: 4,
  },

  // Başarım kartı
  basarimKart: {
    width: '100%',
    maxWidth: 380,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: TEMA.renkler.kartArkaPlan,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
    opacity: 0.5,
  },
  basarimKartAcik: {
    opacity: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
    backgroundColor: 'rgba(245, 158, 11, 0.06)',
  },

  // Emoji kutusu
  emojiKutu: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.04)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  emojiKutuAcik: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
  },
  emoji: {
    fontSize: 22,
  },

  // Metin
  metinAlani: {
    flex: 1,
  },
  basarimBaslik: {
    fontSize: 15,
    fontWeight: '700',
    color: TEMA.renkler.beyaz,
    marginBottom: 3,
  },
  basarimKilitli: {
    color: TEMA.renkler.ortaGri,
  },
  basarimAciklama: {
    fontSize: 12,
    color: TEMA.renkler.acikGri,
    lineHeight: 16,
  },
  aciklamaKilitli: {
    color: TEMA.renkler.solukMetin,
  },

  // Durum badge
  durumBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  durumAcik: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
  },
  durumMetin: {
    fontSize: 16,
  },
  durumMetinAcik: {
    fontSize: 16,
  },
});
