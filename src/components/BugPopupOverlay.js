import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { useGame } from '../context/GameContext';
import { TEMA } from '../constants';
import { haptikGeriBildirim } from '../hooks/useHaptics';

const { width, height } = Dimensions.get('window');

// Etrafa rastgele yayılacak bug panelleri için koordinat üret
const generateRandomPosition = () => {
  const x = Math.random() * (width - 160) + 20;
  const y = Math.random() * (height - 200) + 60;
  return { x, y };
};

export default function BugPopupOverlay() {
  const { state, dispatch } = useGame();
  const { bugsCount } = state;
  const [bugs, setBugs] = useState([]);

  useEffect(() => {
    if (bugsCount > 0 && bugs.length === 0) {
      // Olay tetiklendi, popupları oluştur
      haptikGeriBildirim('agir');
      const newBugs = Array.from({ length: bugsCount }).map((_, i) => ({
        id: `bug-${Date.now()}-${i}`,
        pos: generateRandomPosition(),
        rotation: (Math.random() - 0.5) * 15, // Hafif rotasyon
      }));
      setBugs(newBugs);
    } else if (bugsCount === 0 && bugs.length > 0) {
      setBugs([]);
    }
  }, [bugsCount]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFixBug = (bugId) => {
    haptikGeriBildirim('orta');
    setBugs((prev) => prev.filter((b) => b.id !== bugId));
    dispatch({ type: 'FIX_BUG' });
  };

  if (bugsCount === 0 || bugs.length === 0) return null;

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      {/* Gelir durduğu uyarısı */}
      <View style={styles.uyariHeader}>
        <Text style={styles.uyariBaslik}>🚨 SİSTEM ÇÖKTÜ 🚨</Text>
        <Text style={styles.uyariAlt}>Üretim durdu! Hatayı bul ve kapat!</Text>
      </View>

      {/* Popuplar (ters sırayla üstte kalsın) */}
      {bugs.map((bug) => (
        <View
          key={bug.id}
          style={[
            styles.bugPanel,
            { left: bug.pos.x, top: bug.pos.y, transform: [{ rotate: `${bug.rotation}deg` }] },
          ]}
        >
          <View style={styles.bugHeader}>
            <Text style={styles.bugTitle}>Hata: NulPointerException</Text>
            <TouchableOpacity onPress={() => handleFixBug(bug.id)} style={styles.closeBtn}>
              <Text style={styles.closeText}>X</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.bugBody}>
            <Text style={styles.bugDesc}>
              Bilinmeyen bir hata oluştu ve tüm sistem yavaşladı. Düzeltmen gerekiyor.
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999, // Her şeyin üstünde
    elevation: 9999,
  },
  uyariHeader: {
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    paddingVertical: 12,
    alignItems: 'center',
    paddingTop: 50, // SafeArea allowance
  },
  uyariBaslik: {
    fontSize: 20,
    fontWeight: '900',
    color: TEMA.renkler.beyaz,
  },
  uyariAlt: {
    fontSize: 14,
    fontWeight: '700',
    color: TEMA.renkler.beyaz,
  },
  bugPanel: {
    position: 'absolute',
    width: 220,
    backgroundColor: '#FAF9F6', // Windows XP tarzı hata penceresi hissi
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#9ca3af',
    ...TEMA.golge,
  },
  bugHeader: {
    backgroundColor: '#3b82f6',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  bugTitle: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  closeBtn: {
    backgroundColor: '#ef4444',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  bugBody: {
    padding: 12,
  },
  bugDesc: {
    color: '#1f2937',
    fontSize: 12,
    lineHeight: 16,
  },
});
