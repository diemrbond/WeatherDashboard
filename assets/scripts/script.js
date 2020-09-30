/////////////////////
// Query Selectors //
/////////////////////
var $citySearchField = $('#city-search');
var $citySearchButton = $('#city-search-btn');
var $searchHistory = $('#search-history');
var $errorText = $('#error');

var $theCityEl = $('#city-information')
var $cityNameEl = $('#city-name');
var $theDateEl = $('#date');
var $cityTempEl = $('#temperature');
var $cityHumidityEl = $('#humidity');
var $cityWindEl = $('#windspeed');
var $cityUVEl = $('#uvindex');

var $fiveDayContainer = $('#five-day');
var $fiveDayEl = $('#five-day-display');

////////////////////////
// Variables & Arrays //
////////////////////////
var $historyButtons = [];

///////////////
// Functions //
///////////////

///////////////////
// Local Storage //
///////////////////

// Function to retrieve the stored history
function retrieveStoredHistory() {

    // Call to check for local storage
    var $checkExistingHistory = localStorage.getItem("citySearchHistory");

    // If the history isn't empty
    if ($checkExistingHistory != null) {

        // Set the history array to stored data
        $historyButtons = JSON.parse($checkExistingHistory);

        // Loop through each element of the array
        $.each($historyButtons, function (i) {

            // Create the button
            var $newCity = $('<button>');
            // Add the City Text
            $newCity.text($historyButtons[i]);
            // Set the Basic Button Styles
            $newCity.attr("class", "history btn-lg btn-secondary w-100 text-left mb-2");
            // Add the City Data to the Button
            $newCity.data("city", $historyButtons[i]);
            // Insert the Button to the History Div
            $searchHistory.prepend($newCity);

            // Check and add the Clear History Button
            if (i === $historyButtons.length - 1) {

                // Search for the most recent search
                searchFunction($historyButtons[i])

                // Add the Clear History Button
                clearHistoryButton();
            }
        })
    }
    // Otherwise, set to the default empty array
    else {
        $historyButtons = [];
    }
    // Console log the existing entries
    console.log("[SYSTEM] Retrieving saved data: " + $historyButtons);
}

// Function to update the storage with latest search history
function updateStorage() {

    // Stringify the $historyButtons
    var $addHistory = JSON.stringify($historyButtons);
    // Add to the local storage
    localStorage.setItem("citySearchHistory", $addHistory);
    // Console log the updated search history
    console.log("[SYSTEM] Added to local storage: " + $addHistory);
}

//////////////////////
// Loading Messages //
//////////////////////

// Function to display the loading spinners and empty previous
function displayLoading() {

    // Clear the previous entries and add fake loader
    $cityNameEl.html('<i class="fas fa-spinner fa-pulse"></i>');
    $theDateEl.html("");
    $cityTempEl.html("");
    $cityHumidityEl.html("");
    $cityWindEl.html("");
    $cityUVEl.html("");

    // Empty the 5 day forecast and hide
    $fiveDayEl.empty();
    $fiveDayContainer.css("display", "none");
}

// Function to display the fake preloaders for the 5 day forecast
function displayLoaders() {

    // Unhide the 5 day forecast
    $fiveDayContainer.css("display", "block");
    // Clear out existing 5 day forecast
    $fiveDayEl.empty();

    // Loop through 5 days
    for (var i = 0; i < 5; i++) {

        // Create empty divs with fake loaders
        var $newDiv = $('<div>');
        $newDiv.attr("class", "forecast col-3 col-lg-2 bg-white p-5 rounded text-dark text-center");
        $newDiv.html('<h4><i class="fas fa-spinner fa-pulse"></i></h4>')

        // Add the fake loader div to the page
        $fiveDayEl.append($newDiv);
    }
}

/////////////////////
// Validate Search //
/////////////////////

// Validate the Users Search
function validateSearch() {

    // Hide the Error Message
    hideError();

    // Retrieve the current value from the search field
    var $citySearch = $citySearchField.val().trim();
    console.log("Searching for: " + $citySearch);

    // Make sure the search isn't empty
    if ($citySearch != "") {

        // Run the Search Function
        searchFunction($citySearch);
    }
}

