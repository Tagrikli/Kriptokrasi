"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EStatus = exports.EType = exports.EPosition = exports.ECompare = void 0;
var ECompare;
(function (ECompare) {
    ECompare[ECompare["EQ"] = 0] = "EQ";
    ECompare[ECompare["GT"] = 1] = "GT";
    ECompare[ECompare["LT"] = 2] = "LT";
    ECompare[ECompare["GTE"] = 3] = "GTE";
    ECompare[ECompare["LTE"] = 4] = "LTE";
})(ECompare = exports.ECompare || (exports.ECompare = {}));
var EPosition;
(function (EPosition) {
    EPosition[EPosition["LONG"] = 0] = "LONG";
    EPosition[EPosition["SHORT"] = 1] = "SHORT";
})(EPosition = exports.EPosition || (exports.EPosition = {}));
var EType;
(function (EType) {
    EType[EType["SPOT"] = 0] = "SPOT";
    EType[EType["VADELI"] = 1] = "VADELI";
})(EType = exports.EType || (exports.EType = {}));
var EStatus;
(function (EStatus) {
    EStatus[EStatus["WAITING"] = 0] = "WAITING";
    EStatus[EStatus["ACTIVE"] = 1] = "ACTIVE";
    EStatus[EStatus["PAST"] = 2] = "PAST";
})(EStatus = exports.EStatus || (exports.EStatus = {}));
