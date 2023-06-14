const filename = "./poi.json";

window.addEventListener("load", async () => {
  const data = await fetch(filename);
  const json = await data.json();

  document.title = json.name;

  /*  we is going to find our location */

  mapboxgl.accessToken =
    "pk.eyJ1IjoibHRkbiIsImEiOiJjbGl1MjM5ODIxc2V6M2tvMWpxNzQxcHF3In0.8RRsebPgocLYzJX1LniMKA";
  var map = new mapboxgl.Map({
    container: "map",
    /* change mapbox style to grays */
    style: "mapbox://styles/mapbox/dark-v11",
    center: [28.039842021053342, -26.130311836838768], // starting position [lng, lat]
    zoom: 10, // starting position [lng, lat]
  });

  var ourPoiMarker = addPoiToMap(json.poi[0], map);

  navigator.geolocation.getCurrentPosition(
    (position) => {
      console.log("we got your position", position.coords);
      map.flyTo({
        center: [position.coords.longitude, position.coords.latitude],
        zoom: 10,
        essential: true,
        speed: 1,
      });

      // work

      var ourPositionMarker = new mapboxgl.Marker({
        color: "#ffff00",
      })
        .setLngLat([27.95227218260679, -26.23461997705797])
        .addTo(map);

      map.fitBounds(
        [
          ourPositionMarker.getLngLat().toArray(),
          ourPoiMarker.getLngLat().toArray(),
        ],
        {
          padding: 40,
        }
      );

      let startCoord = ourPositionMarker.getLngLat().toArray().join(",");
      let endCoord = ourPoiMarker.getLngLat().toArray().join(",");
      let navigationURL = `https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${startCoord};${endCoord}`;
      navigationURL += `?access_token=${mapboxgl.accessToken}&geometries=geojson`;

      async function getDirections() {
        console.log("getting directions");
        const query = await fetch(navigationURL);
        const json = await query.json();
        const data = json.routes[0];
        console.log(json);

        const route = data.geometry.coordinates;
        const geojson = {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: route,
          },
        };

        if (map.getSource("route")) {
          map.getSource("route").setData(geojson);
        } else {
          map.addLayer({
            id: "route",
            type: "line",
            source: {
              type: "geojson",
              data: geojson,
            },
            layout: {
              "line-join": "round",
              "line-cap": "round",
            },
            paint: {
              "line-color": "#87ceeb",
              "line-width": 5,
              "line-opacity": 0.75,
            },
          });
          console.log(map.getSource("route"));
        }
      }

      console.log("get directions");
      getDirections();
    },

    (error) => {
      console.error("We could not get your position", error);
    }
  );
});

function addPoiToMap(poi, map) {
  const marker = new mapboxgl.Marker({
    color: "#000000",
  })

    .setLngLat([poi.gps.longitude, poi.gps.latitude])
    .addTo(map);

  return marker;
}

/*    .setLngLat([28.039842021053342, -26.130311836838768])
    .addTo(map);

  map.setZoom(12);*/
