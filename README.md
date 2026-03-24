# 🏢 IT Manager: Startup Tycoon

Bu proje, React Native ve Expo kullanılarak geliştirilmiş kapsamlı bir IT ofisi yönetimi (tycoon) simülasyonudur. Küçük bir garaj girişiminden başlayarak "Mega Corp" seviyesine ulaşmaya çalıştığınız bu oyunda; bütçenizi yönetin, farklı uzmanlıklardaki geliştiricileri işe alıp eğitin, projeleri zamanında teslim edin ve başınıza gelen rastgele siber krizlerle (bug istilaları) başa çıkın! Mimari olarak "Clean Code" prensiplerine sadık kalınarak, AI destekli geliştirme (Vibe Coding) süreçleriyle kodlanmıştır.

## ✨ Temel Özellikler

* 💰 **Dinamik Ekonomi & Şirket Büyümesi:** İşe alma maliyetleri, eğitim ücretleri ve şirketin bütçe büyüklüğüne göre dinamik olarak değişen şirket unvanları (Startup -> Scaleup -> Unicorn).
* 👨‍💻 **Kademeli Kadro Sistemi (Progression):** 12 farklı geliştirici profili (Üniversite arkadaşından Quantum Hacker'a). Otomatik gelişim yoktur, stratejik olarak bütçe harcayarak eğitilmeleri gerekir. Önceki çalışan Lv.3 olmadan yenisinin kilidi açılmaz (🔒).
* 📋 **Aktif Proje Yönetimi:** Takımınızın toplam yetenek gücüne göre tamamlanan projeler. Süresi dolmadan projeleri bitirip ödülleri toplayın; süreyi aşarsanız bütçe cezalarına katlanın.
* ⚡ **Rastgele Olaylar & Siber Krizler:** 60 saniyede bir tetiklenen sürprizler! "Melek Yatırımcı" ile paranızı katlayın veya ekranınızı basan "Bug (👾)" emojilerini tıklayarak ezin (Aksi takdirde geliriniz anında $0'a düşer!).
* 🚀 **Kalıcı Yükseltmeler (Upgrades):** "Gelişim" sekmesinden *Stajyer Kampı, Çift Monitör, Copilot* gibi donanım/yazılım yükseltmeleri satın alarak saniyelik gelirinizi kalıcı olarak katlayın.
* 💾 **Kalıcılık (Auto-Save):** Oyundan çıksanız bile ilerlemeniz kaybolmaz. `AsyncStorage` mimarisiyle her 10 saniyede bir veya uygulama arka plana alındığında oyun verileriniz otomatik olarak kaydedilir.
* 🎨 **Modern UI/UX & Haptik:** Dark mod odaklı tasarım, donanım hızlandırmalı UI animasyonları (Pulse, Spring efektleri) ve eylemlere duyarlı dokunsal (Haptics) titreşim geri bildirimleri.

## 🛠️ Mimari ve Kullanılan Teknolojiler

Proje, özellik tabanlı (feature-based) modüler bir dosya yapısına sahiptir:

* **React Native & Expo:** Mobil uygulama çatısı.
* **Context API & useReducer:** Karmaşık global oyun verilerinin (Bütçe, Kadro, Projeler, Yükseltmeler) değişmez (immutable) ve tek bir merkezden güvenli yönetimi.
* **React Navigation:** `@react-navigation/bottom-tabs` ve `native-stack` entegrasyonu ile akıcı sayfa geçişleri (Ana Sayfa, Başarımlar, Gelişim, Bütçe, Ayarlar).
* **AsyncStorage & Custom Hooks:** `useAutoSave`, `useRandomEvents` ve `useHaptics` gibi özel kancalarla ayrıştırılmış, temiz iş mantığı.

## 🚀 Başlangıç

Projeyi yerel makinenizde çalıştırmak için şu adımları izleyin:

### 1. Bu depoyu klonlayın:
```bash
git clone [https://github.com/yigittozdemirr/software-card-mobile-app.git](https://github.com/yigittozdemirr/software-card-mobile-app.git)
```
### 2. Proje dizinine gidin:
```bash
cd software-card-mobile-app
```

### 3. Bağımlılıkları yükleyin:
```bash
npm install
```

### 4. Uygulamayı başlatın:
```bash
npx expo start
```

## 📱 APK İndir
Uygulamanın en güncel Android (Production) sürümünü cihazınıza kurup test etmek için aşağıdaki linke tıklayabilirsiniz:

📥 [ITManagerTycoon_v1.1.apk İndir](https://github.com/yigittozdemirr/software-card-mobile-app/releases/tag/1.1.0)

## 🎥 Demo Videoyu İzle
Proje mekaniklerinin ve ofis yönetim dinamiklerinin gösterildiği kısa tanıtım videosu:

📺 [Uygulama Demo Videosunu İzle](https://youtube.com/shorts/TbaJooagy8I)

**Geliştiren:** [Yiğit Özdemir - Samsun Üniversitesi Yazılım Mühendisliği](https://github.com/yigittozdemirr)
