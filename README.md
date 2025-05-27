
<!-- README.md is generated from README.Rmd. Please edit that file -->

# polr

<!-- badges: start -->
<!-- badges: end -->

The goal of polr is to provide bindings to the openlayers javascript
library, with a focus on polar mapping applications.

## Installation

``` r
remotes::install_github("SCAR-sandpit/polr")
```

## Example usage

``` r
library(polr)
library(shiny)

ui <- fluidPage(
  polOutput("map", height = "80vh", width = "100%"),
  actionButton("cog", "Add COG")
)

server <- function(input, output, session) {
  output$map <- renderPol({
    polr::pol(view_options = list(projection = "EPSG:3031", extent = 5e6 * c(-1, -1, 1, 1))) %>%
        add_wms_tiles(url = "https://geos.polarview.aq/geoserver/wms",
                      layers = "polarview:coastS10") %>%
        add_fgb(file = system.file("extdata/fronts_park.fgb", package = "polr"),
                style = list(`stroke-color` = "black"))
  })

  ## dynamically update the map
  prox <- pol_proxy("map")
  observeEvent(input$cog, {
    prox %>% add_cog(
     "https://data.source.coop/scar/distant/hindell_et_al-2020/Hi2023-aes_colony_weighted_cog.tif",
     geotiff_source_options = list(interpolate = FALSE),
     options = list(opacity = 0.7,
                    style = list(color = pol_colormap(hcl.colors(21, "Spectral", rev = TRUE)))))
  })
}

shinyApp(ui = ui, server = server)
```
