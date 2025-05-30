export interface NswagOptions {
    Apis: Array<SwaggerApi>;
    prettier: any;
}
export interface SwaggerApi {
    SwaggerUrl: string;
    ApiBase: string;
    ApiName: string;
    OutPath: string;
    TplPath: string;
    Mock: boolean;
    FormatMock: Function;
    FormatControllerName: Function;
    FormatMethodName: Function;
    FormatModelName: Function;
}
export interface Tag {
    tagName: string;
    description: string;
    methods: Array<Method>;
}
export interface Method {
    methodName: string;
    url: string;
    requestName: string;
    summary: string;
    parameters: any;
    responses: any;
}
export interface Model {
    name: string;
    description: string;
    baseModel: string;
    isParameter: boolean;
    properties: Array<Propertie>;
}
export interface Propertie {
    name: string;
    description: string;
    type: string;
    required: true | false | undefined;
}
export interface Enum {
    name: string;
    description: string;
    items: Array<EnumItem>;
}
export interface EnumItem {
    name: string;
    value: Number;
}
