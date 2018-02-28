/**
 * 使用esri-loader提供的dojoRequire时，模式还是dojoRequire([],fun)的形式，
 * 为了彻底的转到es6，该模块利用Callbacks机制，提供了esri模块新的加载方式。使得代码可以完全按照es6的形式进行组织。
 * Created by yyl on 2017/12/8.
 */

//这里是公用的方法
import {loadModules} from 'esri-loader';
import gp from './GlobalPromise';

let __esri__ = Symbol();

/**
 * 为类添加静态属性esri对象，它属性为要添加进来的esri模块
 * @param classes 要添加的esri模块
 * @returns {function(*=)} 修饰器函数
 */
function importEsri(classes) {
    return (target)=>{
        target[__esri__] = new Promise(resolve=>{
            gp.then(()=>{
                return loadModules(classes,{
                    url: importEsri.libraryRoot
                });
            }).then(function () {
                let ags = arguments[0];
                let args = classes.map(function (cls) {
                    let clz = cls.split('/');
                    return clz[clz.length - 1];
                });
                target.esri={};
                args.forEach((arg,idx)=>{
                    target.esri[arg] = ags[idx];
                });
                resolve(target.esri);
            }).catch((err)=>{
                console.error(err);
                target.esri={};
                resolve(target.esri);
            });
        });
    }
}

//指定ArcGIS For JavaScript API 的入口
importEsri.libraryRoot = "https://js.arcgis.com/4.5/";

/**
 * 修饰类方法，改修饰器必须基于@importEsri类修饰器使用，它修饰类的方法，
 * 将被修饰的方法变为async函数，等esri的模块完全加载后才执行
 * @param target
 * @param name
 * @param descriptor
 * @returns {*}
 */
function awaitEsri(target, name, descriptor) {
    let oldFun =  target[name];
    descriptor.value=function () {
        let promise = this.__proto__.constructor[__esri__];
        return promise.then(()=>{
            return Promise.resolve(oldFun.apply(this,arguments))
        });
    };
    return descriptor;
}

export {importEsri, awaitEsri};
