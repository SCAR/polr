#' Add layer switcher
#'
#' @param map pol or pol_proxy: map to add the layer switcher to
#' @param target_id string: ID of the html element to add the switcher to. If missing, the switcher will be placed inside the map pane
#'
#' @return A pol map object
#'
## @examples
#' @export
add_layer_switcher <- function(map, target_id) {
    if (missing(target_id)) target_id <- NULL
    invoke_method(map, "add_layer_switcher", target_id)
}
