// Query Selectors
var $citySearchField = $('#city-search');
var $citySearchButton = $('#city-search-btn');
var $searchHistory = $('#search-history');
var $errorText = $('#error');

// city-information

// Variables & Arrays
var $historyButtons = [];

// Functions
// Retrieve Users Search and Find
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

// Display the Error Message
function displayError() {

    $errorText.text("Sorry, we couldn't find the City.");
    $errorText.css("display", "block");
}

// Hide the Error Message
function hideError() {

    $errorText.empty();
    $errorText.css("display", "none");
}

function addHistoryButton(which) {

    // Check if this button is already in the history
    var $checkExists = $.inArray(which, $historyButtons);

    // If the button doesn't already exist
    if ($checkExists === -1) {

        // Check if the history count is at 10 or over
        if ($historyButtons.length >= 10) {

            // Find the last button
            var $findLast = $('#search-history').children().last().prev();
            // Find the last button in the history array
            var $removeOld = $.inArray($removeLast.text(), $historyButtons);
            // Remove the old button from the array
            $historyButtons.splice($removeOld, 1);
            // Remove the last button
            $findLast.remove();
        }

        // Create the button
        var $newCity = $('<button>');
        // Add the City Text
        $newCity.text(which);
        // Set the Basic Button Styles
        $newCity.attr("class", "history btn-lg btn-secondary w-100 text-left mb-2");
        // Add the City Data to the Button
        $newCity.data("city", which);
        // Insert the Button to the History Div
        $searchHistory.prepend($newCity);

        // Add the City to the History Array
        $historyButtons.push(which);

        // Check and add the Clear History Button
        clearHistoryButton();
    }
}

// Function to clear the History
function clearHistory() {

    // Remove all from the array and empty the div
    $historyButtons = [];
    $searchHistory.empty();
}

// Function to add the Clear History Button
function clearHistoryButton() {

    // Check if the Clear History Button has been created
    if (!$("#clearHistory").length) {

        // Create the Container Div
        var $clearDiv = $('<div>');
        $clearDiv.attr("class", "w-100 text-right");

        // Create the Clear History Button
        var $clearHistoryBtn = $('<button>');
        $clearHistoryBtn.text("Clear History");
        $clearHistoryBtn.attr("id", "clearHistory");
        $clearHistoryBtn.attr("class", "btn-lg btn-dark");

        // Add to the search history div
        $clearDiv.append($clearHistoryBtn);
        $searchHistory.append($clearDiv);
    }
}

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

    $(document).on("click", "#clearHistory", clearHistory);
})