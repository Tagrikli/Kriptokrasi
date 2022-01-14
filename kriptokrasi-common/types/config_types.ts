export type TConfigCredential = {
    app: {
        api_id: number,
        api_hash: string,
        session: string
    },
    bot: {
        token: string
    }
}

export type TConfigData = {
    credentials: {
        [user: string]: TConfigCredential
    },
    network: {
        express_port: number
    }
}