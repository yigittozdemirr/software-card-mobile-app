// ═══════════════════════════════════════════════════════════════════════════════
// 📊 BÜTÇE EKRANI — Detaylı bütçe analitiği ve gelir breakdown
// ═══════════════════════════════════════════════════════════════════════════════

import React from 'react';
import { ScrollView, View, Text, StyleSheet, Platform } from 'react-native';
import { TEMA, getGelirHizi, formatPara, getSeviyeEmojisi, getSeviyeEtiketi } from '../constants';
import { useGame } from '../context/GameContext';
import BudgetChart from '../components/BudgetChart';

export default function BudgetScreen() {
  const { state } = useGame();
  const { budget, developers, toplamKazanilan, toplamHarcanan, gelirCarpani, gelirDurduruldu } = state;

  // Aktif çalışan geliştiriciler
  const aktifDevler = developers.filter((d) => d.durum === 'calisiyor');
  const toplamGelir = gelirDurduruldu
    ? 0
    : aktifDevler.reduce(
        (toplam, d) => toplam + Math.round(getGelirHizi(d) * gelirCarpani),
        0,
      );

  // Saatlik / günlük tahminler
  const saatlikGelir = toplamGelir * 3600;
  const gunlukGelir = toplamGelir * 86400;

  return (
    <View style={styles.konteyner}>
      <ScrollView
        contentContainerStyle={styles.scrollIcerik}
        showsVerticalScrollIndicator={false}
      >
        {/* Başlık */}
        <View style={styles.baslikAlani}>
          <Text style={styles.baslikEmoji}>📊</Text>
          <Text style={styles.baslik}>Bütçe Analizi</Text>
        </View>

        {/* Özet Kartları */}
        <View style={styles.ozetSatir}>
          <View style={[styles.ozetKart, styles.ozetYesil]}>
            <Text style={styles.ozetEtiket}>TOPLAM KAZANÇ</Text>
            <Text style={[styles.ozetDeger, { color: TEMA.renkler.yesil }]}>
              {formatPara(toplamKazanilan)}
            </Text>
          </View>
          <View style={[styles.ozetKart, styles.ozetKirmizi]}>
            <Text style={styles.ozetEtiket}>TOPLAM HARCAMA</Text>
            <Text style={[styles.ozetDeger, { color: TEMA.renkler.kirmizi }]}>
              {formatPara(toplamHarcanan || 0)}
            </Text>
          </View>
        </View>

        <View style={styles.ozetSatir}>
          <View style={[styles.ozetKart, styles.ozetMavi]}>
            <Text style={styles.ozetEtiket}>MEVCUT BÜTÇE</Text>
            <Text style={[styles.ozetDeger, { color: TEMA.renkler.mavi }]}>
              {formatPara(budget)}
            </Text>
          </View>
          <View style={[styles.ozetKart, styles.ozetMor]}>
            <Text style={styles.ozetEtiket}>GELİR HIZI</Text>
            <Text style={[styles.ozetDeger, { color: TEMA.renkler.mor }]}>
              ${toplamGelir}/sn
            </Text>
          </View>
        </View>

        {/* Gelir Çarpanı Durumu */}
        {(gelirCarpani !== 1 || gelirDurduruldu) && (
          <View style={styles.efektBanner}>
            <Text style={styles.efektMetin}>
              {gelirDurduruldu
                ? '💥 Gelir Durduruldu!'
                : gelirCarpani > 1
                ? `☕ Gelir Çarpanı: x${gelirCarpani}`
                : `😩 Gelir Çarpanı: x${gelirCarpani}`}
            </Text>
          </View>
        )}

        {/* Gelir Tahminleri */}
        <View style={styles.tahminKart}>
          <Text style={styles.sectionBaslik}>📈 Gelir Tahminleri</Text>
          <View style={styles.tahminSatir}>
            <Text style={styles.tahminEtiket}>Saniye başına:</Text>
            <Text style={styles.tahminDeger}>${toplamGelir}</Text>
          </View>
          <View style={styles.tahminSatir}>
            <Text style={styles.tahminEtiket}>Dakika başına:</Text>
            <Text style={styles.tahminDeger}>{formatPara(toplamGelir * 60)}</Text>
          </View>
          <View style={styles.tahminSatir}>
            <Text style={styles.tahminEtiket}>Saat başına:</Text>
            <Text style={styles.tahminDeger}>{formatPara(saatlikGelir)}</Text>
          </View>
        </View>

        {/* Geliştirici Gelir Breakdown */}
        <View style={styles.breakdownKart}>
          <Text style={styles.sectionBaslik}>💰 Geliştirici Gelir Dağılımı</Text>

          {aktifDevler.length === 0 ? (
            <Text style={styles.bosMetin}>
              Henüz çalışan geliştirici yok. Birini işe alıp çalıştırın!
            </Text>
          ) : (
            aktifDevler.map((dev) => {
              const devGelir = getGelirHizi(dev);
              const yuzde = toplamGelir > 0 ? Math.round((devGelir / toplamGelir) * 100) : 0;

              return (
                <View key={dev.id} style={styles.devSatir}>
                  <View style={styles.devBilgi}>
                    <Text style={styles.devEmoji}>{dev.emoji}</Text>
                    <View>
                      <Text style={styles.devAd}>{dev.ad}</Text>
                      <Text style={styles.devDetay}>
                        {getSeviyeEmojisi(dev.seviye)} Lv.{dev.seviye} {getSeviyeEtiketi(dev.seviye)}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.devGelirAlani}>
                    <Text style={styles.devGelir}>${devGelir}/sn</Text>
                    <Text style={styles.devYuzde}>{yuzde}%</Text>
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* Tüm Kadro Durumu */}
        <View style={styles.breakdownKart}>
          <Text style={styles.sectionBaslik}>👥 Tüm Kadro</Text>
          {developers.map((dev) => {
            const durum = dev.kpiLocked
              ? '🔒 Kilitli'
              : dev.durum === 'calisiyor'
              ? '🔵 Çalışıyor'
              : dev.durum === 'ispiyor'
              ? '🟡 Hazır'
              : '🟢 Müsait';

            return (
              <View key={dev.id} style={styles.kadroSatir}>
                <Text style={styles.devEmoji}>{dev.emoji}</Text>
                <View style={styles.kadroDetay}>
                  <Text style={[styles.devAd, dev.kpiLocked && { color: TEMA.renkler.ortaGri }]}>
                    {dev.ad} — {dev.unvan}
                  </Text>
                  <Text style={styles.devDetay}>
                    Lv.{dev.seviye} • ${getGelirHizi(dev)}/sn • {formatPara(dev.maliyetBase)} maliyet
                  </Text>
                </View>
                <Text style={styles.kadroMetin}>{durum}</Text>
              </View>
            );
          })}
        </View>

        {/* Bütçe Grafiği */}
        <BudgetChart />

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

  // Başlık
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

  // Özet kartları
  ozetSatir: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    maxWidth: 380,
    marginTop: 16,
  },
  ozetKart: {
    flex: 1,
    backgroundColor: TEMA.renkler.kartArkaPlan,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  ozetYesil: { borderColor: 'rgba(16, 185, 129, 0.15)' },
  ozetKirmizi: { borderColor: 'rgba(239, 68, 68, 0.15)' },
  ozetMavi: { borderColor: 'rgba(59, 130, 246, 0.15)' },
  ozetMor: { borderColor: 'rgba(139, 92, 246, 0.15)' },
  ozetEtiket: {
    fontSize: 9,
    fontWeight: '700',
    color: TEMA.renkler.ortaGri,
    letterSpacing: 1,
    marginBottom: 6,
  },
  ozetDeger: {
    fontSize: 20,
    fontWeight: '900',
    color: TEMA.renkler.beyaz,
  },

  // Efekt banner
  efektBanner: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  efektMetin: {
    fontSize: 14,
    fontWeight: '700',
    color: TEMA.renkler.altin,
  },

  // Tahmin kartı
  tahminKart: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: TEMA.renkler.kartArkaPlan,
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  sectionBaslik: {
    fontSize: 15,
    fontWeight: '700',
    color: TEMA.renkler.beyaz,
    marginBottom: 12,
  },
  tahminSatir: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  tahminEtiket: {
    fontSize: 13,
    color: TEMA.renkler.acikGri,
  },
  tahminDeger: {
    fontSize: 14,
    fontWeight: '700',
    color: TEMA.renkler.yesil,
  },

  // Breakdown kartı
  breakdownKart: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: TEMA.renkler.kartArkaPlan,
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  bosMetin: {
    fontSize: 13,
    color: TEMA.renkler.ortaGri,
    textAlign: 'center',
    paddingVertical: 12,
  },

  // Dev satırı
  devSatir: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  devBilgi: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  devEmoji: {
    fontSize: 20,
    marginRight: 10,
  },
  devAd: {
    fontSize: 14,
    fontWeight: '700',
    color: TEMA.renkler.beyaz,
  },
  devDetay: {
    fontSize: 11,
    color: TEMA.renkler.acikGri,
    marginTop: 1,
  },
  devGelirAlani: {
    alignItems: 'flex-end',
  },
  devGelir: {
    fontSize: 14,
    fontWeight: '800',
    color: TEMA.renkler.yesil,
  },
  devYuzde: {
    fontSize: 10,
    color: TEMA.renkler.ortaGri,
    marginTop: 2,
  },

  // Kadro satırı
  kadroSatir: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  kadroDetay: {
    flex: 1,
    marginRight: 8,
  },
  kadroMetin: {
    fontSize: 11,
    fontWeight: '600',
    color: TEMA.renkler.acikGri,
  },
});
