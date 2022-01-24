"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importDefault(require("winston"));
const custom_levels = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
    index: 4,
    database: 5,
    tele_app: 6,
    tele_bot: 7,
    express: 8,
    binance: 9,
    brain: 10
};
const custom_colors = {
    error: 'inverse red',
    warn: 'inverse yellow',
    info: 'inverse green',
    debug: 'inverse blue',
    index: 'inverse underline green',
    database: 'inverse underline magenta',
    tele_app: 'inverse underline red',
    tele_bot: 'inverse underline yellow',
    express: 'inverse underline blue',
    binance: 'inverse underline cyan',
    brain: 'inverse underline white'
};
const console_format = winston_1.default.format.combine(winston_1.default.format(info => ({ ...info, level: info.level.toUpperCase() }))(), winston_1.default.format.colorize(), winston_1.default.format.timestamp({ format: 'HH:mm:ss' }), winston_1.default.format.align(), winston_1.default.format.printf(info => `${info.timestamp} [${info.level}] ${info.message}`));
const file_format = winston_1.default.format.combine(winston_1.default.format(info => ({ ...info, level: info.level.toUpperCase() }))(), winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.default.format.printf(info => `[${info.timestamp}] [${info.level}] - [${info.message}]`));
winston_1.default.addColors(custom_colors);
const logger = winston_1.default.createLogger({
    levels: custom_levels,
    transports: [
        new winston_1.default.transports.File({ format: file_format, filename: './logs/kriptokrasi.log' }),
        new winston_1.default.transports.Console({ format: console_format })
    ],
    level: 'brain'
});
exports.default = logger;
