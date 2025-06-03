pol_dependencies <- function() {
    list(htmltools::htmlDependency(
                        name = "pol_styling",
                        version = "0.0.1",
                        package = "polr",
                        src = "htmlwidgets/lib",
                        stylesheet = "pol.css"),
         htmltools::htmlDependency(
                        name = "ol",
                        version = "10.5.0",
                        package = "polr",
                        src = "htmlwidgets/lib/ol",
                        stylesheet = "ol.css"),
         htmltools::htmlDependency(
                        name = "ol-ext",
                        version = "4.0.31",
                        package = "polr",
                        src = "htmlwidgets/lib/ol-ext",
                        stylesheet = "ol-ext.css")
         )
}
