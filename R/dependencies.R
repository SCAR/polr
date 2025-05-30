pol_dependencies <- function() {
    list(htmltools::htmlDependency(
                        name = "pol_styling",
                        version = "0.0.1",
                        package = "polr",
                        src = "htmlwidgets/lib",
                        stylesheet = "pol.css")
         )
}
