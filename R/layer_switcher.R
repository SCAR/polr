#' Add layer switcher
#'
#' @param map pol or pol_proxy: map to add the layer switcher to
#'
#' @return A pol map object
#'
## @examples
#' @export
add_layer_switcher <- function(map) {
    invoke_method(map, "add_layer_switcher")
}
