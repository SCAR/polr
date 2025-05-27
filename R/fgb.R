#' Add a flatgeobuf vector layer
#'
#' @references <https://flatgeobuf.org/examples/openlayers/>
#' @param map pol or pol_proxy: map to add the layer to
#' @param url string: URL to the flatgeobuf. Ignored if `file` is provided
#' @param file string: path to the flatgeobuf file
#' @param style list: styling as a list of flat style properties: <https://openlayers.org/en/latest/apidoc/module-ol_style_flat.html>
#' @param options list: vector layer options <https://openlayers.org/en/latest/apidoc/module-ol_layer_Vector-VectorLayer.html>
#'
#' @return A pol map object
#'
## @examples
#' @export
add_fgb <- function(map, url, file, style = NULL, options = NULL) {
    if (!missing(file)) {
        spdir <- dirname(file)
        prefix <- UUIDgenerate()
        addResourcePath(prefix, spdir)
        url <- file.path(prefix, basename(file))
    }
    invoke_method(map, "add_fgb", url, style, options)
}
