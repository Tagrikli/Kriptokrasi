"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const message_data_1 = __importDefault(require("./message_data"));
var LANG;
(function (LANG) {
    LANG[LANG["TR"] = 0] = "TR";
    LANG[LANG["EN"] = 1] = "EN";
})(LANG || (LANG = {}));
;
class MessageGenerator {
    data;
    user_lang_data;
    constructor(user_lang_data) {
        this.data = message_data_1.default;
        this.user_lang_data = user_lang_data;
    }
    getMessage(user_id, message) {
        let lang_pref = this.user_lang_data[user_id];
        return this.data[message][lang_pref];
    }
}
exports.default = MessageGenerator;
