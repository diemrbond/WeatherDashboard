// Query Selectors
var $citySearchField = $('#city-search');
var $citySearchButton = $('#city-search-btn');
var $searchHistory = $('#search-history');
var $errorText = $('#error');

// city-information

// Variables & Arrays
var $historyButtons = [];

// Functions
function searchFunction() {

    // Hide the Error Message
    hideError();

    // Retrieve the current value from the search field
    var citySearch = $citySearchField.val().trim();
    console.log("Searching for: " + citySearch);

    // Make sure the search isn't empty
    if (citySearch != "") {

        var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + citySearch + "&APPID=" + $APIKEY + "&units=metric";

        $.ajax({
            url: queryURL,
            method: "GET"
        }).then(function (response) {

            console.log(response);

            var $currentTemp = response.main.temp;
            var $currentHumidity = response.main.humidity;
            var $currentWindSpeed = response.wind.speed;

            var $currentIcon = response.weather[0].icon;

            console.log($currentTemp);
            console.log($currentHumidity);
            console.log($currentWindSpeed);
            console.log($currentIcon);

            addHistoryButton(citySearch);

            //http://openweathermap.org/img/wn/10d@2x.png

        }).fail(function () {
            console.log("ERROR: Couldn't find the City");
            displayError();
        })
    }

}

function displayError() {

    $errorText.text("Sorry, we couldn't find the City.");
    $errorText.css("display", "block");
}

function hideError() {

    $errorText.empty();
    $errorText.css("display", "none");
}

function addHistoryButton(which) {

    // Check if this button is already in the history
    var $checkExists = $.inArray(which, $historyButtons);

    // If the button doesn't already exist
    if ($checkExists === -1) {

        // Create the button
        var $newCity = $('<button>');
        // Add the City Text
        $newCity.text(which);
        // Set the Basic Button Styles
        $newCity.attr("class", "btn-lg btn-secondary w-100 text-left mb-2");
        // Add the City Data to the Button
        $newCity.data("city", which);
        // Insert the Button to the History Div
        $searchHistory.prepend($newCity);
        
        // Add the City to the History Array
        $historyButtons.push(which);
    }
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
    })
})