"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Swagger = void 0;
const lodash_1 = __importStar(require("lodash"));
const path_1 = __importDefault(require("path"));
const ejs_1 = __importDefault(require("ejs"));
const fs_1 = __importDefault(require("fs"));
const fs_2 = require("./fs");
const prettier_1 = __importDefault(require("prettier"));
/**
 * swagger 代码生成处理类
 */
class Swagger {
    // 接口配置
    apiConfig;
    // swagger-json
    swaggerData;
    // prettier
    prettierOptions;
    constructor(basePath, apiConfig, swaggerData, prettier) {
        this.apiConfig = Object.assign({
            OutPath: path_1.default.join(basePath, 'src/api/' + apiConfig.ApiName),
            TplPath: path_1.default.join(basePath, 'nswag/tpl'),
            FormatControllerName: this.formatControllerName, // 格式化模块名称（默认：接口名称+Api）
            FormatMethodName: this.formatMethodName, // 格式化接口名称（默认：小驼峰命名）
            FormatModelName: this.formatModelName, // 格式化dto对象、枚举名称（默认：只会去除特殊字符）
            FormatMock: this.formatMock // 格式化模拟数据
        }, apiConfig);
        this.swaggerData = swaggerData;
        this.prettierOptions = prettier;
    }
    /**
     * 格式化模块名称（默认：接口名称+Api）
     * @param name 名称
     */
    formatControllerName(name) {
        return name.indexOf('Api') !== -1 ? name : name + 'Api';
    }
    /**
     * 格式化接口名称（默认：小驼峰命名）
     * @param name 名称
     */
    formatMethodName(name) {
        if (name === '/' || name === '') {
            return '';
        }
        const fnName = name.substring(name.lastIndexOf('/'));
        return lodash_1.default.camelCase(fnName);
    }
    /**
     * 格式化dto对象、枚举名称（默认：只会去除特殊字符）
     * @param name 名称
     */
    formatModelName(name) {
        return name.substring(name.lastIndexOf('/') + 1).replace(/[.,\[\]]/g, '_');
    }
    /**
     * 去掉换行
     * @param str 字符串
     */
    removeLineBreak(str) {
        return str ? str.replace(/[\r\n]/g, '') : '';
    }
    /**
     * 处理重名问题
     * @param name 当前名称
     * @param list 列表，对象必须有Name属性才行
     */
    reName(name, list) {
        // 方法名称-重名处理
        if (lodash_1.default.findIndex(list, { methodName: name }) !== -1) {
            let i = 1;
            while (true) {
                if (lodash_1.default.findIndex(list, { methodName: name + '_' + i }) !== -1) {
                    i++;
                }
                else {
                    name = name + '_' + i;
                    break;
                }
            }
        }
        return name;
    }
    /**
     * 查找对象节点
     * @param sourceObj 对象
     * @param targObjs 依赖对象
     * @param key 条件字段
     */
    findObjs(sourceObj, targObjs, key) {
        if ((0, lodash_1.isObjectLike)(sourceObj)) {
            lodash_1.default.forEach(sourceObj, (prop, name) => {
                if (name == key) {
                    targObjs.push(prop);
                }
                this.findObjs(prop, targObjs, key);
            });
        }
        return targObjs;
    }
    /**
     * 对schema对象进行类型判断
     * @param obj
     */
    convertType(obj) {
        if (!obj) {
            return 'void';
        }
        if (obj.hasOwnProperty('schema')) {
            return this.convertType(obj.schema);
        }
        if (obj.hasOwnProperty('oneOf')) {
            return this.convertType(obj.oneOf[0]);
        }
        if (obj.hasOwnProperty('allOf')) {
            let _Types = [];
            lodash_1.default.forEach(obj.allOf, (pp, nm) => {
                _Types.push(this.convertType(pp));
            });
            return _Types.join(' & ');
        }
        if (obj.hasOwnProperty('properties')) {
            return this.convertType(obj.properties);
        }
        if (obj.hasOwnProperty('$ref')) {
            return this.formatModelName(obj.$ref);
        }
        if (obj.type === 'array') {
            const iType = this.convertType(obj.items);
            return 'Array<' + iType + '>';
        }
        else {
            switch (obj.type) {
                case 'string':
                    if (obj.format === 'binary') {
                        return 'string | Blob';
                    }
                    return 'string';
                case 'number':
                case 'integer':
                    return 'number';
                case 'boolean':
                    return 'boolean';
                case 'file':
                    return 'string | Blob';
                default:
                    if ((0, lodash_1.isObjectLike)(obj)) {
                        let objType = {};
                        lodash_1.default.forEach(obj, (prop, name) => {
                            objType[name] = this.convertType(prop);
                        });
                        return JSON.stringify(objType).replace(/["]/g, '');
                    }
                    else {
                        return 'any';
                    }
            }
        }
    }
    /**
     * 获取全部tag
     * @param swaggerData 数据
     */
    getTags() {
        let tags = {
        // auth: {
        //   tagName:'',
        //   description: '',
        //   methods: [{methodName:'',url:'',requestName:'',summary:'',parameters:'',responses:''}]
        // }
        };
        lodash_1.default.forEach(this.swaggerData.paths, (api, url) => {
            lodash_1.default.forEach(api, (md, requestName) => {
                // 接口Controller
                let tagName = md.tags[0];
                if (!tags[tagName]) {
                    tags[tagName] = {
                        tagName: tagName,
                        description: this.swaggerData.ControllerDesc ? this.swaggerData.ControllerDesc[tagName] : '太懒没写注释',
                        methods: []
                    };
                }
                // 参数处理
                if (!md.parameters) {
                    md.parameters = [];
                }
                if (md.requestBody) {
                    let schema = this.findObjs(md.requestBody, [], 'schema')[0] || this.findObjs(md.requestBody, [], 'multipart/form-data')[0].schema;
                    if (schema) {
                        md.parameters.push(Object.assign({ name: 'data', in: 'body' }, {
                            schema,
                            required: md.requestBody.required
                        }));
                    }
                }
                // 方法
                let method = {
                    methodName: this.reName(this.apiConfig.FormatMethodName(url), tags[tagName].methods),
                    url: url,
                    requestName: requestName,
                    summary: this.removeLineBreak(md.summary) || '太懒没写注释',
                    parameters: md.parameters,
                    responses: md.responses
                };
                tags[tagName].methods.push(method);
            });
        });
        // 调整方法顺序，因为mock时 有可能匹配错误的mock拦截
        lodash_1.default.each(tags, (c) => {
            c.methods = lodash_1.default.orderBy(c.methods, ['methodName'], ['desc']);
        });
        // 清理无方法空模块
        lodash_1.default.remove(tags, (c) => {
            return c.methods.length <= 0;
        });
        return tags;
    }
    /**
     * 获取全部依赖对象
     * @param tag 标签/Controller
     */
    getTagModels(tag) {
        let models = this.findObjs(tag, [], '$ref');
        let modelsNames = [];
        models.forEach((item) => {
            const name = this.apiConfig.FormatModelName(item);
            if (!modelsNames.includes(name))
                modelsNames.push(name);
        });
        return modelsNames;
    }
    // 格式化属性方法
    fmProperties(properties, model, requireds) {
        lodash_1.default.forEach(properties, (propertie, name) => {
            const newp = {
                name: name,
                description: this.removeLineBreak(propertie.description),
                type: this.convertType(propertie),
                required: requireds && requireds.length > 0 ? requireds.includes(name) : undefined
            };
            model.properties.push(newp);
        });
    }
    // 获取全部请求参数对象
    getRequestBodys() {
        let requestBodyList = [];
        lodash_1.default.forEach(this.swaggerData.paths, (api, url) => {
            lodash_1.default.forEach(api, (md, requestName) => {
                if (md.requestBody) {
                    let schema = this.findObjs(md.requestBody, [], 'schema')[0] || this.findObjs(md.requestBody, [], 'multipart/form-data')[0].schema;
                    if (schema) {
                        requestBodyList.push(this.convertType(schema));
                    }
                }
            });
        });
        return requestBodyList;
    }
    /**
     * 获取全部 Model \ Enum
     * @param node 指定对象节点，可空，如果不传则按默认规则查找
     */
    getModelsAndEnums(node) {
        if (!node) {
            node = this.swaggerData?.components?.schemas || this.swaggerData?.definitions;
        }
        let enums = [];
        let models = [];
        let requestBodyList = this.getRequestBodys();
        lodash_1.default.forEach(node, (definition, name) => {
            if (definition.hasOwnProperty('enum')) {
                const e = {
                    name: this.apiConfig.FormatModelName(name),
                    description: this.removeLineBreak(definition.description),
                    items: []
                };
                const ems = lodash_1.default.zipObject(definition['x-enumNames'], definition.enum);
                lodash_1.default.forEach(ems, function (enumValue, enumName) {
                    const item = {
                        name: enumName,
                        value: Number(enumValue)
                    };
                    e.items.push(item);
                });
                enums.push(e);
            }
            else {
                const modelName = this.apiConfig.FormatModelName(name);
                let isParameter = requestBodyList.includes(modelName);
                const m = {
                    name: modelName,
                    description: this.removeLineBreak(definition.description),
                    baseModel: '',
                    isParameter,
                    properties: []
                };
                // 格式化属性
                if (definition.hasOwnProperty('allOf')) {
                    lodash_1.default.forEach(definition.allOf, (propertie) => {
                        if (propertie.hasOwnProperty('$ref')) {
                            m.baseModel = this.apiConfig.FormatModelName(propertie.$ref.substring(propertie.$ref.lastIndexOf('/') + 1));
                        }
                        else {
                            if (propertie.hasOwnProperty('properties')) {
                                this.fmProperties(propertie.properties, m, propertie.required || []);
                            }
                        }
                    });
                }
                else {
                    this.fmProperties(definition.properties, m, definition.required || []);
                }
                models.push(m);
            }
        });
        return { models, enums };
    }
    /**
     * 获取请求参数
     * @param parameters 参数数组，不同版本swagger有差异
     * @param inTypes 参数类型数组，可同时查多种类型 query、path、body、header
     * @param format 格式化数据
     */
    getParameter(parameters, inTypes, format) {
        let pas = lodash_1.default.filter(parameters, (item) => {
            return inTypes.includes(item.in);
        }).map((item) => {
            return {
                ...item,
                type: this.convertType(item)
            };
        });
        // 格式化
        if (format) {
            return pas.map((item) => {
                return format(item);
            });
        }
        // 排序一下参数，把非必填参数排后面
        return pas.sort((a, b) => {
            if (a.required && !b.required) {
                return -1; // a在b之前
            }
            else if (!a.required && b.required) {
                return 1; // b在a之前
            }
            return 0; // 顺序不变
        });
    }
    /**
     * 获取请求参数
     * @param responses 返回对象
     */
    getResponses(responses) {
        let schema = this.findObjs(responses, [], 'schema')[0];
        return this.convertType(schema);
    }
    /**
     * 格式化模拟值
     * @param val 默认格式化后的值
     * @param p 对应的属性
     * @param mock 最终模拟数据
     */
    formatMock(val, p, mock) {
        switch (p.type) {
            case 'string':
                switch (p.name) {
                    case 'name':
                        val = '@cname';
                        break;
                    case 'title':
                        val = '@ctitle(10, 20)';
                        break;
                    case 'mobile':
                        val = '@natural(10000)';
                        break;
                    case 'email':
                        val = '@email';
                        break;
                    case 'province':
                        val = '@province';
                        break;
                    case 'city':
                        val = '@city';
                        break;
                    case 'area':
                        val = '@county';
                        break;
                    default:
                        val = '@ctitle(10, 20)';
                        break;
                }
                mock[p.name] = val;
                break;
            case 'number':
                switch (p.name) {
                    case 'result_code':
                        val = 0;
                        break;
                    case 'page_index':
                        val = 1;
                        break;
                    case 'page_size':
                        val = 15;
                        break;
                    case 'total_count':
                        val = 30;
                        break;
                    default:
                        val = '@integer(0, 100)';
                        break;
                }
                mock[p.name] = val;
                break;
            case 'array':
                mock[p.name + '|20'] = val;
                break;
            default:
                mock[p.name] = val;
                break;
        }
        return mock;
    }
    /**
     * 格式化模拟数据
     * @param responses 当前需要模拟的对象
     * @param models 接口全部对象
     * @param fm 格式化模拟数据函数
     * @param deep 递归层级，防止对象父子嵌套导致死循环 默认递归5级
     */
    mock(responses, models, deep = 1) {
        let responsesList;
        if (responses.indexOf('&') > 0) {
            responsesList = responses.split('&');
        }
        else {
            responsesList = [responses];
        }
        let mock = {};
        responsesList.forEach((item) => {
            let _name = item.trim().replace('{data:', '').replace('}', '');
            let model = lodash_1.default.find(models, { name: _name });
            if (model) {
                model.properties.forEach((p) => {
                    // 'string' | 'number' | 'boolean' | 'file' | 'array' | 'enum' | 'schema'
                    let v = '';
                    switch (p.type) {
                        case 'string':
                            v = '@ctitle(10, 20)';
                            break;
                        case 'number':
                            v = '@integer(0, 100)';
                            break;
                        case 'boolean':
                            v = '@boolean';
                            break;
                        case 'file':
                            v = '';
                            break;
                        case 'array':
                            v = deep > 5 ? [] : [this.mock(p.type, models, deep + 1)];
                            break;
                        case 'enum':
                            v = p.type;
                            break;
                        case 'schema':
                            v = deep > 5 ? null : this.mock(p.type, models, deep + 1);
                            break;
                    }
                    mock = this.apiConfig.FormatMock(v, p, mock);
                });
                return mock;
            }
            else {
                switch (_name) {
                    case 'string':
                        mock['data'] = '@ctitle(10, 20)';
                        break;
                    case 'number':
                        mock['data'] = '@integer(0, 100)';
                        break;
                    case 'boolean':
                        mock['data'] = '@boolean';
                        break;
                }
            }
        });
        return mock;
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
    async codeRender(TplPath, OutPath, fileName, data) {
        if ((0, fs_2.markDirsSync)(OutPath)) {
            const fileText = ejs_1.default.render(fs_1.default.readFileSync(TplPath, 'utf-8'), data, {
                context: this
            });
            const savePath = path_1.default.join(OutPath, fileName);
            const content = this.prettierOptions ? await prettier_1.default.format(fileText, { parser: 'babel-ts', singleQuote: true, printWidth: 180, tabWidth: 2, semi: false, trailingComma: 'none' }) : fileText;
            fs_1.default.writeFileSync(savePath, content);
        }
    }
    /**
     * 生成代码
     */
    generate() {
        const saveBaseDir = path_1.default.join(this.apiConfig.OutPath, 'base');
        const saveModelsDir = path_1.default.join(this.apiConfig.OutPath, 'model');
        const saveMockDir = path_1.default.join(this.apiConfig.OutPath, 'mock');
        const tplBasePath = path_1.default.join(this.apiConfig.TplPath, 'base.ejs');
        const tplMethodPath = path_1.default.join(this.apiConfig.TplPath, 'method.ejs');
        const tplModelsPath = path_1.default.join(this.apiConfig.TplPath, 'model.ejs');
        const tplMockPath = path_1.default.join(this.apiConfig.TplPath, 'mock.ejs');
        const tplMockMethodPath = path_1.default.join(this.apiConfig.TplPath, 'mock-method.ejs');
        // 清理旧代码
        (0, fs_2.removeDirSync)(this.apiConfig.OutPath);
        // 生成-基类
        this.codeRender(tplBasePath, saveBaseDir, 'index.ts', {
            swaggerData: this.swaggerData,
            apiConfig: this.apiConfig
        });
        // 生成-dto对象
        this.codeRender(tplModelsPath, saveModelsDir, 'index.ts', {
            swaggerData: this.swaggerData,
            apiConfig: this.apiConfig
        });
        // 生成-接口
        const tags = this.getTags();
        lodash_1.default.forEach(tags, (tag, tagName) => {
            this.codeRender(tplMethodPath, this.apiConfig.OutPath, this.apiConfig.FormatControllerName(tagName) + '.ts', { tag, swaggerData: this.swaggerData, apiConfig: this.apiConfig });
            // 生成-Mock-接口
            if (this.apiConfig.Mock) {
                this.codeRender(tplMockMethodPath, saveMockDir, this.apiConfig.FormatControllerName(tagName) + '.ts', { tag, swaggerData: this.swaggerData, apiConfig: this.apiConfig });
            }
        });
        // 生成-Mock
        if (this.apiConfig.Mock) {
            this.codeRender(tplMockPath, saveMockDir, 'index.ts', {
                swaggerData: this.swaggerData,
                apiConfig: this.apiConfig
            });
        }
    }
}
exports.Swagger = Swagger;
