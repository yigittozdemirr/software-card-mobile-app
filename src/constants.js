// ═══════════════════════════════════════════════════════════════════════════════
// 📦 SABİTLER & TEMA — Phase 3: Expanded Tycoon Economy
// ═══════════════════════════════════════════════════════════════════════════════
//
// Oyun Ekonomisi:
//   • 12 geliştirici, kademeli açılma (Lv3'te sonraki açılır)
//   • Manuel eğitim sistemi (XP kaldırıldı, para ile seviye atlama)
//   • Üstel maliyet ve gelir artışı
//   • 5 seviye sistemi (1-5)
// ═══════════════════════════════════════════════════════════════════════════════

import { Platform } from 'react-native';

// ── Tasarım Tokenleri ──────────────────────────────────────────────────────────
export const TEMA = {
  renkler: {
    // Dashboard arka planı
    arkaPlan: '#0B0F1A',
    kartArkaPlan: '#141B2D',
    kartArkaPlanAktif: '#1A2340',
    headerGradientStart: '#1E293B',
    headerGradientEnd: '#0F172A',

    // Vurgu renkleri
    altin: '#F59E0B',
    altinKoyu: '#D97706',
    yesil: '#10B981',
    yesilKoyu: '#059669',
    mavi: '#3B82F6',
    maviKoyu: '#2563EB',
    mor: '#8B5CF6',
    morKoyu: '#7C3AED',
    kirmizi: '#EF4444',
    turuncu: '#F97316',
    cyan: '#06B6D4',

    // Metin renkleri
    beyaz: '#FFFFFF',
    acikGri: '#94A3B8',
    ortaGri: '#64748B',
    koyuMetin: '#E2E8F0',
    solukMetin: '#475569',

    // Durum renkleri
    musaitYesil: '#22C55E',
    mesgulTuruncu: '#F97316',
    calisiyorMavi: '#3B82F6',

    // Seviye renkleri (5 seviye)
    seviye1: '#3B82F6',
    seviye2: '#8B5CF6',
    seviye3: '#F59E0B',
    seviye4: '#EF4444',
    seviye5: '#06B6D4',

    // Legacy aliases
    seviyeBeginner: '#3B82F6',
    seviyeIntermediate: '#8B5CF6',
    seviyeAdvanced: '#F59E0B',

    // XP Bar renkleri (repurposed for level progress)
    xpBarArkaPlan: '#1E293B',
    xpBarBeginner: '#3B82F6',
    xpBarIntermediate: '#8B5CF6',
    xpBarAdvanced: '#F59E0B',

    // Başarım toast
    toastArkaPlan: '#1E293B',
    toastBorder: '#F59E0B',

    // Proje kartı
    projeKartArkaPlan: '#111827',
    projeBasarili: '#10B981',
    projeBaskrisiz: '#EF4444',

    // Kilit UI
    kilitArkaPlan: 'rgba(255,255,255,0.03)',
  },
  golge: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 16,
    },
    android: { elevation: 12 },
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 16,
    },
  }),
  golgeHafif: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
    },
    android: { elevation: 6 },
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
    },
  }),
};

// ── Oyun Konfigürasyonu ────────────────────────────────────────────────────────

/** Başlangıç bütçesi — $100 (Garage Startup starter buffer) */
export const BASLANGIC_BUTCE = 100;

/** Maksimum seviye */
export const MAX_SEVIYE = 5;

/** Seviyeye göre gelir çarpanları (index = seviye - 1) */
export const GELIR_SEVIYE_CARPANLARI = [1, 2.5, 6, 15, 40];

/** Seviyeye göre takım gücü (index = seviye - 1) */
export const GUC_SEVIYE_CARPANLARI = [1, 2, 4, 8, 16];

/** Eğitim (level-up) maliyeti hesaplama: baseMaliyet * çarpan^(seviye-1) */
export const EGITIM_BASE_MALIYET = 500;
export const EGITIM_MALIYET_CARPAN = 4;

