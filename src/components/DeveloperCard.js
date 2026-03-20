// ═══════════════════════════════════════════════════════════════════════════════
// 🪪 GELİŞTİRİCİ KARTI — Phase 3: Manual Training + Sequential Unlock
// ═══════════════════════════════════════════════════════════════════════════════
//
// Kart durumları:
//   1. kpiLocked → 🔒 Kilitli gösterim (unlock koşulu yazısı)
//   2. musait    → "İşe Al" butonu (per-dev maliyet)
//   3. ispiyor   → "Çalıştır" butonu
//   4. calisiyor → Gelir üretiyor + "Eğit" ve "Serbest Bırak" butonları
//
// Eğitim sistemi: para harcayarak seviye atlama, passive XP yok
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useRef, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import {
  TEMA,
  MAX_SEVIYE,
  getEgitimMaliyeti,
  getGelirHizi,
  getSeviyeEmojisi,
  getSeviyeEtiketi,
  getSeviyeRengi,
  getBasHarfler,
  formatPara,
} from '../constants';
import { useGame } from '../context/GameContext';
import { haptikGeriBildirim } from '../hooks/useHaptics';

export default function DeveloperCard({ developer, index }) {
  const { state, dispatch } = useGame();
  const { id, ad, unvan, uzmanlik, emoji, seviye, durum, maliyetBase, kpiLocked } = developer;

  // ── Animasyon referansları ──
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  // ── Çalışma animasyonu (nabız efekti) ──
  // NOTE: glowAnim uses useNativeDriver: false (borderColor is not natively animatable)
  // It MUST be on a separate Animated.View from scaleAnim (useNativeDriver: true)
  const nabizRef = useRef(null);

  useEffect(() => {
    // Always stop previous glow animation before starting/resetting
    if (nabizRef.current) {
      nabizRef.current.stop();
      nabizRef.current = null;
    }

    if (durum === 'calisiyor') {
      glowAnim.setValue(0);
      const nabiz = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: false,
          }),
        ]),
      );
      nabizRef.current = nabiz;
      nabiz.start();
      return () => {
        nabiz.stop();
        nabizRef.current = null;
      };
    } else {
      glowAnim.stopAnimation();
      glowAnim.setValue(0);
    }
  }, [durum, glowAnim]);

  // Interval referansı (cleanup için)
  const intervalRef = useRef(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  // ── Buton basım animasyonu ──
  const basimAnimRef = useRef(null);
  const animasyonluBasim = useCallback(
    (aksiyon) => {
      // Stop any running press animation before starting a new one
      if (basimAnimRef.current) {
        basimAnimRef.current.stop();
      }
      scaleAnim.setValue(1);
      const anim = Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.96,
          duration: 80,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 5,
          tension: 80,
          useNativeDriver: true,
        }),
      ]);
      basimAnimRef.current = anim;
      anim.start(() => { basimAnimRef.current = null; });
      aksiyon();
    },
    [scaleAnim],
  );

  // ── İşe Al (per-dev maliyet) ──
  const handleIseAl = useCallback(() => {
    haptikGeriBildirim('orta');
    animasyonluBasim(() => {
      dispatch({ type: 'HIRE', payload: { devId: id } });
    });
  }, [animasyonluBasim, dispatch, id]);

  // ── Çalıştır (sadece gelir, pasif XP yok) ──
  const handleCalistir = useCallback(() => {
    haptikGeriBildirim('hafif');
    animasyonluBasim(() => {
      const intervalId = setInterval(() => {
        dispatch({ type: 'ADD_INCOME', payload: { devId: id } });
      }, 1000);

      intervalRef.current = intervalId;
      dispatch({
        type: 'START_WORK',
        payload: { devId: id, intervalId },
      });
    });
  }, [animasyonluBasim, dispatch, id]);

  // ── Serbest Bırak ──
  const handleSerbestBirak = useCallback(() => {
    haptikGeriBildirim('agir');
    animasyonluBasim(() => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      dispatch({ type: 'STOP_WORK', payload: { devId: id } });
    });
  }, [animasyonluBasim, dispatch, id]);

  // ── Eğit (Manuel Level Up) ──
  const handleEgit = useCallback(() => {
    haptikGeriBildirim('orta');
    animasyonluBasim(() => {
      dispatch({ type: 'TRAIN_DEVELOPER', payload: { devId: id } });
    });
  }, [animasyonluBasim, dispatch, id]);

  // ── Türetilmiş değerler ──
  const avatarRenk = getSeviyeRengi(seviye);
  const mevcutGelir = getGelirHizi(developer);
  const butceYeterli = state.budget >= maliyetBase;
  const egitimMaliyeti = index !== undefined ? getEgitimMaliyeti(index, seviye) : 0;
  const egitimYapilabilir = state.budget >= egitimMaliyeti && seviye < MAX_SEVIYE;
  const maxSeviyeMi = seviye >= MAX_SEVIYE;

  // Çalışma durumunda kart kenar rengi
  const kartBorderColor = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(59, 130, 246, 0.1)', 'rgba(59, 130, 246, 0.4)'],
  });

  // ── Durum badge metni ve rengi ──
  const getDurumBilgi = () => {
    switch (durum) {
      case 'musait':
        return { metin: 'Müsait', renk: TEMA.renkler.musaitYesil, emoji: '🟢' };
      case 'ispiyor':
        return { metin: 'İşe Alındı', renk: TEMA.renkler.altin, emoji: '🟡' };
      case 'calisiyor':
        return { metin: 'Çalışıyor', renk: TEMA.renkler.calisiyorMavi, emoji: '🔵' };
      default:
        return { metin: 'Bilinmiyor', renk: TEMA.renkler.acikGri, emoji: '⚪' };
    }
  };
  const durumBilgi = getDurumBilgi();

  // ═══════════════════════════════════════════════════════════════════════════
  // 🔒 KİLİTLİ KART GÖRÜNÜMÜ
  // ═══════════════════════════════════════════════════════════════════════════
  if (kpiLocked) {
    return (
      <View style={[styles.kart, styles.kartKilitli]}>
        <View style={styles.kartUst}>
          <View style={[styles.avatar, { backgroundColor: TEMA.renkler.ortaGri }]}>
            <Text style={styles.avatarMetin}>🔒</Text>
          </View>
          <View style={styles.kartUstBilgi}>
            <Text style={styles.kartAdKilitli} numberOfLines={1} ellipsizeMode="tail">{emoji} {ad}</Text>
            <Text style={styles.unvanKilitli} numberOfLines={1} ellipsizeMode="tail">{unvan}</Text>
          </View>
        </View>
        <View style={styles.kilitBilgi}>
          <Text style={styles.kilitMetin} numberOfLines={2} ellipsizeMode="tail">🔓 Önceki geliştirici Lv.3'e ulaştığında açılır</Text>
          <Text style={styles.kilitMaliyet} numberOfLines={1} ellipsizeMode="tail">İşe Alma: {formatPara(maliyetBase)} • Gelir: +${mevcutGelir}/sn</Text>
        </View>
      </View>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 🪪 AKTİF KART GÖRÜNÜMÜ
  // FIX: scaleAnim (useNativeDriver: true) is on the OUTER Animated.View
  //      glowAnim / borderColor (useNativeDriver: false) is on the INNER Animated.View
  //      This prevents the Android "driver-switching" crash.
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <Animated.View
      style={[
        { transform: [{ scale: scaleAnim }] },
      ]}
    >
    <Animated.View
      style={[
        styles.kart,
        {
          borderColor: durum === 'calisiyor' ? kartBorderColor : 'rgba(255,255,255,0.06)',
        },
      ]}
    >
      <View style={styles.kartUst}>
        <View style={[styles.avatar, { backgroundColor: avatarRenk }]}>
          <Text style={styles.avatarMetin}>{emoji || getBasHarfler(ad)}</Text>
        </View>
        <View style={styles.kartUstBilgi}>
          <Text style={styles.kartAd} numberOfLines={1} ellipsizeMode="tail">{ad}</Text>
          <Text style={styles.unvanMetin} numberOfLines={1} ellipsizeMode="tail">{unvan}</Text>
          <View style={[styles.durumBadge, { backgroundColor: durumBilgi.renk + '18' }]}>
            <Text style={styles.durumEmoji}>{durumBilgi.emoji}</Text>
            <Text style={[styles.durumMetin, { color: durumBilgi.renk }]} numberOfLines={1}>
              {durumBilgi.metin}
            </Text>
          </View>
        </View>
        {durum === 'calisiyor' && (
          <View style={styles.gelirBadge}>
            <Text style={styles.gelirMetin} numberOfLines={1}>+${mevcutGelir}/sn</Text>
          </View>
        )}
      </View>

      <View style={styles.bilgiAlani}>
        <View style={styles.bilgiSatiri}>
          <Text style={styles.bilgiEmoji}>💻</Text>
          <View style={styles.bilgiMetinKutu}>
            <Text style={styles.bilgiEtiket}>UZMANLIK</Text>
            <Text style={styles.bilgiDeger} numberOfLines={1} ellipsizeMode="tail">{uzmanlik}</Text>
          </View>
        </View>
        <View style={styles.bilgiSatiri}>
          <Text style={styles.bilgiEmoji}>{getSeviyeEmojisi(seviye)}</Text>
          <View style={styles.bilgiMetinKutu}>
            <Text style={styles.bilgiEtiket}>SEVİYE</Text>
            <Text style={styles.bilgiDeger} numberOfLines={1} ellipsizeMode="tail">
              Lv.{seviye} {getSeviyeEtiketi(seviye)} — ${mevcutGelir}/sn
            </Text>
          </View>
        </View>
      </View>

      {/* ── Seviye İlerleme Çubuğu ── */}
      <View style={styles.seviyeBar}>
        {Array.from({ length: MAX_SEVIYE }).map((_, i) => (
          <View
            key={`lv-${i}`}
            style={[
              styles.seviyeDot,
              i < seviye && { backgroundColor: avatarRenk },
              i >= seviye && { backgroundColor: 'rgba(255,255,255,0.08)' },
            ]}
          />
        ))}
        <Text style={styles.seviyeBarMetin}>
          {maxSeviyeMi ? '⭐ MAX' : `${seviye}/${MAX_SEVIYE}`}
        </Text>
      </View>

      {/* ── Ayırıcı ── */}
      <View style={styles.ayirici} />

      {/* ── Aksiyon Butonları ── */}
      <View style={styles.butonAlani}>
        {durum === 'musait' && (
          <TouchableOpacity
            style={[
              styles.buton,
              styles.butonIseAl,
              !butceYeterli && maliyetBase > 0 && styles.butonDisabled,
            ]}
            onPress={handleIseAl}
            activeOpacity={0.8}
            disabled={!butceYeterli && maliyetBase > 0}
          >
            <Text style={styles.butonMetin} numberOfLines={1} ellipsizeMode="tail">
              {maliyetBase === 0
                ? 'İşe Al 🤝 (Bedava!)'
                : butceYeterli
                ? `İşe Al 🤝 (-${formatPara(maliyetBase)})`
                : `Yetersiz Bütçe 💸 (${formatPara(maliyetBase)})`}
            </Text>
          </TouchableOpacity>
        )}

        {durum === 'ispiyor' && (
          <TouchableOpacity
            style={[styles.buton, styles.butonCalistir]}
            onPress={handleCalistir}
            activeOpacity={0.8}
          >
            <Text style={styles.butonMetin}>Çalıştır 🚀</Text>
          </TouchableOpacity>
        )}

        {durum === 'calisiyor' && (
          <>
            {/* Eğit Butonu */}
            {!maxSeviyeMi && (
              <TouchableOpacity
                style={[
                  styles.buton,
                  styles.butonEgit,
                  !egitimYapilabilir && styles.butonDisabled,
                ]}
                onPress={handleEgit}
                activeOpacity={0.8}
                disabled={!egitimYapilabilir}
              >
                <Text style={styles.butonMetin}>
                  🎓 Eğit → Lv.{seviye + 1} ({formatPara(egitimMaliyeti)})
                </Text>
              </TouchableOpacity>
            )}

            {maxSeviyeMi && (
              <View style={[styles.buton, styles.butonMaxLevel]}>
                <Text style={styles.butonMetin}>⭐ Maksimum Seviye!</Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.buton, styles.butonSerbest]}
              onPress={handleSerbestBirak}
              activeOpacity={0.8}
            >
              <Text style={styles.butonMetin}>Serbest Bırak ✋</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  kart: {
    width: '100%',
    maxWidth: 360,
    alignSelf: 'center',
    backgroundColor: TEMA.renkler.kartArkaPlan,
    borderRadius: 20,
    marginBottom: 16,
    padding: 16,
    borderWidth: 1.5,
    ...TEMA.golge,
  },
  kartKilitli: {
    backgroundColor: TEMA.renkler.kilitArkaPlan,
    borderColor: 'rgba(255,255,255,0.03)',
    opacity: 0.6,
    minHeight: 140,
  },

  // Avatar & üst bölüm
  kartUst: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarMetin: {
    fontSize: 18,
    fontWeight: '800',
    color: TEMA.renkler.beyaz,
    letterSpacing: 1,
  },
  kartUstBilgi: {
    marginLeft: 12,
    flex: 1,
  },
  kartAd: {
    fontSize: 18,
    fontWeight: '700',
    color: TEMA.renkler.beyaz,
    marginBottom: 2,
    lineHeight: 24,
  },
  kartAdKilitli: {
    fontSize: 16,
    fontWeight: '700',
    color: TEMA.renkler.ortaGri,
    marginBottom: 2,
    lineHeight: 22,
  },
  unvanMetin: {
    fontSize: 11,
    fontWeight: '600',
    color: TEMA.renkler.altin,
    marginBottom: 4,
  },
  unvanKilitli: {
    fontSize: 11,
    fontWeight: '600',
    color: TEMA.renkler.ortaGri,
  },

  // Durum badge
  durumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
    flexShrink: 1,
  },
  durumEmoji: {
    fontSize: 8,
    marginRight: 5,
  },
  durumMetin: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // Gelir badge
  gelirBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderRadius: 10,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  gelirMetin: {
    fontSize: 13,
    fontWeight: '800',
    color: TEMA.renkler.yesil,
  },

  // Bilgi satırları
  bilgiAlani: {
    marginBottom: 4,
    gap: 8,
  },
  bilgiSatiri: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bilgiMetinKutu: {
    flex: 1,
    paddingRight: 10,
  },
  bilgiEmoji: {
    fontSize: 18,
    width: 30,
    textAlign: 'center',
  },
  bilgiEtiket: {
    fontSize: 9,
    fontWeight: '700',
    color: TEMA.renkler.ortaGri,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  bilgiDeger: {
    fontSize: 14,
    fontWeight: '600',
    color: TEMA.renkler.koyuMetin,
    marginTop: 1,
  },

  // Seviye ilerleme çubuğu
  seviyeBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 4,
    gap: 4,
  },
  seviyeDot: {
    flex: 1,
    height: 6,
    borderRadius: 3,
  },
  seviyeBarMetin: {
    fontSize: 10,
    fontWeight: '700',
    color: TEMA.renkler.acikGri,
    marginLeft: 8,
  },

  // Kilitli bilgi
  kilitBilgi: {
    paddingHorizontal: 8,
    paddingBottom: 4,
  },
  kilitMetin: {
    fontSize: 12,
    color: TEMA.renkler.ortaGri,
    marginBottom: 4,
  },
  kilitMaliyet: {
    fontSize: 11,
    color: TEMA.renkler.solukMetin,
  },

  // Ayırıcı
  ayirici: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginVertical: 10,
  },

  // Butonlar
  butonAlani: {
    gap: 8,
    marginHorizontal: 4,
  },
  buton: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  butonIseAl: {
    backgroundColor: TEMA.renkler.mavi,
  },
  butonCalistir: {
    backgroundColor: TEMA.renkler.yesil,
  },
  butonSerbest: {
    backgroundColor: TEMA.renkler.turuncu,
  },
  butonEgit: {
    backgroundColor: TEMA.renkler.mor,
  },
  butonMaxLevel: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: TEMA.renkler.altin + '30',
  },
  butonDisabled: {
    backgroundColor: TEMA.renkler.ortaGri,
    opacity: 0.5,
  },
  butonMetin: {
    fontSize: 14,
    fontWeight: '700',
    color: TEMA.renkler.beyaz,
    letterSpacing: 0.3,
  },
});
