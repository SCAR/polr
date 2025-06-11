#' Style
#'
#' @references <https://openlayers.org/en/latest/apidoc/module-ol_style_Style.html>
#' @param fill list: <https://openlayers.org/en/latest/apidoc/module-ol_style_Fill-Fill.html>
#' @param image list: <https://openlayers.org/en/latest/apidoc/module-ol_style_Image-ImageStyle.html>
#' @param icon list: <https://openlayers.org/en/latest/apidoc/module-ol_style_Icon-Icon.html>
#' @param shape list: <https://openlayers.org/en/latest/apidoc/module-ol_style_RegularShape-RegularShape.html>
#' @param circle list: <https://openlayers.org/en/latest/apidoc/module-ol_style_Circle-CircleStyle.html>
#' @param stroke list: <https://openlayers.org/en/latest/apidoc/module-ol_style_Stroke-Stroke.html>
#' @param text list: <https://openlayers.org/en/latest/apidoc/module-ol_style_Text-Text.html>
#' @param z_index integer: z index
#'
#' @return An oject of class `pol_style`
#'
#' @seealso [add_geojson()]
#'
#' @examples
#' mystyle <- pol_style(stroke = list(color = "green"))
#'
#' @export
pol_style <- function(fill = NULL, image = NULL, icon = NULL, shape = NULL, circle = NULL, stroke = NULL, text = NULL, z_index = NULL) {
    structure(list_no_nulls(fill = fill, image = image, icon = icon, shape = shape, circle = circle, stroke = stroke, text = text, z_index = z_index), class = "pol_style")
}
