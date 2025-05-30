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
exports.copy = copy;
exports.markDirsSync = markDirsSync;
exports.removeDirSync = removeDirSync;
const fs_1 = __importStar(require("fs"));
const path_1 = __importDefault(require("path"));
/**
 * 复制
 * @param src 源地址
 * @param dst 目标地址
 */
function copy(src, dst) {
    //测试某个路径下文件是否存在
    if (!fs_1.default.existsSync(dst)) {
        //不存在
        fs_1.default.mkdir(dst, function () {
            //创建目录
            copy(src, dst);
        });
    }
    //读取目录
    fs_1.default.readdir(src, function (err, paths) {
        if (err) {
            throw err;
        }
        paths.forEach(function (path) {
            var _src = src + '/' + path;
            var _dst = dst + '/' + path;
            var readable;
            var writable;
            (0, fs_1.stat)(_src, function (err, st) {
                if (err) {
                    throw err;
                }
                if (st.isFile()) {
                    readable = fs_1.default.createReadStream(_src); //创建读取流
                    writable = fs_1.default.createWriteStream(_dst); //创建写入流
                    readable.pipe(writable);
                }
                else if (st.isDirectory()) {
                    //测试某个路径下文件是否存在
                    if (fs_1.default.existsSync(_dst)) {
                        //存在
                        copy(_src, _dst);
                    }
                    else {
                        //不存在
                        fs_1.default.mkdir(_dst, function () {
                            //创建目录
                            copy(_src, _dst);
                        });
                    }
                }
            });
        });
    });
}
/**
 * 创建目录
 * @param path 目录
 */
function markDirsSync(path) {
    try {
        if (!fs_1.default.existsSync(path)) {
            let pathtmp = '';
            path.split(/[/\\]/).forEach(dirname => {
                // 这里指用/ 或\ 都可以分隔目录  如  linux的/usr/local/services   和windows的 d:\temp\aaaa
                if (pathtmp) {
                    pathtmp = path_1.default.join(pathtmp, dirname);
                }
                else {
                    pathtmp = dirname || '/';
                }
                if (!fs_1.default.existsSync(pathtmp)) {
                    fs_1.default.mkdirSync(pathtmp);
                }
            });
        }
        return true;
    }
    catch (e) {
        console.log('创建目录出错', e);
        return false;
    }
}
/**
 * 删除文件夹
 * @param path 地址
 */
function removeDirSync(path) {
    let files = [];
    /**
     * 判断给定的路径是否存在
     */
    if (fs_1.default.existsSync(path)) {
        /**
         * 返回文件和子目录的数组
         */
        files = fs_1.default.readdirSync(path);
        files.forEach(function (file) {
            const curPath = path_1.default.join(path, file);
            /**
             * fs.statSync同步读取文件夹文件，如果是文件夹，在重复触发函数
             */
            if (fs_1.default.statSync(curPath).isDirectory()) {
                // recurse
                removeDirSync(curPath);
            }
            else {
                fs_1.default.unlinkSync(curPath);
            }
        });
        /**
         * 清除文件夹
         */
        fs_1.default.rmdirSync(path);
    }
    else {
        console.log('给定的路径不存在，请给出正确的路径');
    }
}
