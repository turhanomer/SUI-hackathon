# Move Kontratlarını Deploy Etme Rehberi

Bu rehber, Move kontratlarınızı Sui blockchain'e deploy etme ve UI'ı konfigüre etme adımlarını içerir.

## 1. Sui CLI Kurulumu

Eğer henüz Sui CLI kurulu değilse:

```bash
cargo install --locked --git https://github.com/MystenLabs/sui.git --branch testnet sui
```

## 2. Cüzdan Oluşturma / İçe Aktarma

```bash
# Yeni cüzdan oluştur
sui client new-address ed25519

# Aktif adresi kontrol et
sui client active-address

# Testnet için SUI token al
# https://discord.com/channels/916379725201563759/971488439931392130 adresinden faucet kullan
```

## 3. Move Kontratlarını Derleme

```bash
cd move
sui move build
```

Herhangi bir hata varsa düzeltin.

## 4. Deploy Etme

```bash
sui client publish --gas-budget 100000000
```

Deploy işlemi başarılı olduğunda, aşağıdaki bilgileri not alın:

### Önemli Çıktılar:

1. **Package ID**: `0x...` - Ana paket ID'si
2. **ProfileRegistry Object ID**: ProfileRegistry shared object'in ID'si
3. **UserSurveyLimit Object ID**: UserSurveyLimit shared object'in ID'si
4. **BadgeStats Object ID**: BadgeStats shared object'in ID'si
5. **AdminCap Object ID**: Admin capability ID (badge basımı için)

Örnek çıktı:
```
╭──────────────────────────────────────────────────────────────────────────╮
│ Object Changes                                                            │
├──────────────────────────────────────────────────────────────────────────┤
│ Created Objects:                                                          │
│  ┌──                                                                      │
│  │ ObjectID: 0xABCD... <-- Bu Package ID                                │
│  │ Sender: 0x...                                                         │
│  │ Owner: Immutable                                                      │
│  │ ObjectType: 0x2::package::UpgradeCap                                 │
│  └──                                                                      │
│  ┌──                                                                      │
│  │ ObjectID: 0xDEF... <-- ProfileRegistry (Shared)                      │
│  │ Sender: 0x...                                                         │
│  │ Owner: Shared                                                         │
│  │ ObjectType: 0xABCD::profile::ProfileRegistry                         │
│  └──                                                                      │
│  ┌──                                                                      │
│  │ ObjectID: 0xGHI... <-- UserSurveyLimit (Shared)                      │
│  │ Sender: 0x...                                                         │
│  │ Owner: Shared                                                         │
│  │ ObjectType: 0xABCD::survey::UserSurveyLimit                          │
│  └──                                                                      │
│  ┌──                                                                      │
│  │ ObjectID: 0xJKL... <-- BadgeStats (Shared)                           │
│  │ Sender: 0x...                                                         │
│  │ Owner: Shared                                                         │
│  │ ObjectType: 0xABCD::badge::BadgeStats                                │
│  └──                                                                      │
│  ┌──                                                                      │
│  │ ObjectID: 0xMNO... <-- AdminCap (Owned)                              │
│  │ Sender: 0x...                                                         │
│  │ Owner: Account Address ( 0x... )                                     │
│  │ ObjectType: 0xABCD::badge::AdminCap                                  │
│  └──                                                                      │
╰──────────────────────────────────────────────────────────────────────────╯
```

## 5. UI Konfigürasyonu

Deploy sonrası aldığınız ID'leri `/UI/src/networkConfig.ts` dosyasına ekleyin:

```typescript
export const VOTING_SYSTEM_CONFIG = {
  testnet: {
    PACKAGE_ID: "0xABCD...", // Yukarıdan aldığınız Package ID
    PROFILE_REGISTRY_ID: "0xDEF...", // ProfileRegistry shared object ID
    USER_SURVEY_LIMIT_ID: "0xGHI...", // UserSurveyLimit shared object ID
    BADGE_STATS_ID: "0xJKL...", // BadgeStats shared object ID
    ADMIN_CAP_ID: "0xMNO...", // AdminCap object ID
  },
  // devnet ve mainnet için aynı şekilde doldurun
};
```

## 6. UI'ı Test Etme

```bash
cd UI
npm install
npm run dev
```

Tarayıcıda http://localhost:5173 adresine gidin ve:

1. Sui Wallet ile bağlanın
2. Profil oluşturun
3. Anket oluşturun
4. Ankete katılın

## 7. Kontratları Explorer'da Görüntüleme

Testnet için:
```
https://suiexplorer.com/object/[PACKAGE_ID]?network=testnet
```

## Sık Karşılaşılan Sorunlar

### Gas yetersiz
```bash
# Testnet faucet kullanın
curl --location --request POST 'https://faucet.testnet.sui.io/gas' \
--header 'Content-Type: application/json' \
--data-raw '{
    "FixedAmountRequest": {
        "recipient": "YOUR_ADDRESS"
    }
}'
```

### Kontratta hata
```bash
# Testleri çalıştırın
cd move
sui move test
```

### Package upgrade
```bash
# Upgrade için UpgradeCap'i kullanın
sui client upgrade --upgrade-capability [UPGRADE_CAP_ID] --gas-budget 100000000
```

## Güvenlik Notları

1. **AdminCap**'i güvenli tutun - Badge basım yetkisi verir
2. **Private keys**'i asla GitHub'a commit etmeyin
3. **Mainnet**'e deploy etmeden önce testnet'te kapsamlı test yapın
4. **Gas budget**'ı işlem karmaşıklığına göre ayarlayın

## Ek Kaynaklar

- [Sui Documentation](https://docs.sui.io/)
- [Move Book](https://move-book.com/)
- [Sui Examples](https://github.com/MystenLabs/sui/tree/main/examples)
