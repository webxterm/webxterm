import {DataTypeValue} from "./DataTypeValue";

export class DataBlock2 {

    public static isSecondary(chr: string): boolean {
        return DataTypeValue.SECONDARY == chr;
    }

}