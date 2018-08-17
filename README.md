# esri-import
基于注解的ArcGIS For JavaScript 模块加载器。

#安装
```shell
$ npm install esri-import --save
```
## 使用
Map.js
```javascript
import React,{Component} from 'react';
import {importEsri, awaitEsri} from 'esri-import';
//指定ArcGIS For JavaScript 的入口，系统中只需指定一次，默认为：https://js.arcgis.com/4.8/。
importEsri.libraryRoot = "http://localhost:8080/arcgis_js_api/library/4.8/init.js";

@importEsri([
    'esri/Map',
    "esri/Color",
    "esri/views/MapView",
    "esri/layers/TileLayer",
    "esri/geometry/Polyline",
    "esri/Graphic",
    "esri/layers/GraphicsLayer",
    "esri/layers/MapImageLayer"])
export default class Map extends Component{
    @awaitEsri
    componentDidMount() {
        
        let esri = Map.esri;
        this.map = new esri.Map({
            basemap:'streets-night-vector'
        });

        let view = new esri.MapView({
            center:[119.297999,26.074068],
            map: this.map,
            zoom: 8,
            popup: {
                dockEnabled: true,
                dockOptions: {
                    position: 'bottom-left'
                }
            },
            container: this.mapContainer
        });
    };

    @awaitEsri
    componentWillReceiveProps(nextProps){
        //这里可以更新地图
    }

    //一般地图组件不要让它重新渲染
    shouldComponentUpdate(){
        return false;
    }
    render(){
        return <div ref={node => this.mapContainer = node}/>
    }
}
```

首先为`importEsri`指定了ArcGIS For JavaScript 的入口，也可以不指定，默认为https://js.arcgis.com/4.8/。
`importEsri`接收一个数组，用来来注解一个类，它会为该类添加一个静态属性`esri`。该静态属性中包含了你所导入的esri JavaScript模块，支持继承，父类加载的esri模块会植入子类的esri模块。

当要使用这些导入的模块时，最好为相应的方法添加`@awaitEsri`注解，它可以确保你所注解的方法在模块完全加载完成才执行，但是要知道，添加了该注解后，你的方法的返回值就变成了`Promise`,如果你的方法有返回值，则须通过`promise`的`then`方法来获取。

如果好用，可以star下 :clap: :clap: :clap:
