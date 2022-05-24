import MSG from './message_data';
import fs from 'fs';
import path from 'path';

enum LANG{
    TR,
    EN,
};


export default class MessageGenerator{

    data:any
    user_lang_data:any

    constructor(user_lang_data: any) {
        this.data = MSG;        
        this.user_lang_data = user_lang_data;
    }

    getMessage(user_id: number, message: string):string {
        let lang_pref = this.user_lang_data[user_id];
        return this.data[message][lang_pref];
    }

}