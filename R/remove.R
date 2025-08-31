#' Remove a layer
#'
#' @param map pol or pol_proxy: map to remove the layer from
#' @param layer_name string: name of the layer. `layer_name` must have been provided when adding the layer (e.g. along the lines of `add_wms_tiles(..., name = "My Layer")`)
#'
#' @return A pol map object
#'
#' @export
remove_layer <- function(map, layer_name) invoke_method(map, "remove_layer", layer_name)
