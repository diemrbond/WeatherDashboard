// Query Selectors
var $citySearchField = $('#city-search');
var $citySearchButton = $('#city-search-btn');
var $searchHistory = $('#search-history');
var $errorText = $('#error');

var $theCity = $('#city-information')
var $cityName = $('#city-name');
var $theDate = $('#date');
var $cityTemp = $('#temperature');
var $cityHumidity = $('#humidity');
var $cityWind = $('#windspeed');
var $cityUV = $('#uvindex');

var $fiveDay = $('#five-day');
var $fiveDayEl = $('#five-day-display');

// city-information

// Variables & Arrays
var $historyButtons = [];

// Functions
function retrieveStoredHistory() {

    var checkExistingHistory = localStorage.getItem("citySearchHistory");
    if (checkExistingHistory != null) {
        $historyButtons = JSON.parse(checkExistingHistory);

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

                searchFunction($historyButtons[i])
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

function updateStorage() {

    var addHistory = JSON.stringify($historyButtons);
    localStorage.setItem("citySearchHistory", addHistory);
    console.log("[SYSTEM] Added to local storage: " + addHistory);
}

// Retrieve Users Search and Find
function validateSearch() {

    // Hide the Error Message
    hideError();

    // Retrieve the current value from the search field
    var citySearch = $citySearchField.val().trim();
    console.log("Searching for: " + citySearch);

    // Make sure the search isn't empty
    if (citySearch != "") {

        // Run the Search Function
        searchFunction(citySearch);
    }
}

function displayLoading() {

    $cityName.html('<i class="fas fa-spinner fa-pulse"></i>');
    $theDate.html("");
    $cityTemp.html("");
    $cityHumidity.html("");
    $cityWind.html("");
    $cityUV.html("");

    $fiveDayEl.empty();
    $fiveDay.css("display", "none");
}

function searchFunction(citySearch) {

    displayLoading();

    var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + citySearch + "&APPID=" + $APIKEY + "&units=metric";

    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {

        // console.log(response);

        var $currentTemp = response.main.temp;
        var $currentHumidity = response.main.humidity;
        var $currentWindSpeed = response.wind.speed;
        var $currentIcon = response.weather[0].icon;

        setCurrentCity(citySearch, $currentTemp, $currentHumidity, $currentWindSpeed, $currentIcon);

        var $currentLat = response.coord.lat;
        var $currentLong = response.coord.lon;

        getUV($currentLat, $currentLong);
        getFiveDay($currentLat, $currentLong);

        addHistoryButton(citySearch);

        // Remove Search from Field
        $citySearchField.val("");

    }).fail(function () {
        console.log("ERROR: Couldn't find the City");
        displayError();
    })
}

function getUV(theLat, theLong) {

    var queryURL = "http://api.openweathermap.org/data/2.5/uvi?lat=" + theLat + "&lon=" + theLong + "&appid=" + $APIKEY;

    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {

        var $theUV = response.value;

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

        $cityUV.html('UV Index: <span class=' + $theRating + '>' + $theUV + "</span>");

    }).fail(function () {
        console.log("ERROR: Couldn't find the UV");
        // displayError();
    })
}

function setCurrentCity(theCity, theTemp, theHumidity, theWindspeed, theIcon) {

    // Unhide the City Block
    $theCity.css("display", "block");

    // Add the Text Elements
    $cityName.text(theCity);
    $cityTemp.html("Temperature: " + theTemp + "&deg;C");
    $cityHumidity.text("Humidity: " + theHumidity + "%");
    $cityWind.text("Wind Speed: " + theWindspeed + " KPH");
    $cityUV.html('UV Index: <i class="fas fa-spinner fa-pulse"></i>');

    // Get the Current Date
    var $currentDate = moment().format('Do MMMM YYYY');
    $theDate.text($currentDate);

    // Create the icon and add to the city
    var $newIcon = $('<img>');
    var loadIcon = "http://openweathermap.org/img/wn/" + theIcon + "@2x.png";
    $newIcon.attr("src", loadIcon);
    $cityName.append($newIcon);
}

function getFiveDay(theLat, theLong) {

    $fiveDay.css("display", "block");
    $fiveDayEl.empty();

    for (var i = 0; i < 5; i++) {

        var $newDiv = $('<div>');
        $newDiv.attr("class", "forecast col-2 bg-white p-5 rounded text-dark text-center");
        $newDiv.html('<h4><i class="fas fa-spinner fa-pulse"></i></h4>')

        $fiveDayEl.append($newDiv);

    }

    var queryURL = "https://api.openweathermap.org/data/2.5/onecall?lat="+theLat+"&lon="+theLong+"&appid=" + $APIKEY + "&units=metric";

    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {

        console.log(response);

        $fiveDayEl.empty();

        for (var i = 1; i < 6; i++) {

            var $currentDate = moment().add(i, 'd');

            var $dayDate = $currentDate;
            var $dayIcon = response.daily[i].weather[0].icon;
            var $dayTemp = response.daily[i].temp.day;
            var $dayHumidity = response.daily[i].humidity;

            var $newDiv = $('<div>');
            $newDiv.attr("class", "forecast col-2 bg-primary pl-5 pr-5 pt-4 rounded text-light text-center");

            var $currentDate = moment($dayDate).format('D/MM/YYYY');

            var $newH4 = $('<h4>');
            $newH4.text($currentDate);

            var $newIcon = $('<img>');
            var loadIcon = "http://openweathermap.org/img/wn/" + $dayIcon + "@2x.png";
            $newIcon.attr("src", loadIcon);

            var $newP1 = $('<p>');
            $newP1.addClass("lead");
            $newP1.html("Temp: "+$dayTemp + "&deg;C");

            var $newP2 = $('<p>');
            $newP2.addClass("lead");
            $newP2.text("Humidity: "+$dayHumidity+"%");

            $newDiv.append($newH4);
            $newDiv.append($newIcon);
            $newDiv.append($newP1);
            $newDiv.append($newP2);

            $fiveDayEl.append($newDiv);
        }

    }).fail(function () {
        console.log("ERROR: Couldn't find the 5 Day Forecast");
        // displayError();
    })

}

// Display the Error Message
function displayError() {

    $errorText.text("Sorry, we couldn't find the City.");
    $errorText.css("display", "block");
    $theCity.css("display", "none");
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

        // Update the Local Storage
        updateStorage();
    }
}

// Function to clear the History
function clearHistory() {

    // Remove all from the array and empty the div
    $historyButtons = [];
    $searchHistory.empty();
    $theCity.css("display", "none");
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

// Check the Document is Ready before Applying Code
$(document).ready(function () {

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

    $(document).on("click", "#clearHistory", clearHistory);

    $(document).on("click", ".history", function () {

        var $whichHistory = $(this).data("city");
        searchFunction($whichHistory);
    })
})