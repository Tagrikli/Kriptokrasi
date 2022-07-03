const MSG = {
  UNKNOWN_ERROR: { tr: "Bir şeyler yanlış gitti, yeniden deneyiniz.", en: "Something went wrong, please try again."},

  CHOOSE_ACTION : {tr: "Seçiminizi yapınız.",en:  "Please choose an action."},

  WAIT_10_SECS: { tr:'⏰⏰ Lütfen mesaj atmadan önce 10 saniye bekleyin.', en:'⏰⏰ Please wait for 10 seconds before you send a message.'},

  SELECT_LANGUAGE : `
Lütfen dil seçiniz...
Please select a language...
`,
  NOT_ADVISE: {
    tr: 'Yatırım Tavsiyesi Değildir. Stopsuz işlem yapmayınız.',
    en: 'It is not an invesment advise. Please use StopLoss in your orders.'
  },
  
  CHOOSE_DATA: {
    tr: 'Data seçiniz.',
    en: 'Choose your information type'
  },

  REQUEST_PRIVATE : {tr: 'Botu kullanabilmek için bota özel mesaj atınız.', en: 'Please send private messages to be able to use the bot.'},

  GET_MEMBERSHIP: {tr: 'Botu kullanabilmek için üye olunuz. Detaylı bilgi @kriptokrasibilgilendirme_bot da. Lütfen tıklayıp botu başlatınız.',
   en: 'Sign up to use the bot. For more information: @kriptokrasibilgilendirme_bot . Click to start the bot.'},

  WRITE_LS: {
    tr: "ls yazıp parite giriniz. ör: ls btc-usdt.",
    en: "write ls and enter a pair. eg: ls btc-usdt."
  },

  WRITE_GLS: {
    tr: "gls yazıp coin ismi giriniz. ör: gls btc",
    en: "write gls and enter a coin symbol. eg: gls btc"
  },

  WRITE_SYMB: {
    tr: "symb yazip sembol seciniz. ör: symb btc",
    en: "write symb and enter a coin symbol eg: symb btc"
  },

  WRITE_PARA: {
    tr: "para yazıp istediğiniz coinleri yazınız. ör: para chz usdt",
    en: "write para and enter two coin names. eg: para chz usdt"
  },

  WRITE_MP: {
    tr: "mp yazip parite seçiniz. ör: mp btcusdt",
    en: "write mp and enter a pair. eg: mp btcusdt"
  },

  WRITE_PA : {
    tr: "pa yazip parite seçiniz. ör: pa btc-usdt",
    en: "write pa and enter a pair. eg: pa btc-usdt"
  },

  WRITE_24H: {
    tr:"24h yazıp parite seçiniz. ör: 24saat btc-usdt",
    en: "write 24h and enter a pair. eg: 24saat btc-usdt"
  },

  CHOOSE_TF: {
    tr: "Zaman aralığı seçiniz.",
    en: "Choose a timeframe."
  },

  CHOOSE_SOURCE:{
    tr: "Kaynak seçiniz:",
    en: "Choose a source:"
  },

  CHOOSE_STOCK:{
    tr:"Borsa türünü seçiniz:",
    en: "Choose a stock type:"
  },

  GENERAL_ERROR: {
    tr: "Bir hata olustu",
    en: "Something is wrong."
  },
  INVALID_REQUEST: {
    tr: "Gecersiz istek",
    en: "Invalid Request"
  },
  ORNEK_FUNC: (a) => { 
    return "Selamlar";
  },
  LONGSHORT_ERROR: {
    tr: `Coin yazmayı tekrar deneyin. ör: ls btc-usdt`,
    en: 'Try writing the coin name again. ex: ls btc-usdt'
  }, 
  LONGSHORT: (ratio1, pressure1, ratio2, pressure2, ratio3, pressure3, ratio4, pressure4, language, delta1, delta2, delta3, delta4) => {
    if (language == 'TR'){
      let tr= `15 Dakika -> Ratio: ${ratio1} -> ${pressure1} -> Delta: ${delta1} \n 1 Saat -> Ratio: ${ratio2} -> ${pressure2} -> Delta: ${delta2} \n 4 Saat -> Ratio: ${ratio3} -> ${pressure3} -> Delta: ${delta3} \n 1 Gün -> Ratio: ${ratio4} -> ${pressure4} -> Delta: ${delta4}`
      return tr;
    }
    let en =  `15 Minutes ->  Ratio: ${ratio1} -> ${pressure1} \n 1 Hour -> Ratio: ${ratio2} -> ${pressure2} \n 4 Hours -> Ratio: ${ratio3} -> ${pressure3} \n 1 Day -> Ratio: ${ratio4} -> ${pressure4}`
    return en;
  },
  CURRENTLS_ERROR: {
    tr: `Coin yazmayı tekrar deneyin. ör: gls btc`,
    en: 'Try writing the coin name again. ex: gls btc'
  },
  ERROR: {
    tr: 'Yazdığınız coinde bir yanlışlık var.',
    en: 'There is something wrong with the coin you entered.'
  },
  TRENDSORGU: (trend, sell, buy, language) => {
    if (language == 'TR'){
      let tr = `Trend Skoru: ${trend} \n Alış Baskısı: ${sell} \n Satış Baskısı: ${buy}`
      return tr;
    }
    let en = `Trend Score: ${trend} \n Buy Pressure: ${sell} \n Sell Pressure: ${buy}`
    return en;
  },
  VOLUMEFLOW_ERROR:{
    tr: `Coinleri yazmayı tekrar deneyin. ör: para btc usdt`,
    en: 'Try writing the coin again. eg: para btc usdt'
  },
  HOUR24:(language, buy, sell) =>{
    if (language == 'TR')
      {let tr = `Alış: ${buy}  Satış: ${sell}`;
      return tr;}
    let en =`Buy: ${buy}  Sell: ${sell}`;
    return en
  }, 
  HOUR24_NOCOIN: {
    tr: `Coin ve borsa türü uyumsuz veya hatalı`,
    en: 'Mismatched or wrong coin and stock'
  }, 

  TICKERLIST: (language,mp, symb, price, usd, high, low, vol24, ch24h, ch1h, ch7h, ch30d, ch90d, chytd )=> {
    if (language == 'TR')
    {let tr = 
    `parite: ${mp}
    coinin adı: ${symb}
    fiyat: ${price}
    usd fiyatı: ${usd}
    en yüksek: ${high}
    en alçak: ${low}
    24 saatlik volume: ${vol24}
    24 saatlik değişim: ${ch24h}
    1 saatlik değişim: ${ch1h}
    7 günlük değişim: ${ch7h}
    30 günlük değişim: ${ch30d}
    90 günlük değişim: ${ch90d}
    yıllık değişim: ${chytd}`;
    return tr;}
    else {
    let en = `
    pair: ${mp}
    coin symbol: ${symb}
    price: ${price}
    usd price: ${usd}
    high price: ${high}
    low price: ${low}
    24 hours volume: ${vol24}
    24 hours change: ${ch24h}
    1 hour change: ${ch1h}
    7 days change: ${ch7h}
    30 days change: ${ch30d}
    90 days change: ${ch90d}
    yearly change: ${chytd}`;
    return en;
    }
  }

};

//MSG.ORNEK_FUNC(123);

export default MSG; 