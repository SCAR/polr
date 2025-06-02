#' Add a geoJSON vector layer
#'
#' @param map pol or pol_proxy: map to add the layer to
#' @param data string: geoJSON data as a string. Ignored if `file` is provided
#' @param file string: path to geojson file
#' @param style : either a style object as returned by [pol_style()] or a list of flat style properties: <https://openlayers.org/en/latest/apidoc/module-ol_style_flat.html>
#' @param popup character: popups to show, one per point
#' @param options list: vector layer options <https://openlayers.org/en/latest/apidoc/module-ol_layer_Vector-VectorLayer.html>
#' @param data_proj string: the projection code of the geojson data. If omitted, it will be derived from the data where possible. If it cannot, the data will not be reprojected to the map's projection
#'
#' @return A pol map object
#'
## @examples
#' @export
add_geojson <- function(map, data, file, style = NULL, popup = NULL, options = NULL, data_proj = NULL) {
    if (!missing(file)) data <- paste(readLines(file), collapse = "\n")
    if (!inherits(style, "pol_style")) {
        flat_style <- style
        style <- NULL
    } else {
        flat_style <- NULL
    }
    invoke_method(map, "add_geojson", data, style, flat_style, popup, options, data_proj)
}
