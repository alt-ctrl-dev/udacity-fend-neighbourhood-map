let map;
function initMap() {
  // Constructor creates a new map - only center and zoom are required.
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: -37.8141, lng: 144.9633},
    zoom: 15
  });
}