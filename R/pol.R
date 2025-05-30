#' Create a polar openlayers map object
#'
#' @param view_options list: <https://openlayers.org/en/latest/apidoc/module-ol_View.html#~ViewOptions>. By default the projection will be set to "EPSG:3031" (Antarctic polar stereographic)
#' @param control_options list: <https://openlayers.org/en/latest/apidoc/module-ol_control_defaults.html#~DefaultsOptions>
#' @param width,height : Must be a valid CSS unit (like \code{'100\%'}, \code{'400px'}, \code{'auto'}) or a number, which will be coerced to a string and have \code{'px'} appended
#' @param elementId string: element ID
#'
#' @export
pol <- function(view_options = list(), control_options = list(zoom = TRUE, rotate = FALSE), width = NULL, height = NULL, elementId = NULL) {
    ## forward options using x
    x <- list(view_options = view_options, control_options = control_options)

    ## create widget
    htmlwidgets::createWidget(name = "pol", x, width = width, height = height, package = "polr", dependencies = pol_dependencies(), elementId = elementId)
}

#' Shiny bindings for pol
#'
#' Output and render functions for using pol within Shiny applications and interactive Rmd documents.
#'
#' @param outputId output variable to read from
#' @param width,height Must be a valid CSS unit (like \code{'100\%'}, \code{'400px'}, \code{'auto'}) or a number, which will be coerced to a string and have \code{'px'} appended.
#' @param expr An expression that generates a pol
#' @param env The environment in which to evaluate \code{expr}.
#' @param quoted Is \code{expr} a quoted expression (with \code{quote()})? This is useful if you want to save an expression in a variable.
#'
#' @name pol-shiny
#'
#' @export
polOutput <- function(outputId, width = '100%', height = '400px'){
  htmlwidgets::shinyWidgetOutput(outputId, 'pol', width, height, package = 'polr')
}

#' @rdname pol-shiny
#' @export
renderPol <- function(expr, env = parent.frame(), quoted = FALSE) {
  if (!quoted) { expr <- substitute(expr) } # force quoted
  htmlwidgets::shinyRenderWidget(expr, polOutput, env, quoted = TRUE)
}
