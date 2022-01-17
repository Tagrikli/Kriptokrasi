
export const MESSAGES = {

    ERROR: {

        MESSAGE: {
            SEND:'Mesaj gönderilemedi :('
        },

        ORDER: {
            ADD: 'Emir eklenemedi :(',
            DELETE: 'Emir silinemedi :(',
            ACTIVATE: 'Emir aktive edilemedi :(',
        },

        SERVER: {
            INTERNAL: 'Serverda bir hata mevcut :('
        },


        INPUT_CHECK: {
            
            STOP_BUY: {
                GT: 'Spot türünde "Alış Fiyatı" "Stop-Loss" değerinden büyük olmalıdır.',
                LT: 'Vadeli türünde "Alış Fiyatı" "Stop-Loss" değerinden küçük olmalıdır.'
            },


            TPS: {
                INC: 'Spot türünde "Take Profit" değerleri küçükten büyüğe olmalıdır.',
                DEC: 'Vadeli türünde "Take Profit" değerleri büyükten küçüğe olmalıdır.',
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