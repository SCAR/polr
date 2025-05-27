#' Add WMS tile layer to a map
#'
#' @param map pol or pol_proxy: map to add the layer to
#' @param url string: URL to the WMS server
#' @param layers character: WMS layer names to include
#' @param wms_params list: `params` of <https://openlayers.org/en/latest/apidoc/module-ol_source_TileWMS-TileWMS.html>. The `LAYERS`, `TILED`, and some other elements are set automatically
#' @param tile_wms_options list: <https://openlayers.org/en/latest/apidoc/module-ol_source_TileWMS-TileWMS.html>
#' @param options list: <https://openlayers.org/en/latest/apidoc/module-ol_layer_Tile-TileLayer.html>
#'
#' @return A pol map object
#'
## @examples
#' @export
add_wms_tiles <- function(map, url, layers, wms_params = NULL, tile_wms_options = list(), options = list()) {
    wms_params <- c(list(LAYERS = layers, TILED = TRUE), wms_params)
    invoke_method(map, "add_wms_tiles", url, wms_params, tile_wms_options, options)
}
