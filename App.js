import React, { useState, useRef, useCallback } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  StatusBar,
  ScrollView,
  Animated,
  Platform,
} from 'react-native';

// ═══════════════════════════════════════════════════════════════════════════════
// 🎨 TEMA & SABİTLER — Tek merkezden yönetilen tasarım tokenleri
// ═══════════════════════════════════════════════════════════════════════════════

const TEMA = {
  renkler: {
    arkaPlan: '#0F172A',
    kartArkaPlanMusait: '#F0FDF4',
    kartArkaPlanMesgul: '#FFF7ED',
    baslikBandi: '#1E293B',
    musaitYesil: '#22C55E',
    mesgulTuruncu: '#F97316',
    butonMusait: '#3B82F6',
    butonMesgul: '#94A3B8',
    serbestYesil: '#16A34A',
    beyaz: '#FFFFFF',
    acikGri: '#94A3B8',
    koyuMetin: '#1E293B',
    ortaMetin: '#475569',
    avatarBeginner: '#3B82F6',
    avatarIntermediate: '#8B5CF6',
    avatarAdvanced: '#F59E0B',
  },
  golge: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.12,
      shadowRadius: 20,
    },
    android: { elevation: 10 },
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.12,
      shadowRadius: 20,
    },
  }),
};

// ═══════════════════════════════════════════════════════════════════════════════
// 🛠️ YARDIMCI FONKSİYONLAR — Saf fonksiyonlar, yan etkisiz
// ═══════════════════════════════════════════════════════════════════════════════

/** Seviye string'inden rozet emojisi döndürür */
const getSeviyeEmojisi = (seviye) => {
  const harita = { Beginner: '🌱', Intermediate: '⚡', Advanced: '🚀' };
  return harita[seviye] ?? '📌';
};

/** Seviye string'inden Türkçe karşılık döndürür */
const getSeviyeEtiketi = (seviye) => {
  const harita = { Beginner: 'Başlangıç', Intermediate: 'Orta', Advanced: 'İleri' };
  return harita[seviye] ?? seviye;
};

/** Seviye string'inden avatar arka plan rengi döndürür */
const getAvatarRengi = (seviye) => {
  const harita = {
    Beginner: TEMA.renkler.avatarBeginner,
    Intermediate: TEMA.renkler.avatarIntermediate,
    Advanced: TEMA.renkler.avatarAdvanced,
  };
  return harita[seviye] ?? TEMA.renkler.avatarBeginner;
};