///////////////
// API Calls //
///////////////

// Function to search for the entered city
function searchFunction(citySearch) {

    // Display loading messages
    displayLoading();

    // API Call
    var $queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + citySearch + "&APPID=" + $APIKEY + "&units=metric";

    // Ajax Function
    $.ajax({
        url: $queryURL,
        method: "GET"
    }).then(function (response) {

        // Retrieve the responses
        var $currentTemp = response.main.temp;
        var $currentHumidity = response.main.humidity;
        var $currentWindSpeed = response.wind.speed;
        var $currentIcon = response.weather[0].icon;

        // Set the current city
        setCurrentCity(citySearch, $currentTemp, $currentHumidity, $currentWindSpeed, $currentIcon);

        // Retrieve the longitude and latitude of current city
        var $currentLat = response.coord.lat;
        var $currentLong = response.coord.lon;

        // Retrieve the UV index
        getUV($currentLat, $currentLong);
        // Retrieve the 5 day forecast
        getFiveDay($currentLat, $currentLong);

        // Add the Search Button to History
        addSearchButton(citySearch);

        // Remove Search from Field
        $citySearchField.val("");

    }).fail(function () {
        // Display an error message if city not found
        console.log("ERROR: Couldn't find the City");
        displayError();
    })
}

// Function to retrieve the UV Index
function getUV(theLat, theLong) {

    // API Call
    var $queryURL = "https://api.openweathermap.org/data/2.5/uvi?lat=" + theLat + "&lon=" + theLong + "&appid=" + $APIKEY;

    // Ajax Function
    $.ajax({
        url: $queryURL,
        method: "GET"
    }).then(function (response) {

        // Retrieve the UV index
        var $theUV = response.value;

        // Set the class dependent on the UV index
        if ($theUV <= 2) {
            $theRating = "low";
        }
        else if ($theUV <= 5) {
            $theRating = "medium";
        }
        else if ($theUV <= 7) {
            $theRating = "high";
        }
        else if ($theUV <= 10) {
            $theRating = "veryhigh";
        }
        else {
            $theRating = "extreme";
        }

        // Add the UV Index to the Current City
        $cityUVEl.html('UV Index: <span class=' + $theRating + '>' + $theUV + "</span>");

    }).fail(function () {
        console.log("ERROR: Couldn't find the UV");
    })
}

// Function to get the 5 day forecast
function getFiveDay(theLat, theLong) {

    // Add the fake preloaders
    displayLoaders();

    // API Call
    var $queryURL = "https://api.openweathermap.org/data/2.5/onecall?lat=" + theLat + "&lon=" + theLong + "&appid=" + $APIKEY + "&units=metric";

    // Ajax Function
    $.ajax({
        url: $queryURL,
        method: "GET"
    }).then(function (response) {

        // Empty the fake preloaders
        $fiveDayEl.empty();

        // Loop through for 5 days
        for (var i = 1; i < 6; i++) {

            // Create a new moment, i days in the future
            var $currentDate = moment().add(i, 'd').format('D/MM/YYYY');

            // Retrieve the responses
            var $dayIcon = response.daily[i].weather[0].icon;
            var $dayTemp = response.daily[i].temp.day;
            var $dayHumidity = response.daily[i].humidity;

            // Create an empty div to hold the data
            var $newDiv = $('<div>');
            $newDiv.attr("class", "forecast col-3 col-lg-2 bg-primary pl-5 pr-5 pt-4 rounded text-light text-center");

            // Create a new H4 for the date
            var $newH4 = $('<h4>');
            $newH4.text($currentDate);

            // Create a new icon image
            var $newIcon = $('<img>');
            var $loadIcon = "https://openweathermap.org/img/wn/" + $dayIcon + "@2x.png";
            $newIcon.attr("src", $loadIcon);

            // Add the Temperature
            var $newP1 = $('<p>');
            $newP1.addClass("lead");
            $newP1.html("Temp: " + $dayTemp + "&deg;C");

            // Add the Humidity
            var $newP2 = $('<p>');
            $newP2.addClass("lead");
            $newP2.text("Humidity: " + $dayHumidity + "%");

            // Append to the 5 day forecast
            $newDiv.append($newH4);
            $newDiv.append($newIcon);
            $newDiv.append($newP1);
            $newDiv.append($newP2);
            $fiveDayEl.append($newDiv);
        }

    }).fail(function () {
        console.log("ERROR: Couldn't find the 5 Day Forecast");
    })
}

