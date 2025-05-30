"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Swagger = void 0;
var lodash_1 = __importStar(require("lodash"));
var path_1 = __importDefault(require("path"));
var ejs_1 = __importDefault(require("ejs"));
var fs_1 = __importDefault(require("fs"));
var fs_2 = require("./fs");
var prettier_1 = __importDefault(require("prettier"));
/**
 * swagger 代码生成处理类
 */
var Swagger = /** @class */ (function () {
    function Swagger(basePath, apiConfig, swaggerData, prettier) {
        this.apiConfig = Object.assign({
            OutPath: path_1.default.join(basePath, 'src/api/' + apiConfig.ApiName),
            TplPath: path_1.default.join(basePath, 'nswag/tpl'),
            FormatControllerName: this.formatControllerName,
            FormatMethodName: this.formatMethodName,
            FormatModelName: this.formatModelName,
            FormatMock: this.formatMock // 格式化模拟数据
        }, apiConfig);
        this.swaggerData = swaggerData;
        this.prettierOptions = prettier;
    }
    /**
     * 格式化模块名称（默认：接口名称+Api）
     * @param name 名称
     */
    Swagger.prototype.formatControllerName = function (name) {
        return name.indexOf('Api') !== -1 ? name : name + 'Api';
    };
    /**
     * 格式化接口名称（默认：小驼峰命名）
     * @param name 名称
     */
    Swagger.prototype.formatMethodName = function (name) {
        if (name === '/' || name === '') {
            return '';
        }
        var fnName = name.substring(name.lastIndexOf('/'));
        return lodash_1.default.camelCase(fnName);
    };
    /**
     * 格式化dto对象、枚举名称（默认：只会去除特殊字符）
     * @param name 名称
     */
    Swagger.prototype.formatModelName = function (name) {
        return name.substring(name.lastIndexOf('/') + 1).replace(/[.,\[\]]/g, '_');
    };
    /**
     * 去掉换行
     * @param str 字符串
     */
    Swagger.prototype.removeLineBreak = function (str) {
        return str ? str.replace(/[\r\n]/g, '') : '';
    };
    /**
     * 处理重名问题
     * @param name 当前名称
     * @param list 列表，对象必须有Name属性才行
     */
    Swagger.prototype.reName = function (name, list) {
        // 方法名称-重名处理
        if (lodash_1.default.findIndex(list, { methodName: name }) !== -1) {
            var i = 1;
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
    };
    /**
     * 查找对象节点
     * @param sourceObj 对象
     * @param targObjs 依赖对象
     * @param key 条件字段
     */
    Swagger.prototype.findObjs = function (sourceObj, targObjs, key) {
        var _this = this;
        if ((0, lodash_1.isObjectLike)(sourceObj)) {
            lodash_1.default.forEach(sourceObj, function (prop, name) {
                if (name == key) {
                    targObjs.push(prop);
                }
                _this.findObjs(prop, targObjs, key);
            });
        }
        return targObjs;
    };
    /**
     * 对schema对象进行类型判断
     * @param obj
     */
    Swagger.prototype.convertType = function (obj) {
        var _this = this;
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
            var _Types_1 = [];
            lodash_1.default.forEach(obj.allOf, function (pp, nm) {
                _Types_1.push(_this.convertType(pp));
            });
            return _Types_1.join(' & ');
        }
        if (obj.hasOwnProperty('properties')) {
            return this.convertType(obj.properties);
        }
        if (obj.hasOwnProperty('$ref')) {
            return this.formatModelName(obj.$ref);
        }
        if (obj.type === 'array') {
            var iType = this.convertType(obj.items);
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
                        var objType_1 = {};
                        lodash_1.default.forEach(obj, function (prop, name) {
                            objType_1[name] = _this.convertType(prop);
                        });
                        return JSON.stringify(objType_1).replace(/["]/g, '');
                    }
                    else {
                        return 'any';
                    }
            }
        }
    };
    /**
     * 获取全部tag
     * @param swaggerData 数据
     */
    Swagger.prototype.getTags = function () {
        var _this = this;
        var tags = {
        // auth: {
        //   tagName:'',
        //   description: '',
        //   methods: [{methodName:'',url:'',requestName:'',summary:'',parameters:'',responses:''}]
        // }
        };
        lodash_1.default.forEach(this.swaggerData.paths, function (api, url) {
            lodash_1.default.forEach(api, function (md, requestName) {
                // 接口Controller
                var tagName = md.tags[0];
                if (!tags[tagName]) {
                    tags[tagName] = {
                        tagName: tagName,
                        description: _this.swaggerData.ControllerDesc ? _this.swaggerData.ControllerDesc[tagName] : '太懒没写注释',
                        methods: []
                    };
                }
                // 参数处理
                if (!md.parameters) {
                    md.parameters = [];
                }
                if (md.requestBody) {
                    var schema = _this.findObjs(md.requestBody, [], 'schema')[0] || _this.findObjs(md.requestBody, [], 'multipart/form-data')[0].schema;
                    if (schema) {
                        md.parameters.push(Object.assign({ name: 'data', in: 'body' }, {
                            schema: schema,
                            required: md.requestBody.required
                        }));
                    }
                }
                // 方法
                var method = {
                    methodName: _this.reName(_this.apiConfig.FormatMethodName(url), tags[tagName].methods),
                    url: url,
                    requestName: requestName,
                    summary: _this.removeLineBreak(md.summary) || '太懒没写注释',
                    parameters: md.parameters,
                    responses: md.responses
                };
                tags[tagName].methods.push(method);
            });
        });
        // 调整方法顺序，因为mock时 有可能匹配错误的mock拦截
        lodash_1.default.each(tags, function (c) {
            c.methods = lodash_1.default.orderBy(c.methods, ['methodName'], ['desc']);
        });
        // 清理无方法空模块
        lodash_1.default.remove(tags, function (c) {
            return c.methods.length <= 0;
        });
        return tags;
    };
    /**
     * 获取全部依赖对象
     * @param tag 标签/Controller
     */
    Swagger.prototype.getTagModels = function (tag) {
        var _this = this;
        var models = this.findObjs(tag, [], '$ref');
        var modelsNames = [];
        models.forEach(function (item) {
            var name = _this.apiConfig.FormatModelName(item);
            if (!modelsNames.includes(name))
                modelsNames.push(name);
        });
        return modelsNames;
    };
    // 格式化属性方法
    Swagger.prototype.fmProperties = function (properties, model, requireds) {
        var _this = this;
        lodash_1.default.forEach(properties, function (propertie, name) {
            var newp = {
                name: name,
                description: _this.removeLineBreak(propertie.description),
                type: _this.convertType(propertie),
                required: requireds && requireds.length > 0 ? requireds.includes(name) : undefined
            };
            model.properties.push(newp);
        });
    };
    // 获取全部请求参数对象
    Swagger.prototype.getRequestBodys = function () {
        var _this = this;
        var requestBodyList = [];
        lodash_1.default.forEach(this.swaggerData.paths, function (api, url) {
            lodash_1.default.forEach(api, function (md, requestName) {
                if (md.requestBody) {
                    var schema = _this.findObjs(md.requestBody, [], 'schema')[0] || _this.findObjs(md.requestBody, [], 'multipart/form-data')[0].schema;
                    if (schema) {
                        requestBodyList.push(_this.convertType(schema));
                    }
                }
            });
        });
        return requestBodyList;
    };
    /**
     * 获取全部 Model \ Enum
     * @param node 指定对象节点，可空，如果不传则按默认规则查找
     */
    Swagger.prototype.getModelsAndEnums = function (node) {
        var _this = this;
        var _a, _b, _c;
        if (!node) {
            node = ((_b = (_a = this.swaggerData) === null || _a === void 0 ? void 0 : _a.components) === null || _b === void 0 ? void 0 : _b.schemas) || ((_c = this.swaggerData) === null || _c === void 0 ? void 0 : _c.definitions);
        }
        var enums = [];
        var models = [];
        var requestBodyList = this.getRequestBodys();
        lodash_1.default.forEach(node, function (definition, name) {
            if (definition.hasOwnProperty('enum')) {
                var e_1 = {
                    name: _this.apiConfig.FormatModelName(name),
                    description: _this.removeLineBreak(definition.description),
                    items: []
                };
                var ems = lodash_1.default.zipObject(definition['x-enumNames'], definition.enum);
                lodash_1.default.forEach(ems, function (enumValue, enumName) {
                    var item = {
                        name: enumName,
                        value: Number(enumValue)
                    };
                    e_1.items.push(item);
                });
                enums.push(e_1);
            }
            else {
                var modelName = _this.apiConfig.FormatModelName(name);
                var isParameter = requestBodyList.includes(modelName);
                var m_1 = {
                    name: modelName,
                    description: _this.removeLineBreak(definition.description),
                    baseModel: '',
                    isParameter: isParameter,
                    properties: []
                };
                // 格式化属性
                if (definition.hasOwnProperty('allOf')) {
                    lodash_1.default.forEach(definition.allOf, function (propertie) {
                        if (propertie.hasOwnProperty('$ref')) {
                            m_1.baseModel = _this.apiConfig.FormatModelName(propertie.$ref.substring(propertie.$ref.lastIndexOf('/') + 1));
                        }
                        else {
                            if (propertie.hasOwnProperty('properties')) {
                                _this.fmProperties(propertie.properties, m_1, propertie.required || []);
                            }
                        }
                    });
                }
                else {
                    _this.fmProperties(definition.properties, m_1, definition.required || []);
                }
                models.push(m_1);
            }
        });
        return { models: models, enums: enums };
    };
    /**
     * 获取请求参数
     * @param parameters 参数数组，不同版本swagger有差异
     * @param inTypes 参数类型数组，可同时查多种类型 query、path、body、header
     * @param format 格式化数据
     */
    Swagger.prototype.getParameter = function (parameters, inTypes, format) {
        var _this = this;
        var pas = lodash_1.default.filter(parameters, function (item) {
            return inTypes.includes(item.in);
        }).map(function (item) {
            return __assign(__assign({}, item), { type: _this.convertType(item) });
        });
        // 格式化
        if (format) {
            return pas.map(function (item) {
                return format(item);
            });
        }
        // 排序一下参数，把非必填参数排后面
        return pas.sort(function (a, b) {
            if (a.required && !b.required) {
                return -1; // a在b之前
            }
            else if (!a.required && b.required) {
                return 1; // b在a之前
            }
            return 0; // 顺序不变
        });
    };
    /**
     * 获取请求参数
     * @param responses 返回对象
     */
    Swagger.prototype.getResponses = function (responses) {
        var schema = this.findObjs(responses, [], 'schema')[0];
        return this.convertType(schema);
    };
    /**
     * 格式化模拟值
     * @param val 默认格式化后的值
     * @param p 对应的属性
     * @param mock 最终模拟数据
     */
    Swagger.prototype.formatMock = function (val, p, mock) {
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
    };
    /**
     * 格式化模拟数据
     * @param responses 当前需要模拟的对象
     * @param models 接口全部对象
     * @param fm 格式化模拟数据函数
     * @param deep 递归层级，防止对象父子嵌套导致死循环 默认递归5级
     */
    Swagger.prototype.mock = function (responses, models, deep) {
        var _this = this;
        if (deep === void 0) { deep = 1; }
        var responsesList;
        if (responses.indexOf('&') > 0) {
            responsesList = responses.split('&');
        }
        else {
            responsesList = [responses];
        }
        var mock = {};
        responsesList.forEach(function (item) {
            var _name = item.trim().replace('{data:', '').replace('}', '');
            var model = lodash_1.default.find(models, { name: _name });
            if (model) {
                model.properties.forEach(function (p) {
                    // 'string' | 'number' | 'boolean' | 'file' | 'array' | 'enum' | 'schema'
                    var v = '';
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
                            v = deep > 5 ? [] : [_this.mock(p.type, models, deep + 1)];
                            break;
                        case 'enum':
                            v = p.type;
                            break;
                        case 'schema':
                            v = deep > 5 ? null : _this.mock(p.type, models, deep + 1);
                            break;
                    }
                    mock = _this.apiConfig.FormatMock(v, p, mock);
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
    };
    /**
     * 生成代码
     * @param TplPath 模板绝对地址
     * @param OutPath 文件存放绝对地址
     * @param fileName 文件名称
     * @param data.tag 当前控制器标签（仅生成控制器代码时有值）
     * @param data.swaggerData 接口数据
     * @param data.apiConfig 接口配置
     */
    Swagger.prototype.codeRender = function (TplPath, OutPath, fileName, data) {
        return __awaiter(this, void 0, void 0, function () {
            var fileText, savePath, content, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!(0, fs_2.markDirsSync)(OutPath)) return [3 /*break*/, 4];
                        fileText = ejs_1.default.render(fs_1.default.readFileSync(TplPath, 'utf-8'), data, {
                            context: this
                        });
                        savePath = path_1.default.join(OutPath, fileName);
                        if (!this.prettierOptions) return [3 /*break*/, 2];
                        return [4 /*yield*/, prettier_1.default.format(fileText, { parser: 'babel-ts', singleQuote: true, printWidth: 180, tabWidth: 2, semi: false, trailingComma: 'none' })];
                    case 1:
                        _a = _b.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        _a = fileText;
                        _b.label = 3;
                    case 3:
                        content = _a;
                        fs_1.default.writeFileSync(savePath, content);
                        _b.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 生成代码
     */
    Swagger.prototype.generate = function () {
        var _this = this;
        var saveBaseDir = path_1.default.join(this.apiConfig.OutPath, 'base');
        var saveModelsDir = path_1.default.join(this.apiConfig.OutPath, 'model');
        var saveMockDir = path_1.default.join(this.apiConfig.OutPath, 'mock');
        var tplBasePath = path_1.default.join(this.apiConfig.TplPath, 'base.ejs');
        var tplMethodPath = path_1.default.join(this.apiConfig.TplPath, 'method.ejs');
        var tplModelsPath = path_1.default.join(this.apiConfig.TplPath, 'model.ejs');
        var tplMockPath = path_1.default.join(this.apiConfig.TplPath, 'mock.ejs');
        var tplMockMethodPath = path_1.default.join(this.apiConfig.TplPath, 'mock-method.ejs');
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
        var tags = this.getTags();
        lodash_1.default.forEach(tags, function (tag, tagName) {
            _this.codeRender(tplMethodPath, _this.apiConfig.OutPath, _this.apiConfig.FormatControllerName(tagName) + '.ts', { tag: tag, swaggerData: _this.swaggerData, apiConfig: _this.apiConfig });
            // 生成-Mock-接口
            if (_this.apiConfig.Mock) {
                _this.codeRender(tplMockMethodPath, saveMockDir, _this.apiConfig.FormatControllerName(tagName) + '.ts', { tag: tag, swaggerData: _this.swaggerData, apiConfig: _this.apiConfig });
            }
        });
        // 生成-Mock
        if (this.apiConfig.Mock) {
            this.codeRender(tplMockPath, saveMockDir, 'index.ts', {
                swaggerData: this.swaggerData,
                apiConfig: this.apiConfig
            });
        }
    };
    return Swagger;
}());
exports.Swagger = Swagger;
//# sourceMappingURL=swagger.js.map