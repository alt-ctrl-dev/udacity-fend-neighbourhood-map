let locations = [{
    title: 'Melbourne Zoo',
    location: {
      lat: -37.7841346,
      lng: 144.9515473
    }
  },
  {
    title: 'Queen Victoria Market',
    location: {
      lat: -37.8075798,
      lng: 144.956785
    }
  },
  {
    title: 'Melbourne Star',
    location: {
      lat: -37.811882,
      lng: 144.937466
    }
  },
  {
    title: 'Melbourne Cricket Ground',
    location: {
      lat: -37.8199669,
      lng: 144.9834493
    }
  },
  {
    title: 'Royal Botanic Gardens, Melbourne',
    location: {
      lat: -37.8303689,
      lng: 144.9796056
    }
  }
];
let map;


/**
* @description function to run when Google Maps has loaded
* @function
*/
function initMap() {
  // Constructor creates a new map - only center and zoom are required.
  map = new google.maps.Map(document.getElementById('map'), {
    center: {
      lat: -37.8141,
      lng: 144.9633
    },
    zoom: 15,
    zoomControl: false,
    styles: [{
      featureType: 'poi',
      elementType: 'geometry',
      stylers: [{
          visibility: 'on'
        },
        {
          color: '#f0e4d3'
        }
      ]
    }],
    mapTypeControl: false
  });

  viewModel.mapReady();
}

/**
* @description This function will let the user know if there was an error loading Google Maps
* @function
*/
function gm_authFailure() {
  alert("Something went wrong with maps. :(");
}

/**
* @description This function takes in a COLOR, and then creates a new marker icon of that color. The icon will be 21 px wide by 34 high, have an origin of 0, 0 and be anchored at 10, 34).
* @function
* @param {string} markerColor - The color of the marker
* @return {google.maps.MarkerImage} a marker with provided color
*/
function makeMarkerIcon(markerColor) {
  var markerImage = new google.maps.MarkerImage(
    'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor +
    '|40|_|%E2%80%A2',
    new google.maps.Size(21, 34),
    new google.maps.Point(0, 0),
    new google.maps.Point(10, 34),
    new google.maps.Size(21, 34));
  return markerImage;
}

/**
* @description This function populates the infowindow when the marker is clicked.
* @function
* @param {google.maps.Marker} marker - The marker to which the information window must be attached
* @param {google.maps.InfoWindow} infowindow - the information window to show when the marker is clicked
*/
function populateInfoWindow(marker, infowindow) {
  // Check to make sure the infowindow is not already opened on this marker.
  if (infowindow.marker != marker) {
    // Clear the infowindow content to give the streetview time to load.
    infowindow.setContent('');
    infowindow.marker = marker;
    // Make sure the marker property is cleared if the infowindow is closed.
    infowindow.addListener('closeclick', function () {
      infowindow.marker = null;
    });
    infowindow.setContent('<h2>' + marker.title + '</h2><div class="info">Getting information</div>');
    // Open the infowindow on the correct marker.
    infowindow.open(map, marker);

    //API call to get infomation about place
    $.get("https://en.wikipedia.org/w/api.php?origin=*&format=json&action=query&prop=extracts&exintro=&explaintext=&titles=" + marker.title)
      .done(function (data) {
        infowindow.setContent('');
        var query = data.query.pages;
        var content = "";
        for (let i in query) {
          if (query[i].extract)
            content = query[i].extract.split("\n")[0];
        }
        infowindow.setContent(`<h2>${marker.title}</h2><div class="info">${content}</div>`);
      })
      .fail(function (error) {
        infowindow.setContent('');
        infowindow.setContent('<h2>' + marker.title + '</h2><div class="info info_error">Something went wrong</div>');
      })
      .always(function () {
        //always center the map on marker click
        map.setCenter(marker.getPosition());
      });
  }
}

/**
* @description Function to show a marker based on index. If index is -1, then it will show all the markers
* @function
* @param {number} index - The index of the location that will be displayed, default is -1
*/
function showMarker(index = -1) {
  if (index < 0) {
    locations.forEach((location, i) => {
      if (location.holder)
        location.holder.setMap(map);
    });
  } else {
    if (locations[index].holder)
      locations[index].holder.setMap(map);
  }
}

/**
* @description Function to hide all marker
* @function
*/
function hideMarker() {
  locations.forEach((location) => {
    if (location.holder) location.holder.setMap(null);
  });
}