/** Eğitim maliyetini hesapla */
export const getEgitimMaliyeti = (devIndex, mevcutSeviye) => {
  // Her geliştirici kendi tier'ına göre daha pahalı
  const tierCarpan = 1 + devIndex * 0.5;
  let maliyet = Math.round(EGITIM_BASE_MALIYET * tierCarpan * Math.pow(EGITIM_MALIYET_CARPAN, mevcutSeviye - 1));
  // İlk geliştirici (Üniversite Arkadaşı) için ilk 2 seviye %60 indirimli
  if (devIndex === 0 && mevcutSeviye <= 2) {
    maliyet = Math.round(maliyet * 0.4);
  }
  return maliyet;
};

// Legacy constants (backward compat, some components still reference these)
export const TEMEL_GELIR = 10;
export const TEMEL_XP = 5;
export const ISE_ALMA_MALIYETI = 100;
export const XP_ESIKLERI = { Beginner: 100, Intermediate: 250, Advanced: Infinity };
export const GELIR_CARPANLARI = { Beginner: 1, Intermediate: 2, Advanced: 4 };
export const SEVIYE_SIRASI = ['Beginner', 'Intermediate', 'Advanced'];
export const SEVIYE_GUC = { Beginner: 1, Intermediate: 2, Advanced: 4 };

// ── Geliştirici Kadrosu (12 kişi, kademeli açılma) ─────────────────────────────

export const YAZILIMCILAR = [
  {
    id: 'dev-1',
    ad: 'Ahmet',
    unvan: 'Üniversite Arkadaşı',
    uzmanlik: 'HTML & CSS',
    emoji: '🎒',
    maliyetBase: 0,       // Bedava!
    gelirBase: 2,         // $2/sn
    acilisSeviye: 1,
  },
  {
    id: 'dev-2',
    ad: 'Elif',
    unvan: 'Stajyer',
    uzmanlik: 'JavaScript',
    emoji: '📋',
    maliyetBase: 50,
    gelirBase: 5,
    acilisSeviye: 1,
  },
  {
    id: 'dev-3',
    ad: 'Burak',
    unvan: 'Junior Frontend',
    uzmanlik: 'React',
    emoji: '💻',
    maliyetBase: 200,
    gelirBase: 12,
    acilisSeviye: 1,
  },
  {
    id: 'dev-4',
    ad: 'Zeynep',
    unvan: 'Junior Backend',
    uzmanlik: 'Node.js',
    emoji: '🖥️',
    maliyetBase: 500,
    gelirBase: 25,
    acilisSeviye: 1,
  },
  {
    id: 'dev-5',
    ad: 'Mert',
    unvan: 'Mid-Level Developer',
    uzmanlik: 'Python & Django',
    emoji: '⚙️',
    maliyetBase: 1500,
    gelirBase: 50,
    acilisSeviye: 1,
  },
  {
    id: 'dev-6',
    ad: 'Defne',
    unvan: 'Full Stack',
    uzmanlik: 'TypeScript & Next.js',
    emoji: '🏗️',
    maliyetBase: 4000,
    gelirBase: 100,
    acilisSeviye: 1,
  },
  {
    id: 'dev-7',
    ad: 'Kaan',
    unvan: 'Siber Güvenlik Uzmanı',
    uzmanlik: 'Penetration Testing',
    emoji: '🔒',
    maliyetBase: 10000,
    gelirBase: 200,
    acilisSeviye: 1,
  },
  {
    id: 'dev-8',
    ad: 'Selin',
    unvan: 'DevOps Master',
    uzmanlik: 'Docker & K8s',
    emoji: '☁️',
    maliyetBase: 25000,
    gelirBase: 400,
    acilisSeviye: 1,
  },
  {
    id: 'dev-9',
    ad: 'Emre',
    unvan: 'AI/ML Mühendisi',
    uzmanlik: 'TensorFlow & PyTorch',
    emoji: '🧠',
    maliyetBase: 60000,
    gelirBase: 800,
    acilisSeviye: 1,
  },
  {
    id: 'dev-10',
    ad: 'Ayşe',
    unvan: 'Senior Architect',
    uzmanlik: 'System Design',
    emoji: '🏛️',
    maliyetBase: 150000,
    gelirBase: 1600,
    acilisSeviye: 1,
  },
  {
    id: 'dev-11',
    ad: 'Barış',
    unvan: '10x Rockstar Developer',
    uzmanlik: 'Everything.js',
    emoji: '🚀',
    maliyetBase: 400000,
    gelirBase: 3200,
    acilisSeviye: 1,
  },
  {
    id: 'dev-12',
    ad: 'Ceren',
    unvan: 'Cyber Wizard',
    uzmanlik: 'Quantum Computing',
    emoji: '🧙',
    maliyetBase: 1000000,
    gelirBase: 6400,
    acilisSeviye: 1,
  },
];

