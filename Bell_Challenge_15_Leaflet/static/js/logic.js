$(document).ready(function () {
  // init map
  doWork();
{API_key}  "./config.js"
let API_KEY = API_key
});

function doWork() {
  // Store our API endpoint as queryUrl.
  let queryUrl = `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson`;

  // reset map container
  $("#mapContainer").empty();
  $("#mapContainer").append("<div id='map'></div>")


  // Perform a GET request to the query URL.
  d3.json(queryUrl).then(function (data) {
    console.log(data);

    // Using the features array sent back in the API data, create a GeoJSON layer, and add it to the map.
    makeMap(data);

  });
}

function makeRadius(mag) {
  return mag * 4
}

function getColor(depth) {
  let color = "";
  if (depth >= 90) {
    color = "firebrick";
  } else if (depth >= 70) {
    color = "darkgreen";
  } else if (depth >= 50) {
    color = "coral";
  } else {
    color = "violet";
  }
  console.log(depth, depth >= 90, color)
  return color;
}

// make map
function makeMap(data) {

  // STEP 1: CREATE THE BASE LAYERS

  let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });

  let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

  var graymap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
  tileSize: 512,
  maxZoom: 18,
  zoomOffset: -1,
  id: "mapbox/light-v10",
  accessToken: API_key
});

var satellitemap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
  tileSize: 512,
  maxZoom: 18,
  zoomOffset: -1,
  id: "mapbox/satellite-v9",
  accessToken: API_key
});

var outdoors = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
  tileSize: 512,
  maxZoom: 18,
  zoomOffset: -1,
  id: "mapbox/outdoors-v11",
  accessToken: API_key
});


  // STEP 2: CREATE THE OVERLAY/DATA LAYERS

 

  let circleLayer = new L.LayerGroup()

  for (let i = 0; i < data.features.length; i++) {
    let earthquake= data.features[i];
    let location = earthquake.geometry.coordinates;
    console.log(location[2])
    if (location) {
      L.circle([location[1],location[0]], {
        fillOpacity: 0.75,
        color: getColor(location[2]),
        weight: 7,
        fillColor: getColor(location[2]),
        radius: makeRadius(earthquake.properties.mag)
        }).bindPopup(`<h1> ${earthquake.properties.place} </h1> <hr> <h3>${earthquake.properties.title}</h3>`).addTo(circleLayer);


    }
  }
  let tectonicPlateLayer = new L.LayerGroup()

  d3.json("./data.json").then(function (data) {
    console.log(data);

    // Using the features array sent back in the API data, create a GeoJSON layer, and add it to the map.
    L.geoJson(data,{
      color: "blue",
      weight: 2,
    }).addTo(tectonicPlateLayer)

  });

  let baseMaps = {
    Street: street,
    Topography: topo,
    Gray: graymap,
    Satelite: satellitemap,
    Outdoor: outdoors
  };

  // Overlays that can be toggled on or off
  let overlayMaps = {
    Markers: circleLayer,
     "Tectonic Plates": tectonicPlateLayer,
  };


  // STEP 4: INITIALIZE MAP
  let myMap = L.map("map", {
    center: [37.7749, -122.4194],
    zoom: 11,
    layers: [street]
  });
  var legend = L.control({position: 'bottomright'});

  legend.onAdd = function (map) {
  
      var div = L.DomUtil.create('div', 'info legend'),
          location = [0, 50, 70, 90];
          labels = ["0-50", "51-70", "71-90", "91+"];
  
      // loop through our density intervals and generate a label with a colored square for each interval
      for (var i = 0; i < location.length; i++) {
          div.innerHTML +=
              '<i style="background:' + getColor(location[i] + 1) + '"></i> ' +
              labels[i] + '<br>';
      }
  
      return div;
  };
  
  legend.addTo(myMap);
  
  // STEP 5: ADD LAYER CONTROL TO MAP
  circleLayer.addTo(myMap)
  // Create a layer control that contains our baseMaps and overlayMaps, and add them to the map.
  L.control.layers(baseMaps, overlayMaps).addTo(myMap);

}