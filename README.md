<<<<<<< HEAD
# BioGate - Orijinal Yapı Korunmuş Fullstack Sürüm

Bu sürümde orijinal BioGate tasarımı korunmuştur.

## Yapılanlar

- Orijinal görsel yapı korundu.
- Logo ve üst yazı fontları korunur.
- Sağdaki "Menü" butonu kaldırıldı.
- Dashboard kaldırıldı.
- İletişimdeki "demo talep edin" ifadesi kaldırıldı.
- MongoDB yoktur.
- Ücretli mail servisi yoktur.
- Terminal doğrulama yoktur.
- Kayıt olan kullanıcı otomatik doğrulanır.
- Kullanıcılar `server/data/db.json` içinde kalıcı olarak saklanır.

## Kurulum

Bu klasörde terminal aç:

```bash
npm install
```

`.env.example` dosyasını `.env` olarak kopyala:

```bash
copy .env.example .env
```

Çalıştır:

```bash
npm run dev
```

Aç:

```txt
http://localhost:5000
```

## Kullanım

1. Kayıt Ol butonuna bas.
2. Kurum adı, e-posta ve şifre gir.
3. Hesap otomatik doğrulanır.
4. Giriş yapabilirsin.

## Veriler

Kayıtlı kullanıcılar, iletişim mesajları ve ısı talepleri burada tutulur:

```txt
server/data/db.json
```

## Admin Paneli

Admin paneli sadece `.env` içindeki `ADMIN_EMAILS` listesinde bulunan 4 geliştirici hesabında görünür.

Örnek:

```env
ADMIN_EMAILS=admin1@biogate.com,admin2@biogate.com,admin3@biogate.com,admin4@biogate.com
```

Bu e-postalarla normal kayıt oluşturun. Giriş yapınca üst menüde **Admin Paneli** bağlantısı görünür.

Admin panelinde:
- Gelen ısı talepleri görülür.
- Şehir, sıcaklık, kullanım amacı ve durum takip edilir.
- Talep için kaynak/tesis eşleştirmesi yapılır.
- Eşleşme kayıtları saklanır.


## Kullanıcı Bildirimleri

Admin panelinde bir talep için eşleşme oluşturulduğunda, talebi oluşturan kullanıcıya otomatik bildirim düşer.

Kullanıcı giriş yaptığında üstte **Bildirimler** butonu görünür. Okunmamış bildirim sayısı buton üzerinde yeşil rozet olarak gösterilir.

Bildirimler `server/data/db.json` içindeki `notifications` alanında saklanır.


## Manuel değerlendirme mantığı

Bu sürümde sistem otomatik eşleştirme yapmaz.

Geliştiriciler admin panelinde:
- Mevcut fabrika/ısı kaynaklarını görür.
- Isı isteyen alıcı taleplerini görür.
- Uygun gördüğü kaynak için manuel kayıt oluşturur.
- Bildirim yalnızca ısı alıcısı kullanıcıya gider.
- Fabrika/kaynak tarafına bildirim gitmez.

Bu yapı, gerçek iş modeline daha uygundur: BioGate ekibi aradaki değerlendirme ve operasyonu yönetir.
=======
# BioScript
BioGate: An end-to-end Waste Management &amp; Carbon Optimization System. It uses a Python/JS engine to calculate methane vs. CO2 savings, incentivizing users with "Bio-Points" and rewards. Features specialized dashboards for factories and local vendors to build a circular, prestige-based green economy.
>>>>>>> 1ed06196ae63ea6a1849f6f72bf01941dd3b5099
