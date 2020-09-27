// Query Selectors
var $citySearchField = $('#city-search');
var $citySearchButton = $('#city-search-btn');
var $searchHistory = $('#search-history');

// city-information



// Functions
function searchFunction() {

    var citySearch = $citySearchField.val().trim();
    console.log("Searching for: " + citySearch);

}

// <p class="lead">Search history:</p>


// Check the Document is Ready before Applying Code
$(document).ready(function () {

    // City Search Button On Click
    $citySearchButton.on("click", searchFunction);

    // City Saerch Field On Enter
    $citySearchField.on("keydown", function (event) {

        // Check for Enter, run searchFunction
        if (event.key == "Enter") {
            // Prevent Page Refresh
            event.preventDefault();
            // Run searchFunction
            searchFunction();
        }
    });
})