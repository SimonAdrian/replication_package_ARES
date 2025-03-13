"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeStatusUtils = void 0;
const DEFAULT_STATUS_TYPE = 'MSG';
class NodeStatusUtils {
    constructor(node) {
        this.node = node;
    }
    setStatus(status, timeout) {
        var _a;
        this.node.status(status);
        const newStatusId = new Date().getTime();
        this.lastStatusId = newStatusId;
        if (typeof status !== 'string') {
            this.lastStatusType = (_a = status.type) !== null && _a !== void 0 ? _a : DEFAULT_STATUS_TYPE;
        }
        else {
            this.lastStatusType = DEFAULT_STATUS_TYPE;
        }
        if (timeout) {
            this.clearStatus(newStatusId, timeout);
        }
        return newStatusId;
    }
    clearStatusByType(type) {
        if (this.lastStatusType === type) {
            this.clearStatus();
        }
    }
    clearStatus(statusId, timeout) {
        if (statusId !== undefined) {
            if (statusId === this.lastStatusId) {
                if (timeout) {
                    setTimeout(function (nodeStatusUtil) {
                        nodeStatusUtil.clearStatus(statusId);
                    }, timeout, this);
                }
                else {
                    this.setStatus('');
                }
            }
        }
        else {
            this.setStatus('');
        }
    }
}
exports.NodeStatusUtils = NodeStatusUtils;
