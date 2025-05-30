# nswag-ts

#### 介绍

根据 swagger 文档生成 typescript 客户端调用代码

#### 安装教程

1.  npm i nswag-ts -D

#### 使用说明

1. 在 package.json 的 scripts 节点增加 2 个执行命令

- "nswag-init":"nswag init", // 初始化配置
- "nswag-run":"nswag run" // 执行代码生成

- 第一步执行：npm run nswag-init 初始化项目
- 初始化完成后会在项目根目录创建文件夹 nswag,里面放置了配置文件及代码模板
- 修改配置文件和代码模板就可以进行第二步生成操作了

- config.js 为配置文件

  - 配置所有需要生成的接口，及相应的生成规则，详见 【配置参数】

- tpl 文件里面是代码模板(可以根据自己的实际情况调整模板)

  - base.ejs 接口调用基类模板，默认使用了 axios
  - method.ejs 接口函数生成模板
  - model.ejs 接口对象生成模板
  - mock.ejs 模拟数据代码生成模板-调用
  - mock-method.ejs 模拟数据代码生成模板-接口实例

- 第二步执行：npm run nswag-run 执行代码生成调用接口

#### 配置参数

```
{
  Name: 'nswag-ts',
  Description: '根据swagger文档生成typescript客户端调用代码',
  Apis: [
    {
      SwaggerUrl: string // 接口文档地址（必填）
      ApiBase: string // 接口根节点（必填）
      ApiName: string // 接口名称（必填）
      OutPath: string // 输出目录（默认：项目根目录：/src/api/）
      TplPath: string // 模板路径（默认：初始化后会自动copy模板文件夹到项目根目录：nswag，如果进行了修改则需配置此目录）
      Mock: boolean // 是否启用模拟数据 （默认：false）
      FormatControllerName: Function // 格式化模块名称（默认：接口名称+Api）
      FormatMethodName: Function // 格式化接口名称（默认：小驼峰命名）
      FormatModelName: Function // 格式化dto对象、枚举名称（默认：只会去除特殊字符）
      FormatMock: Function // 接管模拟数据格式化
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
```

##### 格式化函数示例

```
  /**
   * 格式化模块名称（默认：接口名称+Api）
   * @param name 名称
   */
  public formatControllerName(name: string) {
    return name.indexOf('Api') !== -1 ? name : name + 'Api'
  }

    /**
   * 格式化接口名称（默认：小驼峰命名）
   * @param name 名称
   */
  public formatMethodName(name: string) {
    if (name === '/' || name === '') {
      return ''
    }
    const fnName = name.substring(name.lastIndexOf('/'))
    return _.camelCase(fnName)
  }

   /**
   * 格式化dto对象、枚举名称（默认：只会去除特殊字符）
   * @param name 名称
   */
  public formatModelName(name: string) {
    return name.substring(name.lastIndexOf('/') + 1).replace(/[.,\[\]]/g, '_')
  }

    /**
   * 格式化模拟值
   * @param val 默认格式化后的值
   * @param p 对应的属性
   * @param mock 最终模拟数据
   */
  public formatMock(val: any, p: Propertie, mock: any) {
    switch (p.type) {
      case 'string':
        switch (p.name) {
          case 'name':
            val = '@cname'
            break
          case 'title':
            val = '@ctitle(10, 20)'
            break
          case 'mobile':
            val = '@natural(10000)'
            break
          case 'email':
            val = '@email'
            break
          case 'province':
            val = '@province'
            break
          case 'city':
            val = '@city'
            break
          case 'area':
            val = '@county'
            break
          default:
            val = '@ctitle(10, 20)'
            break
        }
        mock[p.name] = val
        break
      case 'number':
        switch (p.name) {
          case 'result_code':
            val = 0
            break
          case 'page_index':
            val = 1
            break
          case 'page_size':
            val = 15
            break
          case 'total_count':
            val = 30
            break
          default:
            val = '@integer(0, 100)'
            break
        }
        mock[p.name] = val
        break
      case 'array':
        mock[p.name + '|20'] = val
        break
      default:
        mock[p.name] = val
        break
    }
    return mock
  }
```

#### 代码格式化

```
// 采用prettier格式化代码，不启用则去除该节点配置，配置 参考 https://prettier.io/docs/en/options
prettier: {
  parser: 'babel-ts',
  singleQuote: true,
  printWidth: 180,
  tabWidth: 2,
  semi: false,
  trailingComma: 'none'
}
```

#### 模板编辑

```
// 新版本nswag-ts，优化了模板文件的数据源结构，更大程度的采用了swagger原本的数据格式，但是swagger 数据格式不太好构件相关接口定义，所以nswag-ts提供了一系列用于数据转化的方法，可以在模板文件中直接调用，通过这些方法能够减轻模板代码的编写，也可以拥有更多的自定义用法。


函数列表：
1、格式化参数对象，获取指定类型的参数
this.getParameter(参数对象,['query','body'],callback)

2、获取指定控制器依赖的模块
this.getTagModels(tag)

3、格式化返回对象
this.getResponses(m.responses)

4、获取全部类型和枚举对象
this.getModelsAndEnums()

5、根据返回对象，生成Mock数据
this.mock(responses, data.Models)

6、获取全部控制器，swagger里面对应tag标签
this.getTags()

```

#### 代码仓库

1. https://github.com/XAJ-Code/swagger-ts-api
2. https://www.npmjs.com/package/nswag-ts
