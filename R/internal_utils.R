invoke_method <- function(map, method_name, ...) {
    if (inherits(map, "pol_proxy")) {
        pol_proxy_invoke(map, method_name, ...)
    } else {
        n <- length(map$x$calls)
        if (n == 0) map$x$calls <- list()
        map$x$calls[[n+1]] <- list(method = method_name, args = list(...))
        map
    }
}
