import {importEsri, awaitEsri} from '../src';

@importEsri([
    "esri/Map",
    "esri/views/SceneView"
])
class BaseMap {
    constructor(){
        this.initBaseMap();
    }
    @awaitEsri
    async initBaseMap(){
        const {Map, SceneView} = BaseMap.esri;
        this. map =  new Map({
            basemap: "dark-gray",
            layers: [permitsLayer]
        });
        this.view = new SceneView({
            map: map
        });
    }
}

@importEsri(["esri/layers/MapImageLayer"])
class Map {
    @awaitEsri
    addImageLayer(){
        const {MapImageLayer} = Map.esri;

        let layer = new MapImageLayer({
            portalItem: { // autocasts as new PortalItem()
                id: "d7892b3c13b44391992ecd42bfa92d01"
            }
        });

        this.map.add(layer);

        console.log(Map.esri);
    }
}