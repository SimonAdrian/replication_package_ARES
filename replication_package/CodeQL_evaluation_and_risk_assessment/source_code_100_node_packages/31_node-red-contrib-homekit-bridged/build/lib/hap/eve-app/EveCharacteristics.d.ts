import CustomCharacteristicType from '../../types/CustomCharacteristicType';
import HAPCharacteristic from '../HAPCharacteristic';
declare const EveCharacteristics: CustomCharacteristicType[];
export declare class EveS2R1 extends HAPCharacteristic {
    static readonly UUID: string;
    constructor();
}
export declare class EveS2R2 extends HAPCharacteristic {
    static readonly UUID: string;
    constructor();
}
export declare class EveS2W1 extends HAPCharacteristic {
    static readonly UUID: string;
    constructor();
}
export declare class EveS2W2 extends HAPCharacteristic {
    static readonly UUID: string;
    constructor();
}
export default EveCharacteristics;
