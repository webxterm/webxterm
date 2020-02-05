/**
 * 元数据块
 */
import {Block} from "./Block";

export class MetaDataBlock implements Block {

    private readonly target: HTMLDivElement;

    constructor(element: HTMLDivElement) {
        this.target = element;
    }

    get element(): HTMLDivElement {
        return this.target;
    }
}