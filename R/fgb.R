#' Add a flatgeobuf vector layer
#'
#' @references <https://flatgeobuf.org/examples/openlayers/>
#' @param map pol or pol_proxy: map to add the layer to
#' @param url string: URL to the flatgeobuf. Ignored if `file` is provided
#' @param file string: path to the flatgeobuf file. Note that `file` will only work with Shiny, not in standalone htmlwidgets or rmarkdown files
#' @param style : either a style object as returned by [pol_style()] or a list of flat style properties <https://openlayers.org/en/latest/apidoc/module-ol_style_flat.html>
#' @param ... : named vector layer options <https://openlayers.org/en/latest/apidoc/module-ol_layer_Vector-VectorLayer.html>
#'
#' @return A pol map object
#'
## @examples
#' @export
add_fgb <- function(map, url, file, style = NULL, ...) {
    if (!missing(file)) {
        ## are we in a Shiny session?
        if (!shiny::isRunning()) stop("add_fgb with `file` only works in Shiny applications")
        spdir <- dirname(file)
        prefix <- UUIDgenerate()
        addResourcePath(prefix, spdir)
        url <- file.path(prefix, basename(file))
    }
    if (!inherits(style, "pol_style")) {
        flat_style <- style
        style <- NULL
    } else {
        flat_style <- NULL
    }
    invoke_method(map, "add_fgb", url, style, flat_style, list(...))
}
