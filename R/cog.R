#' Add cloud-optimised geotiff layer
#'
#' @param map pol or pol_proxy: map to add the layer to
#' @param sources : either a character vector of one or more URLs, or a list of `pol_geotiff_source` objects
#' @param geotiff_source_options list: geotiff source options <https://openlayers.org/en/latest/apidoc/module-ol_source_GeoTIFF.html#~GeoTIFFSourceOptions>
#' @param ... : named webGL tile source options <https://openlayers.org/en/latest/apidoc/module-ol_layer_WebGLTile.html>
#'
#' @return A pol map object
#'
## @examples
#' @export
add_cog <- function(map, sources,
                    geotiff_source_options = NULL, ...) {
    if (is.character(sources)) {
        sources <- as.list(sources)
    } else if (inherits(sources, "pol_geotiff_source")) {
        sources <- list(sources)
    }
    sources <- lapply(sources, function(src) {
        if (inherits(src, "pol_geotiff_source")) {
            ## ok
        } else if (is.character(src) && length(src) == 1) {
            ## url
            src <- list(url = src)
        } else {
            stop("unexpected source format")
        }
        src
    })
    invoke_method(map, "add_cog", sources, geotiff_source_options, list(...))
}

#' Create a geotiff source
#'
#' Provides an alternative way of specifying a geotiff source to use in [add_cog()], giving more control beyond just the source URL.
#'
#' @references <https://openlayers.org/en/latest/apidoc/module-ol_source_GeoTIFF.html#~SourceInfo>
#' @param url string: URL
#' @param overviews character: overview URLs
#' @param min numeric: minimum source data value
#' @param max numeric: maximum source data value
#' @param nodata numeric: the source data value representing "no data"
#' @param bands numeric: band numbers to be read from (numbered starting from 1)
#'
#' @return An object of class `pol_geotiff_source`
#'
## @examples
#' @export
pol_geotiff_source <- function(url, overviews, min, max, nodata, bands) {
    out <- list(url = url)
    if (!missing(overviews)) out$overviews <- overviews
    if (!missing(min)) out$min <- min
    if (!missing(max)) out$max <- max
    if (!missing(nodata)) out$nodata <- nodata
    if (!missing(bands)) out$bands <- bands
    structure(out, class = "pol_geotiff_source")
}

#' Create a colour palette to use with a raster
#'
#' @param col character: vector of hex colour strings
#' @param range numeric: data range, noting that by default a layer's values are scaled to the range 0-1
#' @param breaks numeric: optional vector of breaks, same length as `col`. If not provided, breaks will be equally spaced across `range`
#' @param with_nodata logical: if `TRUE`, the layer's "nodata" (missing) value will be shown as transparent
#'
#' @return An object of class `pol_colourmap`
#'
## @examples
#' @export
pol_colourmap <- function(col, range = c(0, 1), breaks, with_nodata = TRUE) {
    ncol <- length(col)
    if (!missing(breaks)) {
        if (length(breaks) != ncol) stop("`breaks` should be the same length as `col`")
    } else {
        breaks <- seq(range[1], range[2], length.out = ncol)
    }
    cmap <- vector("list", ncol * 2)
    cmap[seq(1, ncol * 2 - 1L, by = 2)] <- as.list(breaks)
    cmap[seq(2, ncol * 2, by = 2)] <- as.list(col)
    cmap <- c(list("interpolate", list("linear"), list("band", 1)), cmap)
    structure(if (with_nodata) {
                  list("case", list("==", list("band", 2), 0),
                       c(0, 0, 0, 0),
                       cmap)
              } else {
                  cmap
              }, class = "pol_colourmap")
}

#' @rdname pol_colourmap
#' @export
pol_colormap <- pol_colourmap
