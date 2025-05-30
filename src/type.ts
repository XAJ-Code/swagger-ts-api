// 配置参数
export interface NswagOptions {
  Apis: Array<SwaggerApi> // 接口配置
  prettier: any // prettier配置
}
// SwaggerJson格式文档
export interface SwaggerApi {
  SwaggerUrl: string // 接口文档地址（必填）
  ApiBase: string // 接口根节点（必填）
  ApiName: string // 接口名称（必填）
  OutPath: string // 输出目录（默认：项目根/src/api/）
  TplPath: string // 模版目录（默认：项目根/nswag/tpl）
  Mock: boolean // 是否启用模拟数据 （默认：false）
  FormatMock: Function // 接管模拟数据格式化
  FormatControllerName: Function // 格式化模块名称（默认：接口名称+Api）
  FormatMethodName: Function // 格式化接口名称（默认：小驼峰命名）
  FormatModelName: Function // 格式化dto对象、枚举名称（默认：只会去除特殊字符）
}

// 标签/分组/控制器
export interface Tag {
  tagName: string
  description: string
  methods: Array<Method>
}

// 接口方法
export interface Method {
  methodName: string
  url: string
  requestName: string
  summary: string
  parameters: any
  responses: any
}

// 类型
export interface Model {
  name: string // 名称
  description: string // 说明
  baseModel: string // 父级类型
  isParameter: boolean // 是否为输入参数
  properties: Array<Propertie> // 属性
}
export interface Propertie {
  name: string // 名称
  description: string // 说明
  type: string // 类型
  required: true | false | undefined // 必填 可空  未知
}

// 枚举
export interface Enum {
  name: string // 名称
  description: string // 说明
  items: Array<EnumItem> // 列表
}
export interface EnumItem {
  name: string // 名称
  value: Number // 值
}
