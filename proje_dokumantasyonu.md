# 🏢 IT Manager: Startup Tycoon - Proje Dokümantasyonu

Bu doküman, React Native ve Expo kullanılarak geliştirilen "IT Manager: Startup Tycoon" mobil oyununun teknik mimarisini, dosya yapısını ve temel oyun mekaniklerini açıklamaktadır.

## 📋 Proje Özeti
Oyun, bir garaj girişiminden "Mega Corp" seviyesine kadar ulaşmaya çalışan bir IT yöneticisini simüle eder. Oyuncu, bütçesini yönetir, geliştiriciler işe alır (Junior, Senior, vb.), onları eğitir, projeler tamamlar ve rastgele olaylarla veya yazılım hatalarıyla başa çıkar. Mimari olarak "Clean Code" prensiplerine uygun, modüler ve React Context API / `useReducer` kombinasyonu tabanlı global state yönetimine sahiptir.

---

## 🏗️ Dosya Yapısı ve Mimari

Proje, `src` dizini altında yapılandırılmış özellik tabanlı (feature-based) bir mimariye sahiptir.

```text
c:\reactmobil\MyHelloWorldApp\
├── App.js                      # React Navigation ayarları ve Context/Theme sağlayıcıları
├── src/
│   ├── constants.js            # Temel konfigürasyonlar (Tema, Ekonomik değerler, Geliştiriciler)
│   ├── context/
│   │   └── GameContext.js      # Global state (useGame) ve Reducer mekanizması
│   ├── hooks/
│   │   ├── useAutoSave.js      # AsyncStorage ile otomatik kayıt mantığı
│   │   ├── useHaptics.js       # expo-haptics sarmalayıcısı (titreşim)
│   │   └── useRandomEvents.js  # 60 saniyede bir rastgele olayları tetikleyen kanca
│   ├── screens/                # Temel sayfalar
│   │   ├── HomeScreen.js       # Ana ekran (Dashboard, Projeler, Developer'lar)
│   │   ├── AchievementsScreen.js # Başarımlar listesi
│   │   ├── BudgetScreen.js     # Gelir/Gider istatistikleri ve analizleri
│   │   ├── UpgradesScreen.js   # Yükseltme satın alma ekranı
│   │   └── SettingsScreen.js   # Ayarlar ve ilerleme sıfırlama
│   └── components/             # Yeniden kullanılabilir UI bileşenleri
│       ├── DeveloperCard.js    # Geliştirici gösterim kartı
│       ├── ProjectCard.js      # Aktif/Pasif proje kartları
│       ├── DashboardHeader.js  # Ana bütçe ve istatistik özeti
│       ├── BudgetChart.js      # Graph gösterimleri
│       └── ... (Overlay ve Toastlar)
```

---

## 🧠 State Yönetimi (GameContext.js)

Oyun verileri tek bir değişmez (immutable) state üzerinden `useReducer` yardımıyla yönetilir.
State içerisinde şunlar bulunur:
- `budget`: Mevcut bütçe (Dolar)
- `developers`: Geliştirici havuzu (12 karakter, Kademeli açılma)
- `projects`: Üzerinde çalışılan mevcut görevler/projeler
- `upgrades`: Satın alınmış yükseltme kimlikleri dizisi (Gelir çarpanı güçlendirmeleri)
- `aktifOlay`, `gelirCarpani`, `bugsCount`: Rastgele olayların ve bugların mekaniksel yansımaları.

### ⚡ Temel Aksiyonlar (Actions)
- `HIRE` / `START_WORK` / `STOP_WORK`: Çalışan döngüsü.
- `ADD_INCOME`: Her saniye aktif çalışan üzerinden bütçe artırımı (Yükseltme çarpanları dikkate alınır).
- `TRAIN_DEVELOPER`: Bütçe kullanılarak çalışanı level atlattırma. Lv.3 olduğunda bir sonraki dev'in kilidi `(kpiLocked: false)` açılır.
- `TICK_PROJECTS` / `COMPLETE_PROJECT`: Aktif çalışanların seviyesi hesaplanarak projenin ilerlemesi.
- `BUY_UPGRADE`: Bütçe karşılığı kalıcı gelir yükseltmesi elde etme.

