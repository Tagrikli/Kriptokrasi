
export const MESSAGES = {

    ERROR: {

        MESSAGE: {
            SEND:'Mesaj gönderilemedi :('
        },

        ORDER: {
            ADD: 'Emir eklenemedi.',
            DELETE: 'Emir silinemedi.',
            ACTIVATE: 'Emir aktive edilemedi.',
        },

        SERVER: {
            INTERNAL: 'Serverda bir hata mevcut.'
        },

        LOGIN: "Giris bilgileriniz hatali.",

        INPUT_CHECK: {
            
            STOP_BUY: {
                SPOT_LT: 'Spot türünde "Alış Fiyatı" "Stop-Loss" değerinden küçük olmalıdır.',
                VADELI_SHORT_GT: 'Vadeli (Short) türünde "Alış Fiyatı" "Stop-Loss" değerinden küçük olmalıdır.',
                VADELI_LONG_LT: 'Vadeli (Long) türünde "Alış Fiyatı" "Stop-Loss" değerinden büyük olmalıdır.'
            },

            BUY_PRICE: {
                SPOT_LT: 'Spot türünde "Alış Fiyatı" en küçük Take-Profit değerinden küçük olmalıdır.',
                VADELI_SHORT_GT: 'Vadeli (Short) türünde "Alış Fiyatı" en büyük Take-Profit değerinden büyük olmalıdır.',
                VADELI_LONG_LT: 'Vadeli (Long) türünde "Alış Fiyatı" en küçük Take-Profit değerinden küçük olmalıdır.'
            },

            TPS: {
                SPOT_INC: 'Spot türünde "Take Profit" değerleri küçükten büyüğe olmalıdır.',
                VADELI_LONG_INC: 'Vadeli (Long) türünde  "Take Profit" değerleri küçükten büyüğe olmalıdır.',
                VADELI_SHORT_DEC: 'Vadeli (Short) türünde "Take Profit" değerleri büyükten küçüğe olmalıdır.',
            },

            SYMBOL: {
                EMPTY: 'Lütfen sembol seçiniz.'
            }


        }


    },

    SUCCESS: {

        MESSAGE: {
            SEND: 'Mesaj gönderildi!'
        },

        ORDER: {
            ADD: 'Emir eklendi!',
            DELETE: 'Emir silindi!',
            ACTIVATE: 'Emir aktive edildi!',
        },
    }



}