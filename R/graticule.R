#' Add graticule
#'
#' @param map pol or pol_proxy: map to add the layer to
#' @param lons numeric: longitudes for meridional lines
#' @param lats numeric: latitudes for parallel lines
#' @param nverts numeric: number of discrete vertices for each segment
#' @param xlim numeric: maximum range of parallel lines
#' @param ylim numeric: maximum range of meridional lines
#' @param style : either a style object as returned by [pol_style()] or a list of flat style properties: <https://openlayers.org/en/latest/apidoc/module-ol_style_flat.html>
#' @param ... : named vector layer options <https://openlayers.org/en/latest/apidoc/module-ol_layer_Vector-VectorLayer.html>
#'
#' @return A pol map object
#' @seealso [graticule::graticule()]
## @examples
#' @export
add_graticule <- function(map, lons = seq(-180, 150, by = 30), lats = seq(-90, -40, by = 10), nverts = 51, xlim = range(lons), ylim = range(lats), style = NULL, ...) {
    grat <- geojsonsf::sf_geojson(sf::st_as_sf(graticule::graticule(lons = lons, lats = lats, nverts = nverts, xlim = xlim, ylim = ylim)))
    if (!inherits(style, "pol_style")) {
        flat_style <- style
        style <- NULL
    } else {
        flat_style <- NULL
    }
    ## default style
    if (is.null(style) && is.null(flat_style)) {
        style <- pol_style(stroke = list(color = "#40404040", lineDash = c(0.5, 4)))
    }
    invoke_method(map, "add_geojson", grat, style, flat_style, NULL, NULL, list(...))
}
