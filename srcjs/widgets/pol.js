import "widgets";
// projections
import proj4 from "proj4";
import { register } from "ol/proj/proj4.js";
import * as olProj from "ol/proj";

// openlayers
import Map from "ol/Map.js";
import View from "ol/View.js";
import Overlay from "ol/Overlay.js";
import * as olStyle from "ol/style";
import GeoJSON from "ol/format/GeoJSON.js";
import Feature from "ol/Feature.js";
import Point from "ol/geom/Point.js";
import MultiPoint from "ol/geom/MultiPoint.js";
import * as olExtent from "ol/extent";
import { defaults as control_defaults } from "ol/control/defaults";

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

// ol-ext
import LayerSwitcher from "ol-ext/control/LayerSwitcher.js";

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

        function read_geojson(data, data_proj, view_proj) {
            var features = new GeoJSON().readFeatures(data, {
                dataProjection: data_proj, //?? || undefined,
                featureProjection: view_proj
            });
            return features;
        }

        // https://openlayers.org/en/latest/apidoc/module-ol_style_Text-Text.html
        function make_text_style(style) {
            style.stroke = style.stroke ? new olStyle.Stroke(style.stroke) : null;
            style.fill = style.fill ? new olStyle.Fill(style.fill) : null;
            style.backgroundStroke = style.backgroundStroke ? new olStyle.Stroke(style.backgroundStroke) : null;
            style.backgroundFill = style.backgroundFill ? new olStyle.Fill(style.backgroundFill) : null;
            return new olStyle.Text(style);
        }

        // https://openlayers.org/en/latest/apidoc/module-ol_style_Style.html
        function make_style(style) {
            var styleobj = new olStyle.Style({
                fill: style.fill ? new olStyle.Fill(style.fill) : null,
                image: style.image ? new olStyle.Image(style.image) : null,
                stroke: style.stroke ? new olStyle.Stroke(style.stroke) : null,
                text: style.text ? make_text_style(style.text) : null,
                zIndex:  style.zIndex
            });
            return styleobj;
        }

        function points_from_array(data, view_proj) {
            var pts = [];
            for (var pt of data) {
                pts.push(new Feature({ geometry: new Point(olProj.fromLonLat(pt, view_proj)) }));
            }
            return pts;
        }

        // set a property on features
        function set_feature_property(features, property_name, value) {
            for (var i = 0; i < features.length; ++i) {
                features[i].set(property_name, value instanceof Array ? value[i] : value);
            }
        }

        function render_popup(feature, overlay, value) {
            overlay.getElement().innerHTML = value;
            var geometry = feature.getGeometry();
            var extent = geometry.getExtent();
            var anchor = olExtent.getCenter(extent);
            var offset = geometry.getType() === "Point" ? [0, -10] : [0, 0];
            overlay.setOffset(offset);
            overlay.setPosition(anchor);
        };

        methods.add_fgb = function(url, style, flat_style, options) {
            const source = new VectorSource();
            const loader = createLoader(source, url);
            source.setLoader(loader);
            var layer = new VectorLayer(vector_source_with_options(source, options));
            if (options.name) {
                layer.set("name", options.name);
            }
            if (flat_style) {
                layer.setStyle(flat_style);
            } else {
                layer.setStyle(make_style(style));
            }
            this.addLayer(layer);
        }

        methods.add_geojson = function(data, style, flat_style, popup, options, data_proj) {
            const view_proj = this.getView().getProjection();
            var features = read_geojson(data, data_proj, view_proj);
            var dataSource = new VectorSource({
                features: features
            });
            var layer = new VectorLayer(vector_source_with_options(dataSource, options));
            if (options.name) {
                layer.set("name", options.name);
            }
            if (flat_style) {
                layer.setStyle(flat_style);
            } else {
                layer.setStyle(make_style(style));
            }
            if (popup) {
                set_feature_property(features, "popup", popup); // set this on the feature
                layer.set("popup_property", "popup");
            }
            this.addLayer(layer);
        };

        methods.add_points = function(data, style, flat_style, popup, options) {
            const features = points_from_array(data, this.getView().getProjection());
            const source = new VectorSource({
                features: features,
            });
            const layer = new VectorLayer(vector_source_with_options(source, options));
            if (options.name) {
                layer.set("name", options.name);
            }
            if (flat_style) {
                layer.setStyle(flat_style);
            } else {
                layer.setStyle(make_style(style));
            }
            if (popup) {
                set_feature_property(features, "popup", popup); // set this on the feature
                layer.set("popup_property", "popup");
            }
            this.addLayer(layer);
        }

        methods.add_wms_tiles = function(url, params, tile_wms_options, options) {
            tile_wms_options = tile_wms_options || {};
            tile_wms_options.url = url;
            tile_wms_options.params = params;
            //hidpi: false
            var source = new TileWMS(tile_wms_options);
            var l = new TileLayer(tile_source_with_options(source, options));
            if (options.name) { l.set("name", options.name); }
            this.addLayer(l);
        };

        methods.add_cog = function(sources, geotiff_source_options, options) {
            geotiff_source_options = geotiff_source_with_options(sources, geotiff_source_options);
            const source = new GeoTIFF(geotiff_source_options);
            var l = new WebGLTile(tile_source_with_options(source, options));
            if (options.name) { l.set("name", options.name); }
            this.addLayer(l);
        };


        methods.add_layer_switcher = function() {
            var ctrl = new LayerSwitcher({
                // collapsed: false,
                // mouseover: true
            });
            this.addControl(ctrl);
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
                proj4.defs("EPSG:3031","+proj=stere +lat_0=-90 +lat_ts=-71 +lon_0=0 +k=1 +x_0=0 +y_0=0 +ellps=WGS84 +datum=WGS84 +units=m +no_defs");
                register(proj4);

                const projection = x.view_options.projection || "EPSG:3031";
                var extent = x.view_options.extent || undefined;

                // overlay to hold popups
                // add container first
                var popup_container = document.createElement("div");
                popup_container.setAttribute("id", "popup_container");
                popup_container.setAttribute("class", "pol-popup");
                el.parentElement.insertBefore(popup_container, el.nextSibling);
                const overlay = new Overlay({
                    element: popup_container,
                    positioning: "bottom-center",
                    autoPan: { animation: { duration: 250, }, },
                });
                popup_container.addEventListener("click", function() {
                    overlay.setPosition(); // hide it
                });

                map = new Map({
                    target: el.id,
                    controls: control_defaults(x.control_options),
                    overlays: [overlay],
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

                map.on("singleclick", function(evt) {
                    const coordinate = evt.coordinate;
                    var coordinate_longlat = olProj.transform(coordinate, projection, "EPSG:4326");
                    console.log("xy: " + coordinate + ", longlat: " + coordinate_longlat);
                    if (HTMLWidgets.shinyMode) {
                        var lnglat = { x: coordinate[0], y: coordinate[1], long: coordinate_longlat[0], lat: coordinate_longlat[1] };
                        Shiny.setInputValue(el.id + "_click", lnglat);
                    }
                    // show popup for each feature at this pixel, if one has been defined
                    map.forEachFeatureAtPixel(evt.pixel, function(feature, layer) {
                        console.log("layer name:" + layer.get("name"));
                        var popup_property = layer.get("popup_property");
                        if (popup_property) {
                            // if this layer has had a popup set, render it
                            render_popup(feature, overlay, feature.get(popup_property));
                        }
                    });
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
