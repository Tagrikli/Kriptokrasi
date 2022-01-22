import winston from "winston";

const custom_levels: winston.config.AbstractConfigSetLevels = {
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
}

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

}

interface CustomLevels extends winston.Logger {
    error: winston.LeveledLogMethod,
    warn: winston.LeveledLogMethod,
    info: winston.LeveledLogMethod,
    debug: winston.LeveledLogMethod,
    index: winston.LeveledLogMethod,
    database: winston.LeveledLogMethod,
    tele_app: winston.LeveledLogMethod,
    tele_bot: winston.LeveledLogMethod,
    express: winston.LeveledLogMethod,
    binance: winston.LeveledLogMethod,
    brain: winston.LeveledLogMethod
}

const console_format = winston.format.combine(
    winston.format(info => ({ ...info, level: info.level.toUpperCase() }))(),
    winston.format.colorize(),
    winston.format.timestamp({ format: 'HH:mm:ss' }),
    winston.format.align(),
    winston.format.printf(info => `${info.timestamp} [${info.level}] ${info.message}`)
);

const file_format = winston.format.combine(
    winston.format(info => ({ ...info, level: info.level.toUpperCase() }))(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(info => `[${info.timestamp}] [${info.level}] - [${info.message}]`)
);

winston.addColors(custom_colors);

const logger = <CustomLevels>winston.createLogger({
    levels: custom_levels,
    transports: [
        new winston.transports.File({ format: file_format, filename: './logs/kriptokrasi.log' }),
        new winston.transports.Console({ format: console_format })
    ],

    level: 'debug'
})



export default logger;