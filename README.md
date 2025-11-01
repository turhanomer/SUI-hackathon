# SUI Voting System - Blockchain Entegrasyon Rehberi

Bu proje, Sui blockchain üzerinde çalışan merkezi olmayan bir anket/oylama sistemidir. Move smart contract'ları ve React tabanlı UI içerir.

## 📁 Proje Yapısı

```
├── move/                          # Move smart contracts
│   ├── sources/
│   │   ├── survey.move           # Anket yönetimi
│   │   ├── profile.move          # Kullanıcı profilleri
│   │   ├── badge.move            # NFT badge sistemi
│   │   └── version.move          # Versiyon yönetimi
│   └── Move.toml                 # Move package config
│
└── UI/                            # React UI
    ├── src/
    │   ├── types/
    │   │   ├── contracts.ts      # Move contract türleri
    │   │   └── poll.ts           # UI türleri
    │   ├── utility/
    │   │   ├── contractServices.ts    # Contract service sınıfları
    │   │   └── useSuiContracts.ts     # Ana React hook
    │   ├── networkConfig.ts       # Network ve contract adresleri
    │   └── ...
    └── package.json
```

## 🚀 Hızlı Başlangıç

### 1. Gereksinimleri Yükleyin

```bash
# Sui CLI (Rust gerektirir)
cargo install --locked --git https://github.com/MystenLabs/sui.git --branch testnet sui

# Node.js bağımlılıkları
cd UI
npm install
```

### 2. Move Kontratlarını Deploy Edin

Detaylı talimatlar için [`DEPLOYMENT.md`](./DEPLOYMENT.md) dosyasına bakın.

```bash
cd move
sui move build
sui client publish --gas-budget 100000000
```

**Önemli**: Deploy sonrası aldığınız ID'leri kaydedin!

### 3. UI'ı Konfigüre Edin

`UI/src/networkConfig.ts` dosyasını açın ve deploy'dan aldığınız ID'leri girin:

```typescript
export const VOTING_SYSTEM_CONFIG = {
  testnet: {
    PACKAGE_ID: "0x...",              // Package ID
    PROFILE_REGISTRY_ID: "0x...",     // ProfileRegistry shared object
    USER_SURVEY_LIMIT_ID: "0x...",    // UserSurveyLimit shared object
    BADGE_STATS_ID: "0x...",          // BadgeStats shared object
    ADMIN_CAP_ID: "0x...",            // AdminCap object
  },
};
```

### 4. Uygulamayı Çalıştırın

```bash
cd UI
npm run dev
```

Tarayıcıda http://localhost:5173 açılacak.

## 🎯 Temel Özellikler

### Smart Contract Özellikleri

- **Survey Modülü**
  - Bedava anket oluşturma (max 3)
  - Badge ile sınırsız anket
  - Çoklu seçim desteği
  - Katılımcı sayısı takibi
  - Anket kapatma

- **Profile Modülü**
  - Kullanıcı profili oluşturma
  - İstatistik takibi (oluşturulan/katılınan anketler)
  - Gamification sistemi
  - Avatar desteği

- **Badge Modülü**
  - NFT badge basımı
  - Tier sistemi (1-3)
  - Extra anket hakları
  - Badge istatistikleri

### UI Özellikleri

- Sui Wallet entegrasyonu
- Anket oluşturma ve yönetimi
- Oylama sistemi
- Profil sayfası
- Badge görüntüleme
- Responsive tasarım

## 📚 Kullanım Örnekleri

Detaylı kullanım örnekleri için [`UI_INTEGRATION_EXAMPLES.md`](./UI_INTEGRATION_EXAMPLES.md) dosyasına bakın.

### Basit Örnek: Anket Oluşturma

```tsx
import { useSuiContracts } from "./utility/useSuiContracts";

function CreatePoll() {
  const { createSurvey, isLoading } = useSuiContracts();

  const handleCreate = async () => {
    await createSurvey({
      title: "En sevdiğiniz programlama dili?",
      description: "Topluluk anketi",
      questions: [{
        prompt: "Hangi dili tercih ediyorsunuz?",
        options: ["JavaScript", "Python", "Rust", "Move"],
        allows_multiple: false,
        max_selections: 1,
      }],
    });
  };

  return (
    <button onClick={handleCreate} disabled={isLoading}>
      Anket Oluştur
    </button>
  );
}
```

## 🔧 Geliştirme

### Move Kontratları Test Etme

```bash
cd move
sui move test
```

### UI Geliştirme

```bash
cd UI
npm run dev        # Geliştirme sunucusu
npm run build      # Production build
npm run lint       # Linting
```

## 📖 Dokümantasyon

- [`DEPLOYMENT.md`](./DEPLOYMENT.md) - Deploy talimatları
- [`UI_INTEGRATION_EXAMPLES.md`](./UI_INTEGRATION_EXAMPLES.md) - UI entegrasyon örnekleri
- [Sui Documentation](https://docs.sui.io/)
- [Move Book](https://move-book.com/)

## 🔐 Güvenlik

- Private key'leri asla commit etmeyin
- AdminCap'i güvenli tutun
- Mainnet'e geçmeden önce testnet'te kapsamlı test yapın
- Gas budget'ı dikkatli ayarlayın

## 🛠️ Teknolojiler

**Blockchain:**
- Sui Blockchain
- Move Programming Language

**Frontend:**
- React 18
- TypeScript
- Sui dApp Kit
- Radix UI
- React Router
- Zustand (state management)
- Recharts (grafikler)

## 📝 Lisans

Bu proje hackathon için geliştirilmiştir.

## 🤝 Katkı

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/AmazingFeature`)
3. Commit edin (`git commit -m 'Add some AmazingFeature'`)
4. Push yapın (`git push origin feature/AmazingFeature`)
5. Pull Request açın

## ❓ Sık Sorulan Sorular

### Deploy sonrası ne yapmalıyım?

Deploy çıktısından aldığınız ID'leri `UI/src/networkConfig.ts` dosyasına yazın.

### Testnet SUI token'ı nasıl alabilirim?

Sui Discord sunucusundaki faucet kanalını kullanın veya:
```bash
curl --location --request POST 'https://faucet.testnet.sui.io/gas' \
--header 'Content-Type: application/json' \
--data-raw '{"FixedAmountRequest": {"recipient": "YOUR_ADDRESS"}}'
```

### Transaction hatası alıyorum?

- Yeterli gas var mı kontrol edin
- Doğru network'te misiniz? (testnet/mainnet)
- Contract ID'leri doğru mu?
- Wallet bağlı mı?

## 📧 İletişim

Sorularınız için GitHub Issues kullanın.

---

**Not**: Bu proje aktif geliştirme aşamasındadır. Production kullanımından önce kapsamlı güvenlik denetimi yapılmalıdır.
