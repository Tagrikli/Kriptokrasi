import winston from "winston";

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



export const logger = winston.createLogger({
    transports: [
        new winston.transports.File({ format: file_format, filename: './logs/kriptokrasi.log' }),
        new winston.transports.Console({ format: console_format })
    ],
    level: 'debug'
})

