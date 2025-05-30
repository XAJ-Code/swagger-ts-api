import { Enum, EnumItem, Method, Model, Propertie, SwaggerApi, Tag } from './type'
import _, { isObjectLike } from 'lodash'
import _path from 'path'
import ejs from 'ejs'
import fs from 'fs'
import { markDirsSync, removeDirSync } from './fs'
import prettier from 'prettier'

/**
 * swagger 代码生成处理类
 */
export class Swagger {
  // 接口配置
  private apiConfig: SwaggerApi
  // swagger-json
  private swaggerData: any
  // prettier
  private prettierOptions: any

  constructor(basePath: string, apiConfig: SwaggerApi, swaggerData: any, prettier: any) {
    this.apiConfig = Object.assign(
      {
        OutPath: _path.join(basePath, 'src/api/' + apiConfig.ApiName),
        TplPath: _path.join(basePath, 'nswag/tpl'),
        FormatControllerName: this.formatControllerName, // 格式化模块名称（默认：接口名称+Api）
        FormatMethodName: this.formatMethodName, // 格式化接口名称（默认：小驼峰命名）
        FormatModelName: this.formatModelName, // 格式化dto对象、枚举名称（默认：只会去除特殊字符）
        FormatMock: this.formatMock // 格式化模拟数据
      },
      apiConfig
    )
    this.swaggerData = swaggerData
    this.prettierOptions = prettier
  }

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
   * 去掉换行
   * @param str 字符串
   */
  public removeLineBreak(str: string) {
    return str ? str.replace(/[\r\n]/g, '') : ''
  }

  /**
   * 处理重名问题
   * @param name 当前名称
   * @param list 列表，对象必须有Name属性才行
   */
  public reName(name: string, list: Array<any>) {
    // 方法名称-重名处理
    if (_.findIndex(list, { methodName: name }) !== -1) {
      let i = 1
      while (true) {
        if (_.findIndex(list, { methodName: name + '_' + i }) !== -1) {
          i++
        } else {
          name = name + '_' + i
          break
        }
      }
    }
    return name
  }

  /**
   * 查找对象节点
   * @param sourceObj 对象
   * @param targObjs 依赖对象
   * @param key 条件字段
   */
  public findObjs(sourceObj: any, targObjs: Array<string>, key: string): any {
    if (isObjectLike(sourceObj)) {
      _.forEach(sourceObj, (prop, name) => {
        if (name == key) {
          targObjs.push(prop)
        }
        this.findObjs(prop, targObjs, key)
      })
    }
    return targObjs
  }

