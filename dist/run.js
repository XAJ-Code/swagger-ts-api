"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const url_1 = require("url");
const fs_1 = __importDefault(require("fs"));
const ora_1 = __importDefault(require("ora"));
const readline_1 = __importDefault(require("readline"));
const swagger_1 = require("./swagger");
const https_1 = __importDefault(require("https"));
const axios_1 = __importDefault(require("axios"));
/**
 * 生成代码
 * @param basePath 是否调试模式
 */
exports.default = async (basePath) => {
    // 根据配置文件路径获取配置对象
    // 自动检测 config.js / config.cjs / config.mjs
    const configDir = path_1.default.join(basePath, 'nswag');
    const extensions = ['.js', '.cjs', '.mjs'];
    let configPath = '';
    for (const ext of extensions) {
        const p = path_1.default.join(configDir, `config${ext}`);
        if (fs_1.default.existsSync(p)) {
            configPath = p;
            break;
        }
    }
    if (!configPath) {
        throw new Error(`找不到配置文件，请在 nswag/ 目录下创建 config.js / config.cjs / config.mjs`);
    }
    //兼容esm和cjs配置文件（eval防止TS编译为require，pathToFileURL解决Windows路径问题）
    const configUrl = (0, url_1.pathToFileURL)(configPath).href;
    let res = await eval('import(configUrl)');
    const nswagOptions = res.default || res;
    const spinner = (0, ora_1.default)(`你配置文件的路径:${configPath}`).start();
    spinner.color = 'yellow';
    nswagOptions.Apis.forEach((apiConfig) => {
        // renderProgress(`正在生成 ${apiConfig.ApiName}`)
        spinner.text = `正在生成 ${apiConfig.ApiName}`;
        getSwaggerData(apiConfig.SwaggerUrl).then((r) => {
            // console.log('r: ', r);
            //将r 写入文件中
            // fs.writeFileSync(_path.join(basePath, 'swagger.json'), JSON.stringify(r, null, 2))
            const swagger = new swagger_1.Swagger(basePath, apiConfig, r, nswagOptions.prettier);
            swagger.generate();
        });
        // renderProgress(`${apiConfig.ApiName} 生成成功`)
        setTimeout(() => {
            spinner.succeed(`${apiConfig.ApiName} 生成成功`);
            spinner.stop();
        }, 3000);
    });
};
/**
 * 生成进度
 * @param text 文字
 * @param step 进度
 * @param isOk 完成
 */
function renderProgress(text) {
    readline_1.default.cursorTo(process.stdout, 0, 1);
    readline_1.default.clearScreenDown(process.stdout);
    process.stdout.write(`${text}`);
}
/**
 * 获取Swagger的JSON数据
 * @param swaggerUrl
 */
function getSwaggerData(swaggerUrl) {
    const agent = new https_1.default.Agent({
        rejectUnauthorized: false
    });
    return new Promise((resolve, reject) => {
        axios_1.default.get(swaggerUrl, { httpsAgent: agent })
            .then((response) => {
            if (response.status === 200) {
                const d = response.data;
                try {
                    const result = typeof d === 'string' ? JSON.parse(d) : d;
                    resolve(result);
                }
                catch (error) {
                    reject(new Error('Swagger数据解析失败'));
                }
            }
            else {
                reject(new Error('获取swagger数据失败'));
            }
        })
            .catch((error) => {
            reject(new Error(`获取swagger数据失败: ${error.message}`));
        });
    });
}