//////////////////////
// Set Current City //
//////////////////////

// Function to Set the Current City
function setCurrentCity(theCity, theTemp, theHumidity, theWindspeed, theIcon) {

    // Unhide the City Block
    $theCityEl.css("display", "block");

    // Add the Text Elements
    $cityNameEl.text(theCity);
    $cityTempEl.html("Temperature: " + theTemp + "&deg;C");
    $cityHumidityEl.text("Humidity: " + theHumidity + "%");
    $cityWindEl.text("Wind Speed: " + theWindspeed + " KPH");
    // Add a fake loader to the UV index while data is retrieved
    $cityUVEl.html('UV Index: <i class="fas fa-spinner fa-pulse"></i>');

    // Get the Current Date
    var $currentDate = moment().format('Do MMMM YYYY');
    $theDateEl.text($currentDate);

    // Create the icon and add to the city
    var $newIcon = $('<img>');
    var $loadIcon = "https://openweathermap.org/img/wn/" + theIcon + "@2x.png";
    $newIcon.attr("src", $loadIcon);
    $cityNameEl.append($newIcon);
}

////////////////////
// Error Messages //
////////////////////

// Display the Error Message
function displayError() {

    // Add the Error Message
    $errorText.text("Sorry, we couldn't find the City.");
    $errorText.css("display", "block");

    // Hide the previous City
    $theCityEl.css("display", "none");

    // Empty the 5 day forecast and hide
    $fiveDayEl.empty();
    $fiveDayContainer.css("display", "none");
}

// Function to hide the Error Message
function hideError() {

    $errorText.empty();
    $errorText.css("display", "none");
}

////////////////////
// Search Buttons //
////////////////////

// Function to add a search button
function addSearchButton(which) {

    // Check if this button is already in the history
    var $checkExists = $.inArray(which, $historyButtons);

    // If the button doesn't already exist
    if ($checkExists === -1) {

        // Check if the history count is at 10 or over
        if ($historyButtons.length >= 10) {

            // Find the last button
            var $findLast = $('#search-history').children().last().prev();
            // Find the last button in the history array
            var $removeOld = $.inArray($findLast.text(), $historyButtons);
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

        // Update the Local Storage
        updateStorage();
    }
}

//////////////////////////
// Clear History Button //
//////////////////////////

// Function to clear the History
function clearHistory() {

    // Remove all from the array and empty the div
    $historyButtons = [];
    $searchHistory.empty();

    // Hide the Current City Block
    $theCityEl.css("display", "none");

    // Empty the 5 day forecast and hide
    $fiveDayEl.empty();
    $fiveDayContainer.css("display", "none");

    // Update the Local Storage to Empty
    updateStorage();
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
        $clearHistoryBtn.attr("class", "btn-lg btn-dark mb-3");

        // Add to the search history div
        $clearDiv.append($clearHistoryBtn);
        $searchHistory.append($clearDiv);
    }
}

////////////////////
// Document Start //
////////////////////

// Check the Document is Ready before Applying Code
$(document).ready(function () {

    // Check if there is existing searches
    retrieveStoredHistory();

    // City Search Button On Click
    $citySearchButton.on("click", validateSearch);

    // City Search Field On Enter
    $citySearchField.on("keydown", function (event) {

        // Check for Enter, run validateSearch
        if (event.key == "Enter") {
            // Prevent Page Refresh
            event.preventDefault();
            // Run validateSearch
            validateSearch();
        }
    })

    // Clear History On Click
    $(document).on("click", "#clearHistory", clearHistory);

    // History City Search Buttons On Click
    $(document).on("click", ".history", function () {

        // Retrieve the City Data
        var $whichHistory = $(this).data("city");
        // Search for the City
        searchFunction($whichHistory);
    })
})