"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const logger_1 = __importDefault(require("../Logger/logger"));
const path_1 = __importDefault(require("path"));
class ConfigParser {
    config_path = '';
    _config;
    _user;
    constructor() {
        this.config_path = path_1.default.join(__dirname, '..', '..', 'credentials.json');
        this._user = process.env.NODE_USER;
        this.loadConfig();
    }
    loadConfig() {
        try {
            this._config = JSON.parse(fs_1.default.readFileSync(this.config_path, { encoding: 'utf8' }));
            logger_1.default.info('Config file provided');
        }
        catch {
            logger_1.default.warn('Provide the config file "credentials.json"');
            process.exit(1);
        }
    }
    saveConfig() {
        try {
            fs_1.default.writeFileSync(this.config_path, JSON.stringify(this._config), { encoding: 'utf8' });
            logger_1.default.debug('Config file updated');
        }
        catch {
            logger_1.default.warn('Config file update failed');
        }
    }
    get credentials() {
        return this._config[this._user];
    }
    set credentials(data) {
        this._config[this._user] = data;
        this.saveConfig();
    }
    saveSession(session) {
        this._config[this._user].app.session = session;
        this.saveConfig();
    }
}
exports.default = ConfigParser;