// ── Proje Havuzu (zorlaştırılmış gerekli güçler) ───────────────────────────────

export const PROJE_HAVUZU = [
  { ad: 'Landing Page Yapımı', emoji: '🌐', gerekliGuc: 2, odul: 120, ceza: 15, sure: 60 },
  { ad: 'Blog Sitesi', emoji: '📝', gerekliGuc: 4, odul: 300, ceza: 40, sure: 55 },
  { ad: 'Mobil E-Ticaret App', emoji: '🛒', gerekliGuc: 8, odul: 720, ceza: 100, sure: 70 },
  { ad: 'AI Chatbot', emoji: '🤖', gerekliGuc: 15, odul: 1800, ceza: 200, sure: 80 },
  { ad: 'Legacy Refactor', emoji: '🔧', gerekliGuc: 6, odul: 480, ceza: 60, sure: 50 },
  { ad: 'Fintech Dashboard', emoji: '📊', gerekliGuc: 12, odul: 1200, ceza: 150, sure: 75 },
  { ad: 'Sosyal Medya Clone', emoji: '📱', gerekliGuc: 20, odul: 3000, ceza: 300, sure: 90 },
  { ad: 'IoT Kontrol Paneli', emoji: '🌐', gerekliGuc: 10, odul: 960, ceza: 100, sure: 65 },
  { ad: 'Online Eğitim Portalı', emoji: '🎓', gerekliGuc: 14, odul: 1440, ceza: 175, sure: 70 },
  { ad: 'Sağlık Takip Uygulaması', emoji: '🏥', gerekliGuc: 18, odul: 2400, ceza: 250, sure: 85 },
  { ad: 'Blockchain Entegrasyonu', emoji: '⛓️', gerekliGuc: 25, odul: 4800, ceza: 500, sure: 100 },
  { ad: 'Otonom Araç Yazılımı', emoji: '🚗', gerekliGuc: 35, odul: 9600, ceza: 1000, sure: 120 },
  { ad: 'Uzay İstasyonu OS', emoji: '🛸', gerekliGuc: 50, odul: 18000, ceza: 2000, sure: 150 },
];

// ── Rastgele Olaylar ───────────────────────────────────────────────────────────

export const RASTGELE_OLAYLAR = [
  // Pozitif olaylar
  {
    id: 'kahve-boost',
    baslik: 'Kahve Molası! ☕',
    aciklama: 'Takım motivasyonu tavan yaptı! Gelir 15 saniye boyunca x2!',
    emoji: '☕',
    tur: 'pozitif',
    etki: 'gelir_x2',
    sure: 15,
  },
  {
    id: 'yatirimci',
    baslik: 'Melek Yatırımcı! 💎',
    aciklama: 'Bir yatırımcı şirketinize $500 yatırdı!',
    emoji: '💎',
    tur: 'pozitif',
    etki: 'bonus_para',
    miktar: 500,
    sure: 0,
  },
  {
    id: 'verimlilik',
    baslik: 'Verimlilik Patlaması! 🔥',
    aciklama: 'Gelir 20 saniye boyunca x2!',
    emoji: '🔥',
    tur: 'pozitif',
    etki: 'gelir_x2',
    sure: 20,
  },
  {
    id: 'hackathon',
    baslik: 'Hackathon Ödülü! 🏆',
    aciklama: 'Takımınız hackathon kazandı! +$1000 bonus!',
    emoji: '🏆',
    tur: 'pozitif',
    etki: 'bonus_para',
    miktar: 1000,
    sure: 0,
  },
  // Negatif olaylar
  {
    id: 'server-crash',
    baslik: 'Sunucu Çöktü! 💥',
    aciklama: 'Gelir 10 saniye boyunca durdu!',
    emoji: '💥',
    tur: 'negatif',
    etki: 'gelir_durdur',
    sure: 10,
  },
  {
    id: 'bug-hunt',
    baslik: 'Bug Avı! 🐛',
    aciklama: 'Kritik bir bug bulundu! Düzeltme maliyeti: $100',
    emoji: '🐛',
    tur: 'negatif',
    etki: 'para_kaybi',
    miktar: 100,
    sure: 0,
  },
  {
    id: 'siber-saldiri',
    baslik: 'Siber Saldırı! 🔓',
    aciklama: 'DDoS saldırısı! $200 güvenlik maliyeti.',
    emoji: '🔓',
    tur: 'negatif',
    etki: 'para_kaybi',
    miktar: 200,
    sure: 0,
  },
  {
    id: 'istifa',
    baslik: 'Motivasyon Düşüşü! 😩',
    aciklama: 'Takım morali düştü. Gelir 12 saniye boyunca yarıya indi.',
    emoji: '😩',
    tur: 'negatif',
    etki: 'gelir_yarim',
    sure: 12,
  },
  {
    id: 'yazilim-hatasi',
    baslik: 'Yazılım Açığı İstikrarı! 🐛',
    aciklama: 'Kritik buglar tespiti edildi! Üretim tamamen durdu! Hemen düzeltin!',
    emoji: '👾',
    tur: 'negatif',
    etki: 'bug_popup',
    sure: 0, // Süresi yok, kullanıcı hepsini kapatana kadar kalır
  },
];

