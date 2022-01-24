"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HELP_TEXT = exports.vadeli_egitimi = exports.trade_egitimi = exports.OKUDUM_ANLADIM = exports.BUTTON_LIST = void 0;
exports.BUTTON_LIST = {
    INDICATOR: ["RSI", "MACD", "SMA", "EMA", "MA", "ATR", "CCI"],
    SOURCE: ["Açılış", "Kapanış", "En Yüksek", "En Alçak", "Volume"],
    //DATA: ["Indikatorler", "Long-Short", "Gunluk Long-Short", "Likidite (Toplam)", "Likidite (BTC Ozel)", "Likidite (Bitmex Ozel)", "Trend Sorgu", "Hizli Hareket", "Hacim Akisi", "Balina Ticareti", "Canli Ticaret", "24 Saatlik Islem Hacmi", "OHLCV", "Gunluk Volume", "Saatlik Volume", "Birlestirilmis Volume", "TickerList", "Acik Kar"]
    DATA: ["Long-Short", "Günlük Long-Short", "Likidite (Toplam)", "Trend Sorgu", "Hacim Akışı", "24 Saatlik İşlem Hacmi", "Coin GBT",],
    TIMEFRAME: ['5 Dakika', '15 Dakika', '30 Dakika', '1 Saat', '4 Saat', '1 Gun'],
    EXCHANGE: ['Spot', 'Vadeli'],
    STOCK: ['Binance', 'Binance_Futures', 'Bitmex'],
    INITIAL: ['Bekleyen Emirler', 'Aktif İşlemler', 'Geçmiş İşlemler', 'Yardım', 'Eğitim', 'Anlık Data'],
    LESSON: ["Trade Eğitimi", "Vadeli İşlem ve Borsa Eğitimi"]
};
exports.OKUDUM_ANLADIM = `Burada yer alan yatırım bilgi, yorum ve tavsiyeler yatırım danışmanlığı kapsamında değildir. Yatırım danışmanlığı hizmeti, aracı kurumlar, portföy yönetim şirketleri, mevduat kabul etmeyen bankalar ile müşteri arasında imzalanacak yatırım danışmanlığı  sözleşmesi çerçevesinde sunulmaktadır. Burada yer alan yorumlar, olusturulan algoritmaya dayanmaktadır. Bu veriler mali durumunuz ile risk getiri  tercihlerinize uygun olmayabilir. Bu nedenle, sadece burada yer  alan bilgilere dayanılarak yatırım kararı verilmesi beklentilerinize  uygun sonuçlar doğurmayabilir. 

Kriptokrasi Telegram botu bağlı olduğu telegram ve twitter hesaplarindan sağlanan bilgiler ve paylaşılan materyallerin hiçbiri , herhangi bir yatırım veya alım satım yapmanız için bir teklif yada teşvik niteliği taşımaz. Her türlü yatırım ve işlemi kendi araştırmanızı yaparak kendi namınıza yapmakta olduğunuzu kabul ediyorsunuz. Ana paranızdan edeceğiniz zararı kabullenmeye hazırlıklı olmadığınız sürece yatırım yapmayınız ! İşlemlerin risk taşıdığını ve uzman olmayan kişilerin bu işlemleri kolayca anlamalarının mümkün olmadığını bilmeniz gerekir. 

Kriprokrasi Telegram botu ve bagli oldugu telegram kanali , twitter sayfası yatırım ve işlemlerinizden sorumlu değildir. 

Bu bot kisiye özel paylasim yapmaz ! Bu bot size bakiyeniz ile ilgili sorgulama yapmaz. Yonlendirmede bulunmaz. Herhangi bir islemde kesin kazanç vaad etmez. Coinin fiyatini arttirma yada dusurme gibi durumlari kesinlikle yapmaz. Paraniz kendi kontrolunuzde ve kisisel iradeniz ile yonetilir. Bu botu bir indikator olarak değerlendirip bakiyenizi kendi tasarrufunuz ile kullandığınızı kabul ediyorsunuz. 

Paylasimlar Herhangi bir tavsiye niteliği tasimamakla birlikte risk tarafiniza aittir. 

Aşağıda yazan okudum anladim butonuna tikladiginizda yukarida yazan tum maddeleri kabul etmis olucaksiniz ve bu durum sistem tarafindan her kişi icin kayıt altina alinicaktir. Sozlesmeyi onaylamadan botu calistiramazsiniz. 

Teşekkür eder bol kazançlar dileriz.`;
exports.trade_egitimi = `Eğitim içeriği

☄️Grafik çizimi ve Yön bulma
+Destek-Direnç çizimi
+Tepki Noktaları
+Kar Realize etmek
+Doğru Trend Nasıl Bulunur ? 

☄️Algoritmalar 

☄️Üst Düzey İndikatör Eğitimi (Kilit Noktalar) (6 Adet)
+İndikatörlerin Kombinasyonları 
+Birbirini Seven İndikatörler

☄️Sermaye ve Psikoloji Yönetimi
+Bakiyemi Hangi Oranlarda Kullanmalıyım ?
+Panik satışı 
+Erken ve ya geç STOP atarak istenilenden fazla zarar edilmesi

☄️Pozisyon Yönetimi (önemli)

+Terste kalınan işlem nasıl kurtarılır? 
+Giriş fiyatı ve Likidasyon Dengesi Nasıl Ayarlanır ? 
+İşleme Nerede ekleme yapılır ? 
+Ekleme Ne Kadar Yapılmalıdır ? 
+Doğru Ekleme Nedir ?

** dersler video ile değil canlı ders şeklinde olmaktadır.

iletişim @Ayca1 @TheKingOfNorthh`;
exports.vadeli_egitimi = `vadeli işlem ve borsa eğitimi 

* spot alım satım kuralları 
* spot işlem komut mantıkları ve kuralları 
* uygulamalı spot alım satım ve komut kullanımı
* vadeli işlem mantığı 
* vadeli işlemde kar hesaplama
* vadeli işlemde doğru bakiye oranı belirleme 
* Vadeli işlem ile spot işlemin farkı
* Uygulamalı vadeli işlem açma 
* Uygulamalı komut kullanımı ve mantığının anlaşılması

** dersler video ile değil canlı ders şeklinde olmaktadır.

iletişim @Ayca1 @TheKingOfNorthh`;
exports.HELP_TEXT = `Birden fazla işlem olduğunda tek bir işlemi takip etmek için: 
coin xrp
Geçmiş işlemlerde tek bir coinin kar zarar durumunu aramak için:
geçmiş xrp`;
