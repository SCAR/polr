context("general package tests")

test_that("all proxy methods are listed", {
    ## the `pol_proxy_invoke()` function checks the method name against a list of known methods: check that this list is complete
    ## this is probably fragile but better than nothing
    funs <- ls("package:polr")
    methods_called <- unique(unlist(lapply(funs, function(f) {
        ftxt <- deparse(body(get(f, envir = as.environment("package:polr")))) ## function code as character
        ## find the methods that this function invokes, if any
        invokes <- na.omit(stringr::str_match(ftxt, "invoke_method\\(map,[[:space:]]*([^,]+)[[:space:]]*,")[, 2])
        gsub("[\"']", "", invokes)
    })))
    ## have we listed them all?
    expect_true(setequal(methods_called, polr:::.known_method_names))
})
