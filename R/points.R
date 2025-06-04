#' Add points
#'
#' @param map pol or pol_proxy: map to add the layer to
#' @param lon numeric: longitudes
#' @param lat numeric: latitudes
#' @param style : either a style object as returned by [pol_style()] or a list of flat style properties: <https://openlayers.org/en/latest/apidoc/module-ol_style_flat.html>
#' @param popup character: popups to show, one per point
#' @param ... : named vector layer options <https://openlayers.org/en/latest/apidoc/module-ol_layer_Vector-VectorLayer.html>
#'
#' @return A pol map object
#'
## @examples
#' @export
add_points <- function(map, lon, lat, style = NULL, popup = NULL, ...) {
    data <- lapply(seq_along(lon), function(i) c(lon[i], lat[i]))
    if (!inherits(style, "pol_style")) {
        flat_style <- style
        style <- NULL
    } else {
        flat_style <- NULL
    }
    invoke_method(map, "add_points", data, style, flat_style, popup, list(...))
}