// ── Yükseltmeler (Kalıcı Çarpanlar) ──────────────────────────────────────────────
export const YUKSELTMELER = [
  {
    id: 'upg-1',
    ad: 'Stajyer Eğitim Kampı',
    target: 'devIndex',
    index: 0,
    baslangicMaliyeti: 1000,
    carpan: 1.5,
    emoji: '📘'
  },
  {
    id: 'upg-2',
    ad: 'Mekanik Klavye (Slot 1)',
    target: 'devIndex',
    index: 0,
    baslangicMaliyeti: 3000,
    carpan: 1.8,
    emoji: '⌨️'
  },
  {
    id: 'upg-3',
    ad: 'Junior Mentorluk',
    target: 'devIndex',
    index: 1,
    baslangicMaliyeti: 2500,
    carpan: 1.3,
    emoji: '👨‍🏫'
  },
  {
    id: 'upg-4',
    ad: 'Çift Monitör Kurulumu',
    target: 'devIndex',
    index: 1,
    baslangicMaliyeti: 5000,
    carpan: 1.5,
    emoji: '🖥️'
  },
  {
    id: 'upg-5',
    ad: 'Senior Odak Odası',
    target: 'devIndex',
    index: 2,
    baslangicMaliyeti: 10000,
    carpan: 1.2,
    emoji: '🎧'
  },
  {
    id: 'upg-6',
    ad: 'Takım Kaynaşma Etkinliği',
    target: 'global',
    baslangicMaliyeti: 5000,
    carpan: 1.1,
    emoji: '🍕'
  },
  {
    id: 'upg-7',
    ad: 'Agile Metodolojisi Geçişi',
    target: 'global',
    baslangicMaliyeti: 15000,
    carpan: 1.2,
    emoji: '🔄'
  },
  {
    id: 'upg-8',
    ad: 'Uzman DevOps Eğitimi',
    target: 'devIndex',
    index: 2,
    baslangicMaliyeti: 25000,
    carpan: 1.5,
    emoji: '🚀'
  },
  {
    id: 'upg-9',
    ad: 'Şirket İçi Hackathon',
    target: 'global',
    baslangicMaliyeti: 50000,
    carpan: 1.25,
    emoji: '💻'
  },
  {
    id: 'upg-10',
    ad: 'Yapay Zeka Copilot Lisansı',
    target: 'global',
    baslangicMaliyeti: 100000,
    carpan: 2.0,
    emoji: '🤖'
  }
];

// ── Şirket Seviyeleri (Dinamik Tema için) ──────────────────────────────────────

