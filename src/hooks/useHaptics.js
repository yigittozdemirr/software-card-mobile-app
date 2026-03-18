// ═══════════════════════════════════════════════════════════════════════════════
// 📳 HAPTİK GERİ BİLDİRİM — expo-haptics ile dokunsal feedback
// ═══════════════════════════════════════════════════════════════════════════════
//
// Web ve emulator ortamında hata vermemesi için try/catch ile sarılmıştır.
// ═══════════════════════════════════════════════════════════════════════════════

import { Platform } from 'react-native';

let Haptics = null;

// expo-haptics'i dinamik olarak import et (web'de yüklenmez)
if (Platform.OS !== 'web') {
  try {
    Haptics = require('expo-haptics');
  } catch (e) {
    // expo-haptics yüklenemedi, sessizce devam
  }
}

/**
 * Haptik geri bildirim tetikler.
 * @param {'hafif' | 'orta' | 'agir'} tip — Titreşim şiddeti
 */
export async function haptikGeriBildirim(tip = 'hafif') {
  if (!Haptics) return;

  try {
    const harita = {
      hafif: Haptics.ImpactFeedbackStyle?.Light,
      orta: Haptics.ImpactFeedbackStyle?.Medium,
      agir: Haptics.ImpactFeedbackStyle?.Heavy,
    };
    await Haptics.impactAsync(harita[tip] || Haptics.ImpactFeedbackStyle?.Light);
  } catch (e) {
    // Sessizce devam — emulator'da veya web'de hata vermez
  }
}

/**
 * Bildirim tipi haptik (başarım kazanıldığında)
 */
export async function haptikBildirim() {
  if (!Haptics) return;
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType?.Success);
  } catch (e) {
    // Sessizce devam
  }
}
