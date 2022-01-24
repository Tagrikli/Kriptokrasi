"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KEYBOARDS = void 0;
const telegraf_1 = require("telegraf");
const consts_1 = require("./consts");
const lodash_1 = __importDefault(require("lodash"));
let KEYBOARDS;
exports.KEYBOARDS = KEYBOARDS;
exports.KEYBOARDS = KEYBOARDS = Object.create({});
for (const [key, value] of Object.entries(consts_1.BUTTON_LIST)) {
    KEYBOARDS[key] = telegraf_1.Markup.keyboard(lodash_1.default.chunk(value, 3)).resize().reply_markup;
}
