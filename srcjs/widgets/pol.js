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
import Polygon from "ol/geom/Polygon.js";
import * as olExtent from "ol/extent";
import { defaults as control_defaults } from "ol/control/defaults";

// sources
import GeoTIFF from "ol/source/GeoTIFF.js";
import TileWMS from "ol/source/TileWMS.js";
import VectorSource from "ol/source/Vector.js";
import Cluster from "ol/source/Cluster.js";
import WMTSCapabilities from "ol/format/WMTSCapabilities.js";
import WMTS, {optionsFromCapabilities} from "ol/source/WMTS.js";

// import OSM from "ol/source/OSM.js";

// layers
import TileLayer from "ol/layer/Tile.js";
import VectorLayer from "ol/layer/Vector.js";
import WebGLTile from "ol/layer/WebGLTile.js";

import { createLoader } from "flatgeobuf/lib/mjs/ol.js";

// ol-ext
import LayerSwitcher from "ol-ext/control/LayerSwitcher.js";

// other
import monotoneChainConvexHull from "monotone-chain-convex-hull";

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
            let this_style = JSON.parse(JSON.stringify(style)); // clone
            this_style.stroke = this_style.stroke ? new olStyle.Stroke(this_style.stroke) : null;
            this_style.fill = this_style.fill ? new olStyle.Fill(this_style.fill) : null;
            this_style.backgroundStroke = this_style.backgroundStroke ? new olStyle.Stroke(this_style.backgroundStroke) : null;
            this_style.backgroundFill = this_style.backgroundFill ? new olStyle.Fill(this_style.backgroundFill) : null;
            return new olStyle.Text(this_style);
        }

        function make_circle_style(style) {
            let this_style = JSON.parse(JSON.stringify(style)); // clone
            this_style.radius = this_style.radius || 10;
            this_style.stroke = this_style.stroke ? new olStyle.Stroke(this_style.stroke) : null;
            this_style.fill = this_style.fill ? new olStyle.Fill(this_style.fill) : null;
            return new olStyle.Circle(this_style);
        }

        // TODO make_regular_shape_style

        // https://openlayers.org/en/latest/apidoc/module-ol_style_Style.html
        function make_style(style) {
            var styleobj = new olStyle.Style({
                fill: style.fill ? new olStyle.Fill(style.fill) : null,
                image: style.image ? new olStyle.Image(style.image) : null,
                image: style.icon ? new olStyle.Icon(style.icon) : null,
                image: style.shape ? new olStyle.RegularShape(style.shape) : null,
                image: style.circle ? make_circle_style(style.circle) : null,
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

        methods.add_fgb = function(url, style, flat_style, popup, options) {
            options = options || {};
            const source = new VectorSource();
            const loader = createLoader(source, url);
            source.setLoader(loader);
            var layer = new VectorLayer(vector_source_with_options(source, options));
            layer.set("name", options.name ? options.name : "Unnamed layer");
            if (flat_style) {
                layer.setStyle(flat_style);
            } else if (style) {
                layer.setStyle(make_style(style));
            }
            if (popup) {
                layer.set("popup_property", "popup");
                source.on("featuresloadend", (event) => {
                    set_feature_property(event.features, "popup", popup); // set this on the feature
                });
            }
            this.addLayer(layer);
        }

        methods.add_geojson = function(data, style, flat_style, popup, data_proj, properties, options) {
            options = options || {};
            const view_proj = this.getView().getProjection();
            var features = read_geojson(data, data_proj, view_proj);
            var dataSource = new VectorSource({
                features: features
            });
            var layer = new VectorLayer(vector_source_with_options(dataSource, options));
            layer.set("name", options.name ? options.name : "Unnamed layer");
            if (flat_style) {
                layer.setStyle(flat_style);
            } else if (style) {
                layer.setStyle(make_style(style));
            }
            if (popup) {
                set_feature_property(features, "popup", popup); // set this on the feature
                layer.set("popup_property", "popup");
            }
            if (properties) {
                for (var pn in properties) {
                    layer.set(pn, properties[pn]);
                }
            }
            this.addLayer(layer);
        };

        methods.add_points = function(data, style, flat_style, popup, options) {
            options = options || {};
            const features = points_from_array(data, this.getView().getProjection());
            const source = new VectorSource({
                features: features,
            });
            const layer = new VectorLayer(vector_source_with_options(source, options));
            layer.set("name", options.name ? options.name : "Unnamed layer");
            if (flat_style) {
                layer.setStyle(flat_style);
            } else if (style) {
                layer.setStyle(make_style(style));
            }
            if (popup) {
                set_feature_property(features, "popup", popup); // set this on the feature
                layer.set("popup_property", "popup");
            }
            this.addLayer(layer);
        }

        methods.add_clustered_points = function(data, cluster_style, cluster_hull_style, marker_style, popup, cluster_options, options) {
            options = options || {};
            cluster_options = cluster_options || {};
            cluster_style = make_style(cluster_style);
            marker_style = make_style(marker_style);
            const features = points_from_array(data, this.getView().getProjection());
            const source = new VectorSource({
                features: features,
            });
            const clusterSource = new Cluster({
                distance: parseInt(cluster_options.distance || 20),
                minDistance: parseInt(cluster_options.min_distance || 0),
                source: source,
            });

            // show convex hull of clusters on hover: https://openlayers.org/en/latest/examples/clusters-dynamic.html
            let hoverFeature;
            /**
             * Style for convex hulls of clusters, activated on hover.
             * @param {Feature} cluster The cluster feature.
             * @return {Style|null} Polygon style for the convex hull of the cluster.
             */
            const convex_hull_fill = new olStyle.Fill(cluster_hull_style.fill);
            const convex_hull_stroke = new olStyle.Stroke(cluster_hull_style.stroke);
            function clusterHullStyle(cluster) {
                if (cluster !== hoverFeature) {
                    return null;
                }
                const originalFeatures = cluster.get("features");
                const points = originalFeatures.map((feature) =>
                    feature.getGeometry().getCoordinates(),
                );
                return new olStyle.Style({
                    geometry: new Polygon([monotoneChainConvexHull(points)]),
                    fill: convex_hull_fill,
                    stroke: convex_hull_stroke,
                });
            }
            const clusterHulls = new VectorLayer({
                source: clusterSource,
                style: clusterHullStyle,
            });
            clusterHulls.set("no_legend", true);
            clusterHulls.set("name", options.name ? options.name + " cluster hulls" : "Unnamed layer cluster hulls");

            const styleCache = {};
            const layer = new VectorLayer({
                source: clusterSource,
                style: function (feature) {
                    const size = feature.get("features").length;
                    if (size > 1) {
                        let this_style = styleCache[size];
                        if (!this_style) {
                            this_style = cluster_style.clone();
                            this_style.getText().setText(size.toString()); // text indicates number of features in cluster
                            styleCache[size] = this_style;
                        }
                        return this_style;
                    }
                    // otherwise the cluster contains only one feature
                    return marker_style;
                },
            });
            layer.set("name", options.name ? options.name : "Unnamed layer");

            if (popup) {
                set_feature_property(features, "popup", popup); // set this on the feature
                layer.set("popup_property", "popup");
            }
            this.addLayer(layer);
            this.addLayer(clusterHulls);

            // show convex hull on hover
            this.on("pointermove", (event) => {
                layer.getFeatures(event.pixel).then((features) => {
                    if (features[0] !== hoverFeature) {
                        // display the convex hull on hover.
                        hoverFeature = features[0];
                        clusterHulls.setStyle(clusterHullStyle);
                        // cursor style is changed in the pointermove listener in the main map constructor call
                    }
                });
            });
            this.on("click", (event) => {
                layer.getFeatures(event.pixel).then((features) => {
                    if (features.length > 0) {
                        const clusterMembers = features[0].get("features");
                        if (clusterMembers.length > 1) {
                            // Calculate the extent of the cluster members.
                            const extent = olExtent.createEmpty();
                            clusterMembers.forEach((feature) =>
                                olExtent.extend(extent, feature.getGeometry().getExtent()),
                            );
                            const view = this.getView();
                            // zoom to the extent of the cluster members.
                            view.fit(extent, { duration: 500, padding: [50, 50, 50, 50] });
                        }
                    }
                });
            });
        }

        methods.add_wms_tiles = function(url, params, tile_wms_options, options) {
            options = options || {};
            tile_wms_options = tile_wms_options || {};
            tile_wms_options.url = url;
            tile_wms_options.params = params;
            //hidpi: false
            var source = new TileWMS(tile_wms_options);
            var l = new TileLayer(tile_source_with_options(source, options));
            l.set("name", options.name ? options.name : "Unnamed layer");
            this.addLayer(l);
        };

        methods.add_wmts_from_capabilities = function(url, wmts_options, options) {
            options = options || {};
            const parser = new WMTSCapabilities();
            const map = this;
            fetch(url) // url to WMTSCapabilities.xml
                .then(function (response) {
                    return response.text();
                })
                .then(function (text) {
                    const result = parser.read(text);
                    const wmts_source = new WMTS(optionsFromCapabilities(result, wmts_options));
                    var l = new TileLayer(tile_source_with_options(wmts_source, options));
                    l.set("name", options.name ? options.name : "Unnamed layer");
                    map.addLayer(l);
                });
        };

        methods.add_cog = function(sources, geotiff_source_options, options) {
            options = options || {};
            geotiff_source_options = geotiff_source_with_options(sources, geotiff_source_options);
            const source = new GeoTIFF(geotiff_source_options);
            var l = new WebGLTile(tile_source_with_options(source, options));
            l.set("name", options.name ? options.name : "Unnamed layer");
            this.addLayer(l);
        };


        methods.add_layer_switcher = function(target_id) {
            var opts = {};
            if (target_id) {
                opts.target = $('#' + target_id).get(0);
            }
            // opts.collapsed: false,
            // opts.mouseover: true
            var ctrl = new LayerSwitcher(opts);
            ctrl.on("drawlist", function(e) {
                // hide cluster hull layers, see https://github.com/Viglino/ol-ext/blob/master/examples/control/map.switcher.filter.html
                if (e.layer.get("no_legend")) {
                    e.li.style.display = "none";
                } else {
                    e.li.style.display = "block";
                }
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
                    overlay.setPosition(); // hide any existing popup
                    const coordinate = evt.coordinate;
                    var coordinate_longlat = olProj.transform(coordinate, projection, "EPSG:4326");
                    console.log("xy: " + coordinate + ", longlat: " + coordinate_longlat);
                    if (HTMLWidgets.shinyMode) {
                        var lnglat = { x: coordinate[0], y: coordinate[1], long: coordinate_longlat[0], lat: coordinate_longlat[1] };
                        Shiny.setInputValue(el.id + "_click", lnglat);
                    }
                    // show popup for each feature at this pixel, if one has been defined
                    map.forEachFeatureAtPixel(evt.pixel, function(feature, layer) {
                        const popup_property = layer.get("popup_property");
                        if (popup_property) { // does this layer have popups?
                            // render the popup for this feature, noting that if this is a clustered point layer then `feature` is a cluster, not a feature directly
                            const clust_features = feature.get("features");
                            if (clust_features) {
                                if (clust_features.length == 1) {
                                    render_popup(clust_features[0], overlay, clust_features[0].get(popup_property));
                                } // don't render a popup if a cluster marker with multiple features has been clicked
                            } else {
                                render_popup(feature, overlay, feature.get(popup_property));
                            }
                        }
                    });
                });

                map.on("pointermove", (event) => {
                    var pointer = false;
                    map.forEachFeatureAtPixel(event.pixel, function(feature, layer) {
                        // if the map has a layer with popups and a feature at this point, or a clustered feature at this point with more than one member feature, then it's clickable and we show a pointer cursor
                        const popup_property = layer.get("popup_property");
                        const clust_features = feature.get("features");
                        if ((clust_features && clust_features.length > 1) || popup_property) {
                            pointer = true;
                        }
                    });
                    map.getTargetElement().style.cursor = pointer ? "pointer" : "";
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
