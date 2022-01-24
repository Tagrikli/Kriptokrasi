"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Queries = exports.QueryList = void 0;
const errors_1 = require("./utils/errors");
class QueryList {
    queries;
    constructor() {
        this.queries = {};
    }
    newQuery(chat_id, context) {
        this.queries[chat_id] = { context: context, data: [] };
    }
    addData(chat_id, data) {
        let query = this.queries[chat_id];
        if (query) {
            query.data.push(data);
        }
        else {
            throw new Error(errors_1.ERROR_MESSAGES.NAN_QUERY);
        }
    }
    addDataSafe(chat_id, context, data) {
        let query = this.queries[chat_id];
        if (query) {
            if (query.context === context) {
                query.data.push(data);
            }
            else {
                throw new Error(errors_1.ERROR_MESSAGES.INV_CONTX);
            }
        }
        else {
            throw new Error(errors_1.ERROR_MESSAGES.NAN_QUERY);
        }
    }
    getContext(chat_id) {
        let query = this.queries[chat_id];
        if (query) {
            return query.context;
        }
        else {
            throw new Error(errors_1.ERROR_MESSAGES.NAN_CONTX);
        }
    }
    getQuery(chat_id) {
        return this.queries[chat_id];
    }
    removeQuery(chat_id) {
        delete this.queries[chat_id];
    }
}
exports.QueryList = QueryList;
exports.Queries = new QueryList();