/**
* @description Function to attach marker listeners
* @function
* @param {google.maps.Marker} marker - The marker that need the events to be registered
* @param {google.maps.InfoWindow} largeInfowindow - the information window to show when the marker is clicked
* @param {google.maps.MarkerImage} defaultIcon - The default image for the marker
* @param {google.maps.MarkerImage} highlightedIcon - The highlighted image for the marker, when mouse hover occurs
* @param {google.maps.MarkerImage} selectedIcon - The selected image for the marker, when the marker is clicked
*/
function attachMarkerListners(marker, largeInfowindow, defaultIcon, highlightedIcon, selectedIcon) {
  // Create an onclick event to open the large infowindow at each marker.
  marker.addListener('click', function () {
    this.setIcon(selectedIcon);
    populateInfoWindow(this, largeInfowindow);
  });
  // Two event listeners - one for mouseover, one for mouseout, to change the colors back and forth.
  marker.addListener('mouseover', function () {
    this.setIcon(highlightedIcon);
  });
  marker.addListener('mouseout', function () {
    this.setIcon(defaultIcon);
  });
}

/**
* @description Function to find the index of the item in an array
* @function
* @param {Array} searchArray - The array to be searched
* @param {any} item - the item to search in the array
* @return {number} The index of the item if found, else -1;
*/
function findIndex(searchArray, item) {
  var k = 0;
  while (k < searchArray.length) {
    if (searchArray[k] === item) {
      return k;
    }
    k++;
  }
  return -1;
}

/**
* @description Function to find if a string contains a specific text
* @function
* @param {string} string - The string to be searched
* @param {string} contains - the substring to search in the string
* @return {bool} The index of the item if found, else -1;
*/
function stringContains (string, contains) {
  string = string || "";
  return string.toLowerCase().includes(contains.toLowerCase());
};

function AppViewModel() {
  let self = this;
  this.query = ko.observable("");
  this.weatherPanelOpen = ko.observable(false);
  this.searchPanelOpen = ko.observable(false);
  this.weather = ko.observable("");
  this.toggleSearchPanel = function () {
    self.searchPanelOpen(!self.searchPanelOpen());
    self.weatherPanelOpen(false);
  };
  this.toggleWeatherPanel = function () {
    self.weatherPanelOpen(!self.weatherPanelOpen());
    self.searchPanelOpen(false);
    $(".loading").show();
    self.weather("");
    $.get("https://api.apixu.com/v1/current.json?key=16966ad7efa74c9894723957173107&q=Melbourne")
      .done(function (data) {
        setTimeout(() => {
          self.weather(`Current weather: ${data.current.condition.text} | Current Temperature: ${data.current.temp_c}°C`);
        }, 500);
      })
      .fail(function (error) {
        setTimeout(() => {
          self.weather(`Could not get weather conditions`);
        }, 500);
      })
      .always(function () {
        $(".loading").hide();
      });
  };

  this.mapReady = function () {
    // Style the markers a bit. This will be our listing marker icon.
    var defaultIcon = makeMarkerIcon('0091ff');

    // Create a "highlighted location" marker color for when the user
    // mouses over the marker.
    var highlightedIcon = makeMarkerIcon('FFFF24');

    var selectedIcon = makeMarkerIcon('9191ff');

    var largeInfowindow = new google.maps.InfoWindow();
    var bounds = new google.maps.LatLngBounds();
    // The following group uses the location array to create an array of markers on initialize.
    for (var i = 0; i < locations.length; i++) {
      // Get the position from the location array.
      var position = locations[i].location;
      var title = locations[i].title;
      // Create a marker per location, and put into markers array.
      var marker = new google.maps.Marker({
        position: position,
        title: title,
        icon: defaultIcon,
        id: "marker" + i
      });
      attachMarkerListners(marker, largeInfowindow, defaultIcon, highlightedIcon, selectedIcon);
      marker.setMap(map);
      bounds.extend(marker.getPosition());
      locations[i].holder = marker;
    }
    map.fitBounds(bounds);
  };

  this.recenterMap = function () {
    var bounds = new google.maps.LatLngBounds();
    for (var i = 0; i < locations.length; i++) {
      bounds.extend(locations[i].holder.getPosition());
    }
    map.fitBounds(bounds);
  };

  this.showMarkerLocation = function (marker) {
    marker.holder.setAnimation(google.maps.Animation.DROP);
    map.setCenter(marker.holder.getPosition());
  };

  this.stringContains = function (string, contains) {
    string = string || "";
    return string.toLowerCase().includes(contains.toLowerCase());
  };

  this.markers = ko.dependentObservable(function () {
    var search = self.query().toLowerCase();
    var itemFound = ko.utils.arrayFilter(locations, function (item) {
      return stringContains(item.title.toLowerCase(), search);
    });
    hideMarker();
    if (itemFound.length > 0 && itemFound.length != locations.length) {
      for (var index = 0; index < itemFound.length; index++) {
        var item = itemFound[index];
        var itemindex = findIndex(locations, item);
        if (itemindex >= 0) {
          showMarker(itemindex);
        }
      }
    } else if (itemFound.length == locations.length) {
      showMarker();
    }
    return itemFound;
  }, this);
}

const viewModel = new AppViewModel();
// Activates knockout.js
ko.applyBindings(viewModel);