/** Ad string'inden baş harfleri çıkarır (max 2) */
const getBasHarfler = (ad) =>
  ad
    .split(' ')
    .map((kelime) => kelime[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

/** Müsaitlik durumuna göre tüm dinamik renkleri hesaplar */
const getDurumRenkleri = (musaitMi) => ({
  kartArkaPlan: musaitMi
    ? TEMA.renkler.kartArkaPlanMusait
    : TEMA.renkler.kartArkaPlanMesgul,
  durumRenk: musaitMi ? TEMA.renkler.musaitYesil : TEMA.renkler.mesgulTuruncu,
  butonRenk: musaitMi ? TEMA.renkler.butonMusait : TEMA.renkler.butonMesgul,
});

// ═══════════════════════════════════════════════════════════════════════════════
// 🧩 ALT BİLEŞENLER — Tek sorumluluk prensibine uygun küçük bileşenler
// ═══════════════════════════════════════════════════════════════════════════════

/** Kişinin baş harflerini gösteren dairesel avatar */
function Avatar({ ad, seviye }) {
  return (
    <View style={[styles.avatar, { backgroundColor: getAvatarRengi(seviye) }]}>
      <Text style={styles.avatarMetin}>{getBasHarfler(ad)}</Text>
    </View>
  );
}

/** Tek bilgi satırı: emoji + etiket + değer */
function BilgiSatiri({ emoji, etiket, deger }) {
  return (
    <View style={styles.bilgiSatiri}>
      <Text style={styles.bilgiEmoji}>{emoji}</Text>
      <View>
        <Text style={styles.bilgiEtiket}>{etiket}</Text>
        <Text style={styles.bilgiDeger}>{deger}</Text>
      </View>
    </View>
  );
}

/** Müsaitlik durumunu gösteren yuvarlak badge */
function DurumBadge({ musaitMi, renk }) {
  return (
    <View style={[styles.durumBadge, { backgroundColor: renk + '18' }]}>
      <View style={[styles.durumNokta, { backgroundColor: renk }]} />
      <Text style={[styles.durumMetin, { color: renk }]}>
        {musaitMi ? 'Müsait' : 'Projelerde Çalışıyor'}
      </Text>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🪪 ANA KART BİLEŞENİ — Her kart kendi state'ini yönetir
// ═══════════════════════════════════════════════════════════════════════════════

function YazilimciKarti({ ad, uzmanlik, seviye }) {
  // ── State & Refs ──
  const [musaitMi, setMusaitMi] = useState(true);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // ── Türetilmiş Değerler ──
  const renkler = getDurumRenkleri(musaitMi);
  const seviyeEmojisi = getSeviyeEmojisi(seviye);
  const seviyeEtiketi = getSeviyeEtiketi(seviye);

  // ── Event Handler'lar ──
  const animasyonluBasim = useCallback(
    (yeniDurum) => {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.96,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
      setMusaitMi(yeniDurum);
    },
    [scaleAnim],
  );

  const handleIseAl = useCallback(
    () => animasyonluBasim(false),
    [animasyonluBasim],
  );

  const handleSerbestBirak = useCallback(
    () => animasyonluBasim(true),
    [animasyonluBasim],
  );

  // ── Render ──
  return (
    <Animated.View
      style={[
        styles.kart,
        { backgroundColor: renkler.kartArkaPlan, transform: [{ scale: scaleAnim }] },
      ]}
    >
      {/* ── Üst Bölüm: Avatar + İsim + Durum ── */}
      <View style={styles.kartUst}>
        <Avatar ad={ad} seviye={seviye} />
        <View style={styles.kartUstBilgi}>
          <Text style={styles.kartAd}>{ad}</Text>
          <DurumBadge musaitMi={musaitMi} renk={renkler.durumRenk} />
        </View>
      </View>

      {/* ── Ayırıcı Çizgi ── */}
      <View style={styles.ayirici} />

      {/* ── Bilgi Satırları ── */}
      <View style={styles.bilgiAlani}>
        <BilgiSatiri emoji="💻" etiket="Uzmanlık" deger={uzmanlik} />
        <BilgiSatiri
          emoji={seviyeEmojisi}
          etiket="Seviye"
          deger={seviyeEtiketi}
        />
      </View>

      {/* ── Aksiyon Butonları ── */}
      <View style={styles.butonAlani}>
        {musaitMi ? (
          <TouchableOpacity
            style={[styles.buton, { backgroundColor: renkler.butonRenk }]}
            onPress={handleIseAl}
            activeOpacity={0.8}
          >
            <Text style={styles.butonMetin}>İşe Al 🤝</Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity
              style={[styles.buton, styles.butonMesgul]}
              disabled
              activeOpacity={1}
            >
              <Text style={styles.butonMetin}>Projelerde Çalışıyor 🔴</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.buton, styles.serbestButon]}
              onPress={handleSerbestBirak}
              activeOpacity={0.8}
            >
              <Text style={styles.butonMetin}>Serbest Bırak ✅</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </Animated.View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 📱 ANA UYGULAMA — Sayfa düzeni & veri kaynağı
// ═══════════════════════════════════════════════════════════════════════════════

const YAZILIMCILAR = [
  { ad: 'Yiğit Kaan', uzmanlik: 'React Native', seviye: 'Beginner' },
  { ad: 'Ali Veli', uzmanlik: 'Python', seviye: 'Advanced' },
  { ad: 'Furkan Can', uzmanlik: 'Java', seviye: 'Intermediate' },
];

export default function App() {
  return (
    <SafeAreaView style={styles.guvenliAlan}>
      <StatusBar barStyle="light-content" backgroundColor={TEMA.renkler.arkaPlan} />

      <ScrollView
        contentContainerStyle={styles.scrollIcerik}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <Text style={styles.headerEmoji}>👨‍💻</Text>
          <Text style={styles.sayfaBaslik}>Yazılımcı Kadrosu</Text>
          <Text style={styles.altBaslik}>
            {YAZILIMCILAR.length} ekip üyesinin anlık durumları
          </Text>
        </View>

        {/* ── Kartlar ── */}
        {YAZILIMCILAR.map((yazilimci) => (
          <YazilimciKarti
            key={yazilimci.ad}
            ad={yazilimci.ad}
            uzmanlik={yazilimci.uzmanlik}
            seviye={yazilimci.seviye}
          />
        ))}

        {/* ── Footer ── */}
        <Text style={styles.footer}>
          Kartlara dokunarak durumlarını değiştirin
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🎨 STİLLER — StyleSheet.create ile optimize edilmiş
// ═══════════════════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  // ── Sayfa Düzeni ──────────────────────
  guvenliAlan: {
    flex: 1,
    backgroundColor: TEMA.renkler.arkaPlan,
  },
  scrollIcerik: {
    flexGrow: 1,
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? 48 : 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },

  // ── Header ────────────────────────────
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  headerEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  sayfaBaslik: {
    fontSize: 30,
    fontWeight: '800',
    color: TEMA.renkler.beyaz,
    letterSpacing: -0.5,
  },
  altBaslik: {
    fontSize: 14,
    color: TEMA.renkler.acikGri,
    marginTop: 6,
  },

  // ── Kart Konteyneri ───────────────────
  kart: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 24,
    marginBottom: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
    ...TEMA.golge,
  },

  // ── Kart Üst: Avatar + İsim ──────────
  kartUst: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarMetin: {
    fontSize: 20,
    fontWeight: '800',
    color: TEMA.renkler.beyaz,
    letterSpacing: 1,
  },
  kartUstBilgi: {
    marginLeft: 14,
    flex: 1,
  },
  kartAd: {
    fontSize: 20,
    fontWeight: '700',
    color: TEMA.renkler.koyuMetin,
    marginBottom: 6,
  },

  // ── Ayırıcı ──────────────────────────
  ayirici: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.06)',
    marginBottom: 16,
  },

  // ── Bilgi Satırları ──────────────────
  bilgiAlani: {
    marginBottom: 16,
    gap: 12,
  },
  bilgiSatiri: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bilgiEmoji: {
    fontSize: 20,
    width: 32,
    textAlign: 'center',
  },
  bilgiEtiket: {
    fontSize: 11,
    fontWeight: '600',
    color: TEMA.renkler.acikGri,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  bilgiDeger: {
    fontSize: 16,
    fontWeight: '600',
    color: TEMA.renkler.koyuMetin,
    marginTop: 1,
  },

  // ── Durum Badge ──────────────────────
  durumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  durumNokta: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  durumMetin: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // ── Butonlar ─────────────────────────
  butonAlani: {
    gap: 10,
  },
  buton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  butonMesgul: {
    backgroundColor: TEMA.renkler.butonMesgul,
    opacity: 0.7,
  },
  serbestButon: {
    backgroundColor: TEMA.renkler.serbestYesil,
  },
  butonMetin: {
    fontSize: 16,
    fontWeight: '700',
    color: TEMA.renkler.beyaz,
    letterSpacing: 0.3,
  },

  // ── Footer ───────────────────────────
  footer: {
    fontSize: 12,
    color: TEMA.renkler.acikGri,
    marginTop: 12,
    opacity: 0.6,
  },
});