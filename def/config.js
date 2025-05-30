module.exports = {
  Name: 'nswag-ts',
  Description: '根据swagger文档生成typescript客户端调用代码',
  Apis: [
    {
      SwaggerUrl: '', // 接口文档地址（必填）
      ApiBase: '', // 接口根节点（必填）
      ApiName: '', // 接口名称（必填）
      OutPath: '', // 输出目录（默认：项目根/src/api/{ApiName}）
      TplPath: '', // 模板路径（默认：内部默认模板，也可以copy 到项目中进行修改，然后指定用项目中模板）
      Mock: false, // 是否启用模拟数据 （默认：false）
      FormatMock: null, // 接管模拟数据格式化
      FormatControllerName: null, // 格式化模块名称（默认：接口名称+Api）
      FormatMethodName: null, // 格式化接口名称（默认：小驼峰命名）
      FormatModelName: null // 格式化dto对象、枚举名称（默认：只会去除特殊字符）
    }
  ],
  // 采用prettier格式化代码，不启用则去除该节点配置，配置 参考 https://prettier.io/docs/en/options
  prettier: {
    parser: 'babel-ts',
    singleQuote: true,
    printWidth: 180,
    tabWidth: 2,
    semi: false,
    trailingComma: 'none'
  }
}
