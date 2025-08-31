#' Modify a pol object inside a Shiny app
#'
#' @param outputId string: the ID of the map
#' @param session the Shiny session object to which the map belongs; usually the
#'   default value will suffice.
#' @param deferUntilFlush logical: if `TRUE` then wait until the outputs are next updated to apply changes to the map
#' @export
pol_proxy <- function(outputId, session = shiny::getDefaultReactiveDomain(), deferUntilFlush = TRUE) {
    ## cribbed from plotly.R, also very similar to leaflet::leafletProxy & DT:dataTableProxy
    if (is.null(session)) stop("pol_proxy must be called from the server function of a Shiny app")

    if (!is.null(session$ns) && nzchar(session$ns(NULL)) && substr(outputId, 1, nchar(session$ns(""))) != session$ns("")) {
        outputId <- session$ns(outputId)
    }
    structure(list(session = session, id = outputId, deferUntilFlush = deferUntilFlush
                   ##dependencies = NULL
                   ), class = "pol_proxy")
}

is_proxy <- function(x) inherits(x, "pol_proxy")

pol_proxy_invoke <- function(p, method_name, ...) {
    if (!is_proxy(p)) stop("p must be a pol_proxy object")
    if (missing(method_name)) stop("must provide a method_name")
    if (!method_name %in% .known_method_names) {
        warning("method name\"", method_name, "\" is not recognised") ## TODO make this fatal?
    }
    msg <- list(id = p$id, method_name = method_name, args = list(...))
    if (isTRUE(p$deferUntilFlushed)) {
        p$session$onFlushed(function() {
            p$session$sendCustomMessage("pol-proxy-calls", msg)
        }, once = TRUE)
    } else {
        p$session$sendCustomMessage("pol-proxy-calls", msg)
    }
    p
}

.known_method_names <- c("add_cog", "add_fgb", "add_geojson", "add_layer_switcher", "add_points", "add_clustered_points", "add_wms_tiles", "add_wmts_from_capabilities", "remove_layer")
