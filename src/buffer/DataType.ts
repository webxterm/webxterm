/**
 * buffer line中的lines类型
 */
export enum DataType {
    PRIMARY,        // 第一个占用的数据类型，默认类型
    SECONDARY,      // 第二个占位符，如中文的""
    AUXILIARY       // 辅助占位符、保留类型
}