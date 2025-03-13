import { NodeStatus } from '@node-red/registry';
import NodeType from '../types/NodeType';
type StatusType = 'NO_RESPONSE' | 'MSG';
type NodeStatusWithType = NodeStatus & {
    type?: StatusType;
};
type Status = string | NodeStatusWithType;
export declare class NodeStatusUtils {
    private node;
    protected lastStatusId?: number;
    protected lastStatusType?: StatusType;
    constructor(node: Pick<NodeType, 'status'>);
    setStatus(status: Status, timeout?: number): number;
    clearStatusByType(type: StatusType): void;
    clearStatus(statusId?: number, timeout?: number): void;
}
export {};
