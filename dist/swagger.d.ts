import { Model, Propertie, SwaggerApi } from './type';
/**
 * swagger 代码生成处理类
 */
export declare class Swagger {
    private apiConfig;
    private swaggerData;
    private prettierOptions;
    constructor(basePath: string, apiConfig: SwaggerApi, swaggerData: any, prettier: any);
    /**
     * 格式化模块名称（默认：接口名称+Api）
     * @param name 名称
     */
    formatControllerName(name: string): string;
    /**
     * 格式化接口名称（默认：小驼峰命名）
     * @param name 名称
     */
    formatMethodName(name: string): string;
    /**
     * 格式化dto对象、枚举名称（默认：只会去除特殊字符）
     * @param name 名称
     */
    formatModelName(name: string): string;
    /**
     * 去掉换行
     * @param str 字符串
     */
    removeLineBreak(str: string): string;
    /**
     * 处理重名问题
     * @param name 当前名称
     * @param list 列表，对象必须有Name属性才行
     */
    reName(name: string, list: Array<any>): string;
    /**
     * 查找对象节点
     * @param sourceObj 对象
     * @param targObjs 依赖对象
     * @param key 条件字段
     */
    findObjs(sourceObj: any, targObjs: Array<string>, key: string): any;
    /**
     * 对schema对象进行类型判断
     * @param obj
     */
    convertType(obj: any): any;
    /**
     * 获取全部tag
     * @param swaggerData 数据
     */
    getTags(): any;
    /**
     * 获取全部依赖对象
     * @param tag 标签/Controller
     */
    getTagModels(tag: any): Array<string>;
    fmProperties(properties: any, model: Model, requireds: Array<string>): void;
    getRequestBodys(): any[];
    /**
     * 获取全部 Model \ Enum
     * @param node 指定对象节点，可空，如果不传则按默认规则查找
     */
    getModelsAndEnums(node?: any): any;
    /**
     * 获取请求参数
     * @param parameters 参数数组，不同版本swagger有差异
     * @param inTypes 参数类型数组，可同时查多种类型 query、path、body、header
     * @param format 格式化数据
     */
    getParameter(parameters: Array<any>, inTypes: Array<string>, format?: Function): any;
    /**
     * 获取请求参数
     * @param responses 返回对象
     */
    getResponses(responses: any): any;
    /**
     * 格式化模拟值
     * @param val 默认格式化后的值
     * @param p 对应的属性
     * @param mock 最终模拟数据
     */
    formatMock(val: any, p: Propertie, mock: any): any;
    /**
     * 格式化模拟数据
     * @param responses 当前需要模拟的对象
     * @param models 接口全部对象
     * @param fm 格式化模拟数据函数
     * @param deep 递归层级，防止对象父子嵌套导致死循环 默认递归5级
     */
    mock(responses: string, models: Array<Model>, deep?: number): any;
    /**
     * 生成代码
     * @param TplPath 模板绝对地址
     * @param OutPath 文件存放绝对地址
     * @param fileName 文件名称
     * @param data.tag 当前控制器标签（仅生成控制器代码时有值）
     * @param data.swaggerData 接口数据
     * @param data.apiConfig 接口配置
     */
    codeRender(TplPath: string, OutPath: string, fileName: string, data: any): Promise<void>;
    /**
     * 生成代码
     */
    generate(): void;
}
