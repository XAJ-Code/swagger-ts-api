"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_1 = require("./fs");
/**
 * 初始化配置
 * @param basePath 系统根目录
 */
exports.default = (basePath) => {
    const srcPath = path_1.default.join(__dirname, '../def');
    const savePath = path_1.default.join(basePath, 'nswag');
    (0, fs_1.copy)(srcPath, savePath);
    console.log('初始化成功!');
    console.log('请修改nswag文件夹下的config.js配置文件');
    console.log('请修改nswag/tpl文件夹下的模板文件');
    console.log('初始化配置路径：' + savePath);
};
