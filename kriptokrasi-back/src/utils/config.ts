import fs from 'fs';
import { logger } from '../Logger/logger';
import path from 'path';
import { TConfigCredential, TConfigData } from '../kriptokrasi-common/types';





class ConfigParser {
    config_path = ''
    _config: TConfigData
    _user: string

    constructor() {

        this.config_path = path.join(__dirname, '..', 'kriptokrasi-common', 'config.json');
        this._user = process.env.NODE_USER
        this.loadConfig();
    }

    loadConfig() {
        try {
            this._config = JSON.parse(fs.readFileSync(this.config_path, { encoding: 'utf8' }));
            logger.info('Config file provided')
        } catch {
            logger.warn('Provide the config file "krconfig.json"');
            process.exit(1);
        }
    }

    saveConfig() {
        try {
            fs.writeFileSync(this.config_path, JSON.stringify(this._config), { encoding: 'utf8' });
            logger.info('Config file updated');
        } catch {
            logger.warn('Config file update failed');
        }
    }

    get credentials(): TConfigCredential {
        return this._config.credentials[this._user];
    }

    set credentials(data: TConfigCredential) {
        this._config.credentials[this._user] = data;
    }

    get network() {
        return this._config.network;
    }



}


const config = new ConfigParser();
export default config;