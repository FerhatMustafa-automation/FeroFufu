# FeroFUFU – Karakter Turnuvası 🎲

Modern, responsive ve modüler bir UwUFUFU turnuva web sitesi.

## Proje Yapısı

```
FeroFufu/
├── index.html       # Ana HTML yapısı
├── style.css        # Dark tema, animasyonlar, responsive CSS
├── script.js        # Turnuva motoru, karakter verisi, modüler mimari
├── images/          # Karakter görselleri buraya koyulacak
│   ├── karamel.png
│   ├── zephyra.png
│   ├── throndir.png
│   ├── liora.png
│   ├── morbex.png
│   ├── sera.png
│   ├── vex.png
│   └── borak.png
└── README.md
```

## Kendi Karakterlerini Nasıl Eklersin?

`script.js` dosyasındaki `dndCharacters` dizisini düzenle:

```js
const dndCharacters = [
  {
    id: 1,
    name: "Karakterin Adı",
    image: "images/karakter.png",   // <-- images/ klasörüne koy
    description: "Kısa açıklama.",
    class: "Bard",                  // Karakter sınıfı
    color: "#f59e0b"                // Renk (placeholder için)
  },
  // ...
];
```

## Gelecek Modüller

- `lol` – LoL Karakterleri (Yakında)
- `funny_moments` – Komik Anlar (Yakında)

Yeni kategori eklemek için `script.js` içindeki `categories` objesine yeni bir giriş ekle
ve `loadCategory()` fonksiyonuna case ekle.

## Nasıl Çalıştırılır?

Herhangi bir statik dosya sunucusuyla açabilirsin:

```bash
# VS Code Live Server ile aç
# veya
npx serve .
# veya doğrudan index.html'yi tarayıcıda aç
```