export const SIRKET_SEVIYELERI = [
  { ad: 'Garajdaki Girişim', emoji: '🏠', baslik: '🏠 Garajdaki Girişim', esik: 0, arkaPlan: '#0B0F1A' },
  { ad: 'Startup', emoji: '🏢', baslik: '🏢 Startup', esik: 1000, arkaPlan: '#0D1025' },
  { ad: 'Scaleup', emoji: '🚀', baslik: '🚀 Scaleup', esik: 10000, arkaPlan: '#0D1025' },
  { ad: 'Unicorn', emoji: '🦄', baslik: '🦄 Unicorn', esik: 100000, arkaPlan: '#120B20' },
  { ad: 'Mega Corp', emoji: '🌍', baslik: '🌍 Mega Corp', esik: 1000000, arkaPlan: '#0A1520' },
];

/** Bütçeye göre şirket seviyesini döndürür */
export const getSirketSeviyesi = (budget) => {
  for (let i = SIRKET_SEVIYELERI.length - 1; i >= 0; i--) {
    if (budget >= SIRKET_SEVIYELERI[i].esik) return SIRKET_SEVIYELERI[i];
  }
  return SIRKET_SEVIYELERI[0];
};

// ── Başarım (Achievement) Tanımları ────────────────────────────────────────────

export const BASARIMLAR = [
  {
    id: 'ilk-dolar',
    baslik: 'İlk Dolar! 💵',
    aciklama: 'İlk gelirinizi elde ettiniz!',
    emoji: '💵',
    kosul: (state) => state.toplamKazanilan > 0,
  },
  {
    id: 'ilk-ise-alim',
    baslik: 'İlk İşe Alım! 🤝',
    aciklama: 'İlk geliştiricinizi işe aldınız!',
    emoji: '🤝',
    kosul: (state) => state.developers.some((d) => d.durum !== 'musait'),
  },
  {
    id: 'ilk-egitim',
    baslik: 'İlk Eğitim! 🎓',
    aciklama: 'Bir geliştiricinizi eğittiniz!',
    emoji: '🎓',
    kosul: (state) => state.developers.some((d) => d.seviye > 1),
  },
  {
    id: 'butce-1000',
    baslik: 'İlk Bin! 💰',
    aciklama: 'Bütçeniz $1.000\'e ulaştı!',
    emoji: '💰',
    kosul: (state) => state.budget >= 1000,
  },
  {
    id: 'butce-5000',
    baslik: 'Zengin Şirket! 💎',
    aciklama: 'Bütçeniz $5.000\'e ulaştı!',
    emoji: '💎',
    kosul: (state) => state.budget >= 5000,
  },
  {
    id: 'ikinci-dev',
    baslik: 'Büyüyen Kadro! 👥',
    aciklama: 'İkinci geliştiricinizi açtınız!',
    emoji: '👥',
    kosul: (state) => state.developers.filter((d) => !d.kpiLocked).length >= 2,
  },
  {
    id: 'ilk-proje',
    baslik: 'İlk Proje! 📋',
    aciklama: 'İlk projenizi tamamladınız!',
    emoji: '📋',
    kosul: (state) => state.tamamlananProjeler >= 1,
  },
  {
    id: 'proje-ustasi',
    baslik: 'Proje Ustası! 🏗️',
    aciklama: '5 projeyi başarıyla tamamladınız!',
    emoji: '🏗️',
    kosul: (state) => state.tamamlananProjeler >= 5,
  },
  {
    id: 'butce-50000',
    baslik: 'Büyük Liga! 🏆',
    aciklama: 'Bütçeniz $50.000\'e ulaştı!',
    emoji: '🏆',
    kosul: (state) => state.budget >= 50000,
  },
  {
    id: 'bes-dev',
    baslik: 'Güçlü Takım! 💪',
    aciklama: '5 geliştirici açtınız!',
    emoji: '💪',
    kosul: (state) => state.developers.filter((d) => !d.kpiLocked).length >= 5,
  },
  {
    id: 'max-seviye',
    baslik: 'Usta Geliştirici! 🌟',
    aciklama: 'Bir geliştiriciyi maksimum seviyeye ulaştırdınız!',
    emoji: '🌟',
    kosul: (state) => state.developers.some((d) => d.seviye >= 5),
  },
  {
    id: 'butce-1m',
    baslik: 'Milyoner! 🤑',
    aciklama: 'Bütçeniz $1.000.000\'a ulaştı!',
    emoji: '🤑',
    kosul: (state) => state.budget >= 1000000,
  },
  {
    id: 'tam-kadro',
    baslik: 'Tüm Kadro! 🎯',
    aciklama: 'Tüm 12 geliştiriciyi açtınız!',
    emoji: '🎯',
    kosul: (state) => state.developers.filter((d) => !d.kpiLocked).length >= 12,
  },
  {
    id: 'proje-10',
    baslik: 'Proje Baronu! 👑',
    aciklama: '10 projeyi başarıyla tamamladınız!',
    emoji: '👑',
    kosul: (state) => state.tamamlananProjeler >= 10,
  },
];