  /**
   * 对schema对象进行类型判断
   * @param obj
   */
  public convertType(obj: any): any {
    if (!obj) {
      return 'void'
    }
    if (obj.hasOwnProperty('schema')) {
      return this.convertType(obj.schema)
    }
    if (obj.hasOwnProperty('oneOf')) {
      return this.convertType(obj.oneOf[0])
    }
    if (obj.hasOwnProperty('allOf')) {
      let _Types: Array<string> = []
      _.forEach(obj.allOf, (pp, nm) => {
        _Types.push(this.convertType(pp))
      })
      return _Types.join(' & ')
    }
    if (obj.hasOwnProperty('properties')) {
      return this.convertType(obj.properties)
    }
    if (obj.hasOwnProperty('$ref')) {
      return this.formatModelName(obj.$ref)
    }
    if (obj.type === 'array') {
      const iType = this.convertType(obj.items)
      return 'Array<' + iType + '>'
    } else {
      switch (obj.type) {
        case 'string':
          if (obj.format === 'binary') {
            return 'string | Blob'
          }
          return 'string'
        case 'number':
        case 'integer':
          return 'number'
        case 'boolean':
          return 'boolean'
        case 'file':
          return 'string | Blob'
        default:
          if (isObjectLike(obj)) {
            let objType: any = {}
            _.forEach(obj, (prop, name) => {
              objType[name] = this.convertType(prop)
            })
            return JSON.stringify(objType).replace(/["]/g, '')
          } else {
            return 'any'
          }
      }
    }
  }

  /**
   * 获取全部tag
   * @param swaggerData 数据
   */
  public getTags() {
    let tags: any = {
      // auth: {
      //   tagName:'',
      //   description: '',
      //   methods: [{methodName:'',url:'',requestName:'',summary:'',parameters:'',responses:''}]
      // }
    }
    _.forEach(this.swaggerData.paths, (api, url) => {
      _.forEach(api, (md, requestName) => {
        // 接口Controller
        let tagName = md.tags[0]

        if (!tags[tagName]) {
          tags[tagName] = {
            tagName: tagName,
            description: this.swaggerData.ControllerDesc ? this.swaggerData.ControllerDesc[tagName] : '太懒没写注释',
            methods: []
          }
        }

        // 参数处理
        if (!md.parameters) {
          md.parameters = []
        }
        if (md.requestBody) {
          let schema = this.findObjs(md.requestBody, [], 'schema')[0] || this.findObjs(md.requestBody, [], 'multipart/form-data')[0].schema
          if (schema) {
            md.parameters.push(
              Object.assign(
                { name: 'data', in: 'body' },
                {
                  schema,
                  required: md.requestBody.required
                }
              )
            )
          }
        }

        // 方法
        let method: Method = {
          methodName: this.reName(this.apiConfig.FormatMethodName(url), tags[tagName].methods),
          url: url,
          requestName: requestName,
          summary: this.removeLineBreak(md.summary) || '太懒没写注释',
          parameters: md.parameters,
          responses: md.responses
        }
        tags[tagName].methods.push(method)
      })
    })

    // 调整方法顺序，因为mock时 有可能匹配错误的mock拦截
    _.each(tags, (c: any) => {
      c.methods = _.orderBy(c.methods, ['methodName'], ['desc'])
    })

    // 清理无方法空模块
    _.remove(tags, (c: any) => {
      return c.methods.length <= 0
    })

    return tags
  }
  /**
   * 获取全部依赖对象
   * @param tag 标签/Controller
   */
  public getTagModels(tag: any): Array<string> {
    let models = this.findObjs(tag, [], '$ref')
    let modelsNames: string[] = []
    models.forEach((item: any) => {
      const name = this.apiConfig.FormatModelName(item)
      if (!modelsNames.includes(name)) modelsNames.push(name)
    })
    return modelsNames
  }
  // 格式化属性方法
  public fmProperties(properties: any, model: Model, requireds: Array<string>) {
    _.forEach(properties, (propertie, name) => {
      const newp: Propertie = {
        name: name,
        description: this.removeLineBreak(propertie.description),
        type: this.convertType(propertie),
        required: requireds && requireds.length > 0 ? requireds.includes(name) : undefined
      }
      model.properties.push(newp)
    })
  }

  // 获取全部请求参数对象
  public getRequestBodys() {
    let requestBodyList: any[] = []
    _.forEach(this.swaggerData.paths, (api, url) => {
      _.forEach(api, (md, requestName) => {
        if (md.requestBody) {
          let schema = this.findObjs(md.requestBody, [], 'schema')[0] || this.findObjs(md.requestBody, [], 'multipart/form-data')[0].schema
          if (schema) {
            requestBodyList.push(this.convertType(schema))
          }
        }
      })
    })
    return requestBodyList
  }

  /**
   * 获取全部 Model \ Enum
   * @param node 指定对象节点，可空，如果不传则按默认规则查找
   */
  public getModelsAndEnums(node?: any): any {
    if (!node) {
      node = this.swaggerData?.components?.schemas || this.swaggerData?.definitions
    }
    let enums: Enum[] = []
    let models: Model[] = []
    let requestBodyList = this.getRequestBodys()

    _.forEach(node, (definition, name) => {
      if (definition.hasOwnProperty('enum')) {
        const e: Enum = {
          name: this.apiConfig.FormatModelName(name),
          description: this.removeLineBreak(definition.description),
          items: []
        }
        const ems = _.zipObject(definition['x-enumNames'], definition.enum)
        _.forEach(ems, function (enumValue, enumName) {
          const item: EnumItem = {
            name: enumName,
            value: Number(enumValue)
          }
          e.items.push(item)
        })

        enums.push(e)
      } else {
        const modelName = this.apiConfig.FormatModelName(name)
        let isParameter = requestBodyList.includes(modelName)

        const m: Model = {
          name: modelName,
          description: this.removeLineBreak(definition.description),
          baseModel: '',
          isParameter,
          properties: []
        }

        // 格式化属性
        if (definition.hasOwnProperty('allOf')) {
          _.forEach(definition.allOf, (propertie) => {
            if (propertie.hasOwnProperty('$ref')) {
              m.baseModel = this.apiConfig.FormatModelName(propertie.$ref.substring(propertie.$ref.lastIndexOf('/') + 1))
            } else {
              if (propertie.hasOwnProperty('properties')) {
                this.fmProperties(propertie.properties, m, propertie.required || [])
              }
            }
          })
        } else {
          this.fmProperties(definition.properties, m, definition.required || [])
        }

        models.push(m)
      }
    })
    return { models, enums }
  }
  /**
   * 获取请求参数
   * @param parameters 参数数组，不同版本swagger有差异
   * @param inTypes 参数类型数组，可同时查多种类型 query、path、body、header
   * @param format 格式化数据
   */
  public getParameter(parameters: Array<any>, inTypes: Array<string>, format?: Function): any {
    let pas = _.filter(parameters, (item) => {
      return inTypes.includes(item.in)
    }).map((item) => {
      return {
        ...item,
        type: this.convertType(item)
      }
    })
    // 格式化
    if (format) {
      return pas.map((item) => {
        return format(item)
      })
    }

    // 排序一下参数，把非必填参数排后面
    return pas.sort((a: any, b: any) => {
      if (a.required && !b.required) {
        return -1 // a在b之前
      } else if (!a.required && b.required) {
        return 1 // b在a之前
      }
      return 0 // 顺序不变
    })
  }

  /**
   * 获取请求参数
   * @param responses 返回对象
   */
  public getResponses(responses: any): any {
    let schema = this.findObjs(responses, [], 'schema')[0]
    return this.convertType(schema)
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
  /**
   * 格式化模拟数据
   * @param responses 当前需要模拟的对象
   * @param models 接口全部对象
   * @param fm 格式化模拟数据函数
   * @param deep 递归层级，防止对象父子嵌套导致死循环 默认递归5级
   */
  public mock(responses: string, models: Array<Model>, deep: number = 1): any {
    let responsesList
    if (responses.indexOf('&') > 0) {
      responsesList = responses.split('&')
    } else {
      responsesList = [responses]
    }
    let mock: any = {}
    responsesList.forEach((item) => {
      let _name = item.trim().replace('{data:', '').replace('}', '')
      let model = _.find(models, { name: _name })
      if (model) {
        model.properties.forEach((p) => {
          // 'string' | 'number' | 'boolean' | 'file' | 'array' | 'enum' | 'schema'
          let v: any = ''
          switch (p.type) {
            case 'string':
              v = '@ctitle(10, 20)'
              break
            case 'number':
              v = '@integer(0, 100)'
              break
            case 'boolean':
              v = '@boolean'
              break
            case 'file':
              v = ''
              break
            case 'array':
              v = deep > 5 ? [] : [this.mock(p.type, models, deep + 1)]
              break
            case 'enum':
              v = p.type
              break
            case 'schema':
              v = deep > 5 ? null : this.mock(p.type, models, deep + 1)
              break
          }
          mock = this.apiConfig.FormatMock(v, p, mock)
        })
        return mock
      } else {
        switch (_name) {
          case 'string':
            mock['data'] = '@ctitle(10, 20)'
            break
          case 'number':
            mock['data'] = '@integer(0, 100)'
            break
          case 'boolean':
            mock['data'] = '@boolean'
            break
        }
      }
    })
    return mock
  }
  /**
   * 生成代码
   * @param TplPath 模板绝对地址
   * @param OutPath 文件存放绝对地址
   * @param fileName 文件名称
   * @param data.tag 当前控制器标签（仅生成控制器代码时有值）
   * @param data.swaggerData 接口数据
   * @param data.apiConfig 接口配置
   */
  public async codeRender(TplPath: string, OutPath: string, fileName: string, data: any) {
    if (markDirsSync(OutPath)) {
      const fileText = ejs.render(fs.readFileSync(TplPath, 'utf-8'), data, {
        context: this
      })
      const savePath = _path.join(OutPath, fileName)

      const content = this.prettierOptions ? await prettier.format(fileText, { parser: 'babel-ts', singleQuote: true, printWidth: 180, tabWidth: 2, semi: false, trailingComma: 'none' }) : fileText

      fs.writeFileSync(savePath, content)
    }
  }
  /**
   * 生成代码
   */
  public generate() {
    const saveBaseDir = _path.join(this.apiConfig.OutPath, 'base')
    const saveModelsDir = _path.join(this.apiConfig.OutPath, 'model')
    const saveMockDir = _path.join(this.apiConfig.OutPath, 'mock')

    const tplBasePath = _path.join(this.apiConfig.TplPath, 'base.ejs')
    const tplMethodPath = _path.join(this.apiConfig.TplPath, 'method.ejs')
    const tplModelsPath = _path.join(this.apiConfig.TplPath, 'model.ejs')
    const tplMockPath = _path.join(this.apiConfig.TplPath, 'mock.ejs')
    const tplMockMethodPath = _path.join(this.apiConfig.TplPath, 'mock-method.ejs')

    // 清理旧代码
    removeDirSync(this.apiConfig.OutPath)
    // 生成-基类
    this.codeRender(tplBasePath, saveBaseDir, 'index.ts', {
      swaggerData: this.swaggerData,
      apiConfig: this.apiConfig
    })
    // 生成-dto对象
    this.codeRender(tplModelsPath, saveModelsDir, 'index.ts', {
      swaggerData: this.swaggerData,
      apiConfig: this.apiConfig
    })

    // 生成-接口
    const tags = this.getTags()
    _.forEach(tags, (tag, tagName) => {
      this.codeRender(tplMethodPath, this.apiConfig.OutPath, this.apiConfig.FormatControllerName(tagName) + '.ts', { tag, swaggerData: this.swaggerData, apiConfig: this.apiConfig })
      // 生成-Mock-接口
      if (this.apiConfig.Mock) {
        this.codeRender(tplMockMethodPath, saveMockDir, this.apiConfig.FormatControllerName(tagName) + '.ts', { tag, swaggerData: this.swaggerData, apiConfig: this.apiConfig })
      }
    })

    // 生成-Mock
    if (this.apiConfig.Mock) {
      this.codeRender(tplMockPath, saveMockDir, 'index.ts', {
        swaggerData: this.swaggerData,
        apiConfig: this.apiConfig
      })
    }
  }
}
