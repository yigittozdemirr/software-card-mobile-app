// ═══════════════════════════════════════════════════════════════════════════════
// 🔊 SES YÖNETİCİSİ — expo-av ile placeholder ses sistemi
// ═══════════════════════════════════════════════════════════════════════════════
//
// Kullanıcı daha sonra gerçek ses dosyalarını ekleyecek.
// Şimdilik ses çalma fonksiyonları hazır ama asset olmadan sessiz çalışır.
// ═══════════════════════════════════════════════════════════════════════════════

import { Platform } from 'react-native';

let Audio = null;

if (Platform.OS !== 'web') {
  try {
    const ExpoAV = require('expo-av');
    Audio = ExpoAV.Audio;
  } catch (e) {
    // expo-av yüklenemedi
  }
}

// Ses dosyası placeholder'ları — kullanıcı asset'leri sağladığında
// require('./assets/sounds/levelUp.mp3') gibi değiştirilecek
const SES_DOSYALARI = {
  levelUp: null,    // Seviye atlama sesi
  paraKazan: null,  // Para kazanma sesi
  proje: null,      // Proje tamamlama sesi
  hata: null,       // Hata/ceza sesi
  basarim: null,    // Başarım kazanma sesi
};

/**
 * Belirtilen sesi çalar. Asset yüklenmediyse sessizce devam eder.
 * @param {'levelUp' | 'paraKazan' | 'proje' | 'hata' | 'basarim'} sesAdi
 */
export async function sesCal(sesAdi) {
  if (!Audio || !SES_DOSYALARI[sesAdi]) return;

  try {
    const { sound } = await Audio.Sound.createAsync(SES_DOSYALARI[sesAdi]);
    await sound.playAsync();
    // Ses bittiğinde kaynağı serbest bırak
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.didJustFinish) {
        sound.unloadAsync();
      }
    });
  } catch (e) {
    // Sessizce devam
  }
}

/**
 * Ses ayarlarını yapılandır (arka plan müziği vs.)
 */
export async function sesAyarla() {
  if (!Audio) return;
  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: false,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    });
  } catch (e) {
    // Sessizce devam
  }
}