// ── Yardımcı Fonksiyonlar ──────────────────────────────────────────────────────

/** Seviye numarasından rozet emojisi döndürür */
export const getSeviyeEmojisi = (seviye) => {
  const harita = { 1: '🌱', 2: '⚡', 3: '🔥', 4: '💎', 5: '👑' };
  // Legacy support
  const legacy = { Beginner: '🌱', Intermediate: '⚡', Advanced: '🚀' };
  return harita[seviye] ?? legacy[seviye] ?? '📌';
};

/** Seviye numarasından Türkçe etiket döndürür */
export const getSeviyeEtiketi = (seviye) => {
  const harita = { 1: 'Çaylak', 2: 'Gelişen', 3: 'Deneyimli', 4: 'Uzman', 5: 'Efsanevi' };
  const legacy = { Beginner: 'Başlangıç', Intermediate: 'Orta', Advanced: 'İleri' };
  return harita[seviye] ?? legacy[seviye] ?? `Lv.${seviye}`;
};

/** Seviye numarasından renk döndürür */
export const getSeviyeRengi = (seviye) => {
  const harita = {
    1: TEMA.renkler.seviye1,
    2: TEMA.renkler.seviye2,
    3: TEMA.renkler.seviye3,
    4: TEMA.renkler.seviye4,
    5: TEMA.renkler.seviye5,
  };
  const legacy = {
    Beginner: TEMA.renkler.seviyeBeginner,
    Intermediate: TEMA.renkler.seviyeIntermediate,
    Advanced: TEMA.renkler.seviyeAdvanced,
  };
  return harita[seviye] ?? legacy[seviye] ?? TEMA.renkler.seviye1;
};

/** Ad string'inden baş harfleri çıkarır (max 2) */
export const getBasHarfler = (ad) =>
  ad
    .split(' ')
    .map((kelime) => kelime[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

/** Proje havuzundan rastgele N proje seç (tekrar etmeyen) */
export const rastgeleProjeSecimi = (adet = 3, mevcutProjeler = []) => {
  const mevcutAdlar = mevcutProjeler.map((p) => p.ad);
  const uygunlar = PROJE_HAVUZU.filter((p) => !mevcutAdlar.includes(p.ad));
  const karisik = [...uygunlar].sort(() => Math.random() - 0.5);
  return karisik.slice(0, adet).map((p, i) => ({
    ...p,
    id: `proje-${Date.now()}-${i}`,
    kalanSure: p.sure,
    status: 'PENDING',
    progress: 0,
  }));
};

/** Rastgele olay havuzundan bir olay seç */
export const rastgeleOlaySecimi = () => {
  const index = Math.floor(Math.random() * RASTGELE_OLAYLAR.length);
  return { ...RASTGELE_OLAYLAR[index] };
};

/** Geliştiricinin mevcut gelir hızını hesapla */
export const getGelirHizi = (developer) => {
  const seviyeCarpani = GELIR_SEVIYE_CARPANLARI[(developer.seviye || 1) - 1] || 1;
  return Math.round(developer.gelirBase * seviyeCarpani);
};

/** Geliştiricinin mevcut takım gücünü hesapla */
export const getDevGuc = (developer) => {
  const seviyeCarpani = GUC_SEVIYE_CARPANLARI[(developer.seviye || 1) - 1] || 1;
  return seviyeCarpani;
};

/** Para formatla ($1.234 şeklinde) */
export const formatPara = (miktar) => {
  if (miktar >= 1000000) return `$${(miktar / 1000000).toFixed(1)}M`;
  if (miktar >= 1000) return `$${(miktar / 1000).toFixed(1)}K`;
  return `$${miktar}`;
};
