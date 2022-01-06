import fs, { read } from 'fs';
import { logger } from '../Logger/logger';

type TConfigData = {
    credentials: {
        api_id: number,
        api_hash: string,
        session_string: string,
        telegram_token: string,
    },
    network: {
        express_port: number
    }
}



class ConfigParser {
    filename = 'krconfig.json'
    _config: TConfigData

    constructor() {
        this.loadConfig();
    }

    loadConfig() {
        try {
            this._config = JSON.parse(fs.readFileSync('krconfig.json', { encoding: 'utf8' }));
            logger.info('Config file provided')
        } catch {
            logger.warn('Provide the config file "krconfig.json"');
            process.exit(1);
        }
    }

    saveConfig() {
        try {
            fs.writeFileSync('krconfig.json', JSON.stringify(this._config), { encoding: 'utf8' });
            logger.info('Config file updated');
        } catch {
            logger.warn('Config file update failed');
        }
    }

    get data() {
        return this._config;
    }

    set data(data: TConfigData) {
        this._config = data;
    }

}


const config = new ConfigParser();
export default config;