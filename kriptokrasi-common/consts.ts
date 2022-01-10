import CONFIG from './config.json'

export const MESSAGES = {

    ERROR: {

        ORDER: {
            ADD: 'Emir(ler) eklenemedi :(',
            DELETE: 'Emir(ler) silinemedi :(',
            ACTIVATE: 'Emir(ler) aktive edilemedi :(',
        },

        SERVER: {
            INTERNAL: 'Serverda bir hata mevcut :('
        }


    },

    SUCCESS: {


        ORDER: {
            ADD: 'Emir(ler) eklendi!',
            DELETE: 'Emir(ler) silindi!',
            ACTIVATE: 'Emir(ler) aktive edildi!',
        },
    }



}

export const BASE_URL = () => `${window.location.origin}:${CONFIG.network.express_port}`;

