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

#' Add clustered points
#'
#' @param map pol or pol_proxy: map to add the layer to
#' @param lon numeric: longitudes
#' @param lat numeric: latitudes
#' @param cluster_style : a style object as returned by [pol_style()] for the cluster markers, typically with components `text` and `circle`
#' @param marker_style : a style object as returned by [pol_style()] for single markers (i.e. when a cluster has reduced to a single feature)
#' @param popup character: popups to show, one per point
#' @param cluster_options list: named list with components `distance` and `min_distance` (as for <https://openlayers.org/en/latest/apidoc/module-ol_source_Cluster-Cluster.html>)
#' @param ... : named vector layer options <https://openlayers.org/en/latest/apidoc/module-ol_layer_Vector-VectorLayer.html>
#'
#' @return A pol map object
#' @export
add_clustered_points <- function(map, lon, lat, cluster_style = NULL, marker_style = NULL, popup = NULL, cluster_options = list(distance = 10, min_distance = 0), ...) {
    data <- lapply(seq_along(lon), function(i) c(lon[i], lat[i]))
    ## default styles
    if (is.null(cluster_style)) cluster_style <- pol_style(
                                    circle = list(radius = 10, stroke = list(color = "#fff"), fill = list(color = "#3399CC")),
                                    text = list(text = "", ## populated dynamically
                                                fill = list(color = "#fff")))
    if (is.null(marker_style)) marker_style <- pol_style(text = list(text = "\uf041", font = "normal 22px FontAwesome", fill = list(color = "#00c")))
    invoke_method(map, "add_clustered_points", data, cluster_style, marker_style, popup, cluster_options, list(...))
}
