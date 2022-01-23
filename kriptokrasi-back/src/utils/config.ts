import fs from 'fs';
import logger from '../Logger/logger';
import path from 'path';

type TCredential = {
    app: {
        api_id: number,
        api_hash: string,
        session: string
    },
    bot: {
        token: string
    }
}

type TCredentials = {
    [user: string]: TCredential
}


class ConfigParser {
    config_path = ''
    _config: TCredentials
    _user: string

    constructor() {
        this.config_path = path.join(__dirname, '..','..', 'credentials.json');
        this._user = process.env.NODE_USER
        this.loadConfig();
    }

    loadConfig() {
        try {
            this._config = JSON.parse(fs.readFileSync(this.config_path, { encoding: 'utf8' }));
            logger.info('Config file provided')
        } catch {
            logger.warn('Provide the config file "credentials.json"');
            process.exit(1);
        }
    }

    saveConfig() {
        try {
            fs.writeFileSync(this.config_path, JSON.stringify(this._config), { encoding: 'utf8' });
            logger.debug('Config file updated');
        } catch {
            logger.warn('Config file update failed');
        }
    }

    get credentials(): TCredential {
        return this._config[this._user];
    }

    set credentials(data: TCredential) {
        this._config[this._user] = data;
        this.saveConfig();
    }

    saveSession(session: string) {
        this._config[this._user].app.session = session;
        this.saveConfig();
    }
}


export default ConfigParser;