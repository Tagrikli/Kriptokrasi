const MSG = {

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
  }



};

MSG.ORNEK_FUNC(123);

export default MSG;