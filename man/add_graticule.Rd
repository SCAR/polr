% Generated by roxygen2: do not edit by hand
% Please edit documentation in R/graticule.R
\name{add_graticule}
\alias{add_graticule}
\title{Add graticule}
\usage{
add_graticule(
  map,
  lons = seq(-180, 150, by = 30),
  lats = seq(-90, -40, by = 10),
  nverts = 51,
  xlim = range(lons),
  ylim = range(lats),
  style = NULL,
  no_legend = TRUE,
  ...
)
}
\arguments{
\item{map}{pol or pol_proxy: map to add the layer to}

\item{lons}{numeric: longitudes for meridional lines}

\item{lats}{numeric: latitudes for parallel lines}

\item{nverts}{numeric: number of discrete vertices for each segment}

\item{xlim}{numeric: maximum range of parallel lines}

\item{ylim}{numeric: maximum range of meridional lines}

\item{style}{: either a style object as returned by \code{\link[=pol_style]{pol_style()}} or a list of flat style properties: \url{https://openlayers.org/en/latest/apidoc/module-ol_style_flat.html}}

\item{no_legend}{logical: if \code{TRUE}, don't include this layer in the layer switcher legend}

\item{...}{: named vector layer options \url{https://openlayers.org/en/latest/apidoc/module-ol_layer_Vector-VectorLayer.html}}
}
\value{
A pol map object
}
\description{
Add graticule
}
\seealso{
\code{\link[graticule:graticule]{graticule::graticule()}}
}
