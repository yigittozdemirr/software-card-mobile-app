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

import React, { useRef, useCallback, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import {
  TEMA,
  MAX_SEVIYE,
  YUKSELTMELER,
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

  // ── Yükseltme çarpanlarını hesapla ──
  const gercekGelir = useMemo(() => {
    const baseGelir = getGelirHizi(developer);
    let globalCarpan = 1;
    let ozelCarpan = 1;

    (state.upgrades || []).forEach((upgradeId) => {
      const upg = YUKSELTMELER.find((u) => u.id === upgradeId);
      if (upg) {
        if (upg.target === 'global') {
          globalCarpan *= upg.carpan;
        } else if (upg.target === 'devIndex' && upg.index === index) {
          ozelCarpan *= upg.carpan;
        }
      }
    });

    return Math.round(baseGelir * globalCarpan * ozelCarpan);
  }, [developer, index, state.upgrades]);

  // ── Animasyon referansları ──
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  // ── Çalışma animasyonu (nabız efekti) ──
  const nabizRef = useRef(null);

  useEffect(() => {
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

  // ── İşe Al ──
  const handleIseAl = useCallback(() => {
    haptikGeriBildirim('orta');
    animasyonluBasim(() => {
      dispatch({ type: 'HIRE', payload: { devId: id } });
    });
  }, [animasyonluBasim, dispatch, id]);

  // ── Çalıştır ──
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

  // ── Eğit ──
  const handleEgit = useCallback(() => {
    haptikGeriBildirim('orta');
    animasyonluBasim(() => {
      dispatch({ type: 'TRAIN_DEVELOPER', payload: { devId: id } });
    });
  }, [animasyonluBasim, dispatch, id]);

  // ── Türetilmiş değerler ──
  const avatarRenk = getSeviyeRengi(seviye);
  const baseGelir = getGelirHizi(developer);
  const butceYeterli = state.budget >= maliyetBase;
  const egitimMaliyeti = index !== undefined ? getEgitimMaliyeti(index, seviye) : 0;
  const egitimYapilabilir = state.budget >= egitimMaliyeti && seviye < MAX_SEVIYE;
  const maxSeviyeMi = seviye >= MAX_SEVIYE;
  const yukseltmeVar = gercekGelir > baseGelir;

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
            <Text style={styles.kartAdKilitli}>{emoji} {ad}</Text>
            <Text style={styles.unvanKilitli}>{unvan}</Text>
          </View>
        </View>
        <View style={styles.kilitBilgi}>
          <Text style={styles.kilitMetin}>🔓 Önceki geliştirici Lv.3'e ulaştığında açılır</Text>
          <Text style={styles.kilitMaliyet}>İşe Alma: {formatPara(maliyetBase)} • Gelir: +${baseGelir}/sn</Text>
        </View>
      </View>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 🪪 AKTİF KART GÖRÜNÜMÜ — Tam Genişlik Dikey Layout
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <Animated.View
      style={[
        { transform: [{ scale: scaleAnim }] },
        styles.kartDis,
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
      {/* ── Üst Bölüm: Avatar + İsim + Durum ── */}
      <View style={styles.kartUst}>
        <View style={[styles.avatar, { backgroundColor: avatarRenk }]}>
          <Text style={styles.avatarMetin}>{emoji || getBasHarfler(ad)}</Text>
        </View>
        <View style={styles.kartUstBilgi}>
          <Text style={styles.kartAd}>{ad}</Text>
          <Text style={styles.unvanMetin}>{unvan}</Text>
        </View>
        <View style={styles.kartUstSag}>
          <View style={[styles.durumBadge, { backgroundColor: durumBilgi.renk + '18' }]}>
            <Text style={styles.durumEmoji}>{durumBilgi.emoji}</Text>
            <Text style={[styles.durumMetin, { color: durumBilgi.renk }]}>
              {durumBilgi.metin}
            </Text>
          </View>
          {durum === 'calisiyor' && (
            <View style={styles.gelirBadge}>
              <Text style={styles.gelirMetin}>+${gercekGelir}/sn</Text>
            </View>
          )}
        </View>
      </View>

      {/* ── Bilgi Satırları: Uzmanlık + Seviye + Gelir ── */}
      <View style={styles.bilgiAlani}>
        <View style={styles.bilgiSatiri}>
          <Text style={styles.bilgiEmoji}>💻</Text>
          <Text style={styles.bilgiEtiket}>Uzmanlık</Text>
          <Text style={styles.bilgiDeger}>{uzmanlik}</Text>
        </View>
        <View style={styles.bilgiSatiri}>
          <Text style={styles.bilgiEmoji}>{getSeviyeEmojisi(seviye)}</Text>
          <Text style={styles.bilgiEtiket}>Seviye</Text>
          <Text style={styles.bilgiDeger}>Lv.{seviye} {getSeviyeEtiketi(seviye)}</Text>
        </View>
        <View style={styles.bilgiSatiri}>
          <Text style={styles.bilgiEmoji}>💰</Text>
          <Text style={styles.bilgiEtiket}>Gelir</Text>
          <View style={styles.gelirSatirDeger}>
            <Text style={[styles.bilgiDeger, { color: TEMA.renkler.yesil }]}>
              ${gercekGelir}/sn
            </Text>
            {yukseltmeVar && (
              <Text style={styles.gelirBoost}>
                (baz: ${baseGelir})
              </Text>
            )}
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
            <Text style={styles.butonMetin}>
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
  kartDis: {
    width: '100%',
    alignSelf: 'center',
  },
  kart: {
    width: '100%',
    alignSelf: 'center',
    backgroundColor: TEMA.renkler.kartArkaPlan,
    borderRadius: 20,
    marginBottom: 16,
    padding: 18,
    borderWidth: 1.5,
    ...TEMA.golge,
  },
  kartKilitli: {
    backgroundColor: TEMA.renkler.kilitArkaPlan,
    borderColor: 'rgba(255,255,255,0.03)',
    opacity: 0.6,
  },

  // Avatar & üst bölüm
  kartUst: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
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
    marginLeft: 14,
    flex: 1,
  },
  kartAd: {
    fontSize: 20,
    fontWeight: '800',
    color: TEMA.renkler.beyaz,
    lineHeight: 26,
  },
  kartAdKilitli: {
    fontSize: 16,
    fontWeight: '700',
    color: TEMA.renkler.ortaGri,
    lineHeight: 22,
  },
  unvanMetin: {
    fontSize: 13,
    fontWeight: '600',
    color: TEMA.renkler.altin,
    marginTop: 2,
  },
  unvanKilitli: {
    fontSize: 12,
    fontWeight: '600',
    color: TEMA.renkler.ortaGri,
    marginTop: 2,
  },
  kartUstSag: {
    alignItems: 'flex-end',
    gap: 6,
    marginLeft: 8,
  },

  // Durum badge
  durumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 10,
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

  // Bilgi satırları — yatay düzen
  bilgiAlani: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 14,
    padding: 12,
    gap: 10,
    marginBottom: 4,
  },
  bilgiSatiri: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bilgiEmoji: {
    fontSize: 16,
    width: 28,
    textAlign: 'center',
  },
  bilgiEtiket: {
    fontSize: 11,
    fontWeight: '700',
    color: TEMA.renkler.ortaGri,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    width: 72,
    marginLeft: 4,
  },
  bilgiDeger: {
    fontSize: 15,
    fontWeight: '700',
    color: TEMA.renkler.koyuMetin,
    flex: 1,
  },
  gelirSatirDeger: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  gelirBoost: {
    fontSize: 11,
    fontWeight: '600',
    color: TEMA.renkler.ortaGri,
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
    fontSize: 13,
    color: TEMA.renkler.ortaGri,
    marginBottom: 6,
    lineHeight: 20,
  },
  kilitMaliyet: {
    fontSize: 12,
    color: TEMA.renkler.solukMetin,
    lineHeight: 18,
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
  },
  buton: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
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