---

## 🎮 Oyun Mekanikleri ve Ekonomi

### 1. Geliştirici (Kadro) Sistemi
- 12 farklı geliştirici profili vardır (Üniversite arkadaşından Quantum Hacker'a kadar).
- Her karakter 5 seviyeden (Max Lv.5) oluşur.
- Otomatik XP yoktur, **para harcanarak manuel eğitilirler** (`TRAIN_DEVELOPER`).
- Sonraki çalışanın kilidinin açılması için önceki çalışanın en az `Lv.3` olması gerekir.

### 2. Proje Sistemi (`ProjectCard.js`)
- Ekranda 3 proje belirir. Oyuncu birini "Kabul Et" diyerek (`ACCEPT_PROJECT`) süreci başlatır.
- Tüm `calisiyor` durumundaki çalışanların yetenek gücü toplanır. Bu güce göre proje çubuğu dolar.
- Projede belirlenen süre (Örn 60sn) dolmadan bitirilirse **Ödül**, bitmezse bütçeden düşülecek **Ceza** uygulanır.

### 3. Rastgele Olaylar (`useRandomEvents.js`)
Her 60 saniyede bir pozitif veya negatif olaylar gerçekleşebilir:
- **Pozitif:** "Melek Yatırımcı!" (+500$), "Kahve Molası!" (15sn Gelir x2)
- **Negatif:** "Sunucu Çöktü" (Gelir Durdu), "Motivasyon Düşüşü" (Gelir / 2)
Olaylar `RandomEventModal.js` üzerinden ekrana basılır ve süresi dolunca otomatik efektler düzeltilir.

### 4. Yazılım Hataları/Bug Sistemi (`BugPopupOverlay.js`)
Rastgele olayların en tehlikelisi siber saldırı veya bug istilasıdır. Ekranda rastgele konumlarda ve boyutlarda "Bug (👾)" emojileri belirir.
Buglar durduğu sürece `gelir = 0` olur. Oyuncu bu böcek emojilerine tıklayarak onları ezmek/düzeltmek zorundadır.

### 5. Yükseltmeler (Upgrades)
Oyuncu "Gelişim" sekmesinden şirket arabirimini (Stajyer Kampı, Çift Monitör, Copilot vb.) satın alarak gelir çarpanlarını artırabilir. Yükseltmeler sadece bir geliştiriciyi veya tüm şirketi (Global) etkileyebilir.

---

## 💾 Kalıcılık (Persistence) - `useAutoSave.js`
Uyun durumu kaybolmaması için Async Storage kullanılmıştır.
- Her **10 saniyede bir** (ve uygulama arka plana alındığında) `temizleState` fonksiyonuyla sadece serialize edilebilir veriler filtrelenir (örn. setInterval ID'leri çıkarılır).
- Bu JSON string'i `@ITManager_GameState_v3` key'iyle saklanır.
- Ayarlar (Titreşim, Ses vb.) `@ITManager_Settings_v1` anahtarı altında ayrı olarak saklanır.

---

## 🎨 Arayüz (UI/UX)
- `constants.js` içerisinde bir Dark Mode tema manifestosu (Altın, Yeşil, Koyu Arka Planlar) tanımlıdır. Flexbox mimarisiyle modern, yuvarlak köşeli tasarım ele alınmıştır.
- `DashboardHeader.js`'de animasyonlu (`Animated.spring`) "Şirket Bütçesi" zıplama efekti ve şirketin büyüklüğüne göre yanan title bulunur (Startup -> Scaleup -> Unicorn).
- Haptik (Dokunsal) geri bildirimler `expo-haptics` kullanılarak `useHaptics.js` içerisinde modülerleştirilmiştir.

## ⚙️ Navigasyon (`App.js`)
Navigasyon `@react-navigation/bottom-tabs` ve `@react-navigation/native-stack` üzerine kuruludur:
- **Tab Navigator**: Ana Sayfa (Home), Başarımlar, Gelişim (Upgrades) ve Bütçe ekranlarını kapsar.
- **Stack Navigator**: TabNavigator'u sarar, bu sayede "Ayarlar (Settings)" çark ikonuna basıldığında ekranı yeni bir tam sayfa stack olarak açabilir.
