/**
 * buffer：存储多个BufferChain
 * ScreenBuffer = [ BufferChain = [block, block, block], BufferChain, BufferChain, BufferChain, BufferChain, ...]
 */
import {BufferChain} from "./BufferChain";

export class ScreenBuffer {

    // 数据链
    private chains: BufferChain[] = [];

    // 脏链
    private dirtyChains: BufferChain[] = [];

    /**
     * 添加缓冲区链
     * @param chain
     * @param index
     */
    public addChain(chain: BufferChain, index: number = -1) {
        if (index < 0) {
            this.chains.push(chain);
        } else {
            this.chains.splice(index, 0, chain);
        }
    }

    /**
     * 删除缓冲区链
     * @param chain
     */
    public removeChain(chain: BufferChain) {

        for (let i = 0, len = this.chains.length; i < len; i++) {
            if (this.chains[i] === chain) {
                this.removeChain2(i);
                break;
            }
        }
    }

    /**
     * 删除缓冲区链
     * @param index
     */
    public removeChain2(index: number) {
        this.chains.splice(index, 1);
    }

    /**
     * 获取指定的缓冲区链
     * @param index
     */
    public get(index: number) {
        return this.chains[index];
    }

    /**
     * 获取所有的缓冲区链
     */
    public getChains(): BufferChain[] {
        return this.chains;
    }


    get chainSize() : number {
        return this.chains.length;
    }
}