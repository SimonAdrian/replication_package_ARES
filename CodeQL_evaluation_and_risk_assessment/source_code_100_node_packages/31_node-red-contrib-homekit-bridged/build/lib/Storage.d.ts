import { CharacteristicEventTypes, SerializedAccessory, SerializedService } from 'hap-nodejs';
import storage, { InitOptions } from 'node-persist';
import { SerializedHostType } from './types/storage/SerializedHostType';
import { StorageType } from './types/storage/StorageType';
type EventCallback = {
    event: CharacteristicEventTypes;
    callback: (value?: any) => void;
};
export declare class Storage {
    private static customStoragePath;
    private static storageInitialized;
    private static memoryStorage;
    private static log;
    static storagePath(): string;
    static init(...storagePathSegments: string[]): Promise<InitOptions>;
    static save(type: StorageType, key: string | undefined, value: unknown): Promise<storage.WriteFileResult>;
    static saveCallback(eventCallback: EventCallback, ttl?: number): string;
    static saveCustomCharacteristics(value: unknown): Promise<storage.WriteFileResult>;
    static saveService(key: string, value: unknown): Promise<storage.WriteFileResult>;
    static saveAccessory(key: string, value: unknown): Promise<storage.WriteFileResult>;
    static saveHost(key: string, serializedHost: SerializedHostType): Promise<storage.WriteFileResult>;
    static load(type: StorageType, key?: string): Promise<any>;
    static loadCallback(key: string): EventCallback | undefined;
    static loadCustomCharacteristics(): Promise<any>;
    static loadService(key: string): Promise<SerializedService>;
    static loadAccessory(key: string): Promise<SerializedAccessory>;
    static loadHost(key: string): Promise<SerializedHostType>;
    static uuid4Validate(uuid: string): boolean;
}
export {};
