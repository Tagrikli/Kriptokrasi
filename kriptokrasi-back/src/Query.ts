import logger from "./Logger/logger";
import { ERROR_MESSAGES } from "./utils/errors";
import { PROC_CONTEXT } from "./utils/types";


interface QuerieObjs {
    [chat_id: number]: {
        context: PROC_CONTEXT;
        data: string[]
    }
}


export class QueryList {
    queries: QuerieObjs

    constructor() {
        this.queries = {};
    }

    newQuery(chat_id: number, context: PROC_CONTEXT) {
        this.queries[chat_id] = { context: context, data: [] };
    }

    addData(chat_id: number, data: any) {

        let query = this.queries[chat_id];

        if (query) {
            query.data.push(data);
        } else {
            throw new Error(ERROR_MESSAGES.NAN_QUERY);
        }
    }

    addDataSafe(chat_id: number, context: PROC_CONTEXT, data: any) {
        let query = this.queries[chat_id];
        if (query) {
            if (query.context === context) {
                query.data.push(data);
            } else {
                throw new Error(ERROR_MESSAGES.INV_CONTX);
            }
        } else {
            throw new Error(ERROR_MESSAGES.NAN_QUERY);
        }
    }

    getContext(chat_id:number) {
        let query = this.queries[chat_id];

        if (query) {
            return query.context;
        } else {
            throw new Error(ERROR_MESSAGES.NAN_CONTX);
        }
    }

    getQuery(chat_id: number) {
        return this.queries[chat_id];
    }

    removeQuery(chat_id: number) {
        delete this.queries[chat_id];
    }


}

export const Queries = new QueryList();