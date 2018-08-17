/**
 * 使用esri-loader提供的dojoRequire时，模式还是dojoRequire([],fun)的形式，
 * 为了彻底的转到es6，该模块利用Callbacks机制，提供了esri模块新的加载方式。使得代码可以完全按照es6的形式进行组织。
 * Created by yyl on 2017/12/8.
 */

//这里是公用的方法
import {loadModules} from 'esri-loader';

let __esri__ = Symbol();

/**
 * 为类添加静态属性esri对象，它属性为要添加进来的esri模块
 * @param classes 要添加的esri模块
 * @returns {function(*=)} 修饰器函数
 */
function importEsri(classes) {
    return (target)=>{
        target.esri={};
        target[__esri__] = new Promise(resolve=>{
            //加载自身引用的ags类
            let selfPromise = Promise.resolve().then(()=>{
                return loadModules(classes,{
                    url: importEsri.libraryRoot
                });
            });
            //解决继承出现的问题，因为子类继承父类，虽然父类先去加载ags 类，但是如果父类加载的类比较多，就迟与子类的返回，导致，子类已经运行，父类还卡着。
            //父类加__esri__,他resolve的是父类的esri属性
            let parent__esri__ = target.__proto__[__esri__];
            Promise.all([selfPromise, parent__esri__])
                .then(([selfClz, parentEsri])=>{
                    let ags = selfClz;
                    let args = classes.map(function (cls) {
                        let clz = cls.split('/');
                        return clz[clz.length - 1];
                    });

                    args.forEach((arg,idx)=>{
                        target.esri[arg] = ags[idx];
                    });

                    //将父类加载的ags类copy到子类中。
                    Object.assign(target.esri,parentEsri);
                    resolve(target.esri);
                })
                .catch((err)=>{
                    console.error(err);
                    resolve(target.esri);
                });
        });
    }
}

//指定ArcGIS For JavaScript API 的入口
importEsri.libraryRoot = "https://js.arcgis.com/4.8/";

/**
 * 修饰类方法，改修饰器必须基于@importEsri类修饰器使用，它修饰类的方法，
 * 将被修饰的方法变为async函数，等esri的模块完全加载后才执行
 * @param target  类的原型对象
 * @param name
 * @param descriptor   descriptor对象原来的值如下
 *                      {
 *                        value: specifiedFunction,
 *                        enumerable: false,
 *                        configurable: true,
 *                        writable: true
 *                      };
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