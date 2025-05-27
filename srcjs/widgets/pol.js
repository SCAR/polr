import "widgets";
// projections
import proj4 from "proj4";
import { register } from "ol/proj/proj4.js";
import { defaults as control_defaults } from 'ol/control/defaults';
// openlayers
import Map from "ol/Map.js";
import View from "ol/View.js";
import Style from "ol/style/Style.js";
// sources
import GeoTIFF from "ol/source/GeoTIFF.js";
import TileWMS from "ol/source/TileWMS.js";
import VectorSource from "ol/source/Vector.js";
// import OSM from "ol/source/OSM.js";
// layers
import TileLayer from "ol/layer/Tile.js";
import VectorLayer from "ol/layer/Vector.js";
import WebGLTile from "ol/layer/WebGLTile.js";

import { createLoader } from "flatgeobuf/lib/mjs/ol.js";

HTMLWidgets.widget({

    name: "pol",

    type: "output",

    factory: function(el, width, height) {
        var map = null;
        var methods = {};

        var vector_source_with_options = function(source, options) {
            options = options || {};
            options.source = source;
            return options;
        };

        var tile_source_with_options = function(source, options) {
            options = options || {};
            options.source = source;
            options.preload = true;
            options.crossOrigin = options.crossOrigin || "anonymous";
            options.title = options.name || undefined;
            return options;
        };

        var geotiff_source_with_options = function(sources, options) {
            options = options || {};
            options.sources = sources;
            // sourceOptions, convertToRGB, normalize, projection, transition, wrapX, interpolate
            return options;
        };

        var geotiff_with_options = function(source, options) {
            options = options || {};
            options.source = source;
            // opacity, style, etc
            return options;
        };

        methods.add_fgb = function(url, style, options) {
            const source = new VectorSource();
            const loader = createLoader(source, url);
            source.setLoader(loader);
            var layer = new VectorLayer(vector_source_with_options(source, options));
            layer.set("title", layer.get("name"));
            if (style) {
                layer.setStyle(style);
            }
            this.addLayer(layer);
        }

        methods.add_wms_tiles = function(url, params, tile_wms_options, options) {
            tile_wms_options = tile_wms_options || {};
            tile_wms_options.url = url;
            tile_wms_options.params = params;
            //hidpi: false
            var source = new TileWMS(tile_wms_options);
            this.addLayer(new TileLayer(tile_source_with_options(source, options)));
        };

        methods.add_cog = function(sources, geotiff_source_options, options) {
            geotiff_source_options = geotiff_source_with_options(sources, geotiff_source_options);
            const source = new GeoTIFF(geotiff_source_options);
            this.addLayer(new WebGLTile(tile_source_with_options(source, options)));
        };

        // handle proxy calls
        if (HTMLWidgets.shinyMode) {
            Shiny.addCustomMessageHandler("pol-proxy-calls", function (call) {
                var id = call.id;
                var el = document.getElementById(id);
                var map = el ? $(el).data("polr-map") : null;
                if (!map) {
                    console.log("Couldn't find map with id " + id);
                    return;
                }
                if (methods[call.method_name]) {
                    methods[call.method_name].apply(map, call.args)
                } else {
                    console.log("Unknown method " + call.method_name);
                }
            });
        }

        return {
            renderValue: function(x) {
                proj4.defs('EPSG:3031','+proj=stere +lat_0=-90 +lat_ts=-71 +lon_0=0 +k=1 +x_0=0 +y_0=0 +ellps=WGS84 +datum=WGS84 +units=m +no_defs');
                register(proj4);

                const projection = x.view_options.projection || "EPSG:3857";
                var extent = x.view_options.extent || undefined;
                map = new Map({
                    target: el.id,
                    controls: control_defaults(x.control_options),
                    view: new View({
                        center: x.view_options.center || [0, 0],
                        zoom: x.view_options.zoom || 2,
                        minZoom: x.view_options.minZoom,
                        maxZoom: x.view_options.maxZoom,
                        projection: projection,
                        extent: extent,
                    }),
                    loadTilesWhileAnimating: true
                });

                // calls are any chained calls added with pipe operators to the initial map call
                for (var i = 0; i < x.calls.length; ++i) {
                    var call = x.calls[i];
                    // console.log("current call:", call);
                    methods[call.method].apply(map, call.args);
                }

                if (HTMLWidgets.shinyMode) {
                    // attach the map data to the element so we can use it later in proxy calls
                    $(el).data("polr-map", map);
                }

            },

            resize: function(width, height) {
                // re-render the widget with a new size
            }
        };
    }
});
