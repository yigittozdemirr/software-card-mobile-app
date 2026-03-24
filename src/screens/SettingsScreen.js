// ═══════════════════════════════════════════════════════════════════════════════
// ⚙️ AYARLAR EKRANI — Settings Screen
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Switch,
  Platform,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TEMA } from '../constants';
import { useGame } from '../context/GameContext';
import { oyunSil } from '../hooks/useAutoSave';

const AYARLAR_ANAHTARI = '@ITManager_Settings_v1';

// Varsayılan ayarlar
const VARSAYILAN_AYARLAR = {
  titresimAcik: true,
  otomatikKayit: true,
  bildirimlerAcik: true,
  sesEfektleri: true,
};

export default function SettingsScreen({ navigation }) {
  const { dispatch } = useGame();
  const [ayarlar, setAyarlar] = useState(VARSAYILAN_AYARLAR);

  // Ayarları yükle
  useEffect(() => {
    (async () => {
      try {
        const json = await AsyncStorage.getItem(AYARLAR_ANAHTARI);
        if (json) {
          setAyarlar((prev) => ({ ...prev, ...JSON.parse(json) }));
        }
      } catch (e) {
        console.warn('Ayar yükleme hatası:', e);
      }
    })();
  }, []);

  // Ayar güncelle & persist et
  const ayarGuncelle = useCallback(async (key, value) => {
    setAyarlar((prev) => {
      const yeni = { ...prev, [key]: value };
      AsyncStorage.setItem(AYARLAR_ANAHTARI, JSON.stringify(yeni)).catch(console.warn);
      return yeni;
    });
  }, []);

  // ── İlerlemeyi Sil ──
  const ilerlemeySil = useCallback(() => {
    Alert.alert(
      '⚠️ İlerlemeyi Sil',
      'Tüm oyun kaydınız silinecek ve oyun en baştan başlayacak.\n\nBu işlem geri alınamaz!\n\nDevam etmek istiyor musunuz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Evet, Sil',
          style: 'destructive',
          onPress: async () => {
            await oyunSil();
            dispatch({ type: 'RESET_GAME' });
            navigation.goBack();
          },
        },
      ],
      { cancelable: true },
    );
  }, [dispatch, navigation]);

  return (
    <View style={styles.konteyner}>
      <StatusBar barStyle="light-content" backgroundColor={TEMA.renkler.arkaPlan} />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.geriButon}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.geriEmoji}>←</Text>
        </TouchableOpacity>
        <Text style={styles.baslik}>⚙️ Ayarlar</Text>
        <View style={styles.geriButon} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollIcerik}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Genel Ayarlar ── */}
        <Text style={styles.bolumBaslik}>🎮 GENEL</Text>
        <View style={styles.ayarKart}>
          <AyarlaSatir
            emoji="📳"
            baslik="Titreşim"
            aciklama="Dokunmatik geri bildirim"
            deger={ayarlar.titresimAcik}
            onChange={(v) => ayarGuncelle('titresimAcik', v)}
          />
          <View style={styles.ayirici} />
          <AyarlaSatir
            emoji="💾"
            baslik="Otomatik Kayıt"
            aciklama="Her 10 saniyede bir kaydet"
            deger={ayarlar.otomatikKayit}
            onChange={(v) => ayarGuncelle('otomatikKayit', v)}
          />
          <View style={styles.ayirici} />
          <AyarlaSatir
            emoji="🔔"
            baslik="Bildirimler"
            aciklama="Olay ve başarım bildirimleri"
            deger={ayarlar.bildirimlerAcik}
            onChange={(v) => ayarGuncelle('bildirimlerAcik', v)}
          />
          <View style={styles.ayirici} />
          <AyarlaSatir
            emoji="🔊"
            baslik="Ses Efektleri"
            aciklama="Oyun içi sesler"
            deger={ayarlar.sesEfektleri}
            onChange={(v) => ayarGuncelle('sesEfektleri', v)}
          />
        </View>

        {/* ── Veri Yönetimi ── */}
        <Text style={styles.bolumBaslik}>🗃️ VERİ YÖNETİMİ</Text>
        <View style={styles.ayarKart}>
          <TouchableOpacity
            style={styles.tehlikeliButon}
            onPress={ilerlemeySil}
            activeOpacity={0.7}
          >
            <View style={styles.tehlikeliButonIcerik}>
              <Text style={styles.tehlikeliEmoji}>🗑️</Text>
              <View style={styles.tehlikeliMetinKutu}>
                <Text style={styles.tehlikeliBaslik}>İlerlemeyi Sil</Text>
                <Text style={styles.tehlikeliAciklama}>
                  Tüm verileri sıfırla ve baştan başla
                </Text>
              </View>
            </View>
            <Text style={styles.tehlikeliOk}>›</Text>
          </TouchableOpacity>
        </View>

        {/* ── Hakkında ── */}
        <Text style={styles.bolumBaslik}>ℹ️ HAKKINDA</Text>
        <View style={styles.ayarKart}>
          <HakkindaSatir etiket="Oyun" deger="IT Manager: Startup Tycoon" />
          <View style={styles.ayirici} />
          <HakkindaSatir etiket="Sürüm" deger="3.1.0" />
          <View style={styles.ayirici} />
          <HakkindaSatir etiket="Motor" deger="React Native" />
          <View style={styles.ayirici} />
          <HakkindaSatir etiket="Platform" deger={Platform.OS === 'ios' ? 'iOS' : Platform.OS === 'android' ? 'Android' : 'Web'} />
        </View>

        <Text style={styles.altMetin}>
          IT Manager: Startup Tycoon © 2026{'\n'}
          Tüm hakları saklıdır.
        </Text>
      </ScrollView>
    </View>
  );
}

// ── Alt Bileşenler ──────────────────────────────────────────────────────────

function AyarlaSatir({ emoji, baslik, aciklama, deger, onChange }) {
  return (
    <View style={styles.ayarSatir}>
      <View style={styles.ayarSolKutu}>
        <Text style={styles.ayarEmoji}>{emoji}</Text>
        <View style={styles.ayarMetinKutu}>
          <Text style={styles.ayarBaslik}>{baslik}</Text>
          <Text style={styles.ayarAciklama}>{aciklama}</Text>
        </View>
      </View>
      <Switch
        value={deger}
        onValueChange={onChange}
        trackColor={{ false: '#334155', true: 'rgba(16, 185, 129, 0.4)' }}
        thumbColor={deger ? TEMA.renkler.yesil : '#64748B'}
        ios_backgroundColor="#334155"
      />
    </View>
  );
}

function HakkindaSatir({ etiket, deger }) {
  return (
    <View style={styles.hakkindaSatir}>
      <Text style={styles.hakkindaEtiket}>{etiket}</Text>
      <Text style={styles.hakkindaDeger}>{deger}</Text>
    </View>
  );
}

// ── Stiller ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  konteyner: {
    flex: 1,
    backgroundColor: TEMA.renkler.arkaPlan,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'android' ? 48 : 20,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: TEMA.renkler.kartArkaPlan,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  geriButon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  geriEmoji: {
    fontSize: 22,
    color: TEMA.renkler.beyaz,
  },
  baslik: {
    fontSize: 20,
    fontWeight: '800',
    color: TEMA.renkler.beyaz,
    letterSpacing: -0.3,
  },
  scroll: {
    flex: 1,
  },
  scrollIcerik: {
    padding: 16,
    paddingBottom: 40,
  },

  // Bölüm başlığı
  bolumBaslik: {
    fontSize: 11,
    fontWeight: '800',
    color: TEMA.renkler.ortaGri,
    letterSpacing: 1.5,
    marginTop: 20,
    marginBottom: 10,
    marginLeft: 4,
  },

  // Ayar kartı
  ayarKart: {
    backgroundColor: TEMA.renkler.kartArkaPlan,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
  },

  // Toggle satırı
  ayarSatir: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  ayarSolKutu: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  ayarEmoji: {
    fontSize: 22,
    marginRight: 14,
  },
  ayarMetinKutu: {
    flex: 1,
  },
  ayarBaslik: {
    fontSize: 15,
    fontWeight: '700',
    color: TEMA.renkler.beyaz,
  },
  ayarAciklama: {
    fontSize: 12,
    color: TEMA.renkler.acikGri,
    marginTop: 2,
  },

  // Ayırıcı çizgi
  ayirici: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    marginLeft: 52,
  },

  // Tehlikeli buton (İlerlemeyi Sil)
  tehlikeliButon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  tehlikeliButonIcerik: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  tehlikeliEmoji: {
    fontSize: 22,
    marginRight: 14,
  },
  tehlikeliMetinKutu: {
    flex: 1,
  },
  tehlikeliBaslik: {
    fontSize: 15,
    fontWeight: '700',
    color: TEMA.renkler.kirmizi,
  },
  tehlikeliAciklama: {
    fontSize: 12,
    color: 'rgba(239, 68, 68, 0.7)',
    marginTop: 2,
  },
  tehlikeliOk: {
    fontSize: 24,
    fontWeight: '300',
    color: TEMA.renkler.kirmizi,
    opacity: 0.6,
  },

  // Hakkında satırı
  hakkindaSatir: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  hakkindaEtiket: {
    fontSize: 14,
    fontWeight: '600',
    color: TEMA.renkler.acikGri,
  },
  hakkindaDeger: {
    fontSize: 14,
    fontWeight: '700',
    color: TEMA.renkler.beyaz,
  },

  // Alt metin
  altMetin: {
    textAlign: 'center',
    fontSize: 12,
    color: TEMA.renkler.ortaGri,
    marginTop: 30,
    lineHeight: 20,
    opacity: 0.7,
  },
});
