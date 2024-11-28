import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { defaults as defaultControls } from 'ol/control';
import { fromLonLat } from 'ol/proj';

export function createMap(target: HTMLElement, vectorSource: VectorSource): Map {
  const vectorLayer = new VectorLayer({
    source: vectorSource,
  });

  const osmLayer = new TileLayer({
    source: new OSM({
      attributions: [] // Remove attributions
    })
  });

  return new Map({
    target,
    layers: [osmLayer, vectorLayer],
    controls: defaultControls({
      zoom: false,      // Remove zoom controls
      rotate: false,    // Remove rotate control
      attribution: false // Remove attribution control
    }),
    view: new View({
      center: fromLonLat([0, 20]),
      zoom: 2,
      maxZoom: 19,
      minZoom: 2
    })
  });
}