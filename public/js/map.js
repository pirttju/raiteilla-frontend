document.addEventListener("DOMContentLoaded", () => {
  const map = new maplibregl.Map({
    container: "map",
    style: "https://sv1.raiteilla.fi/maps/osm-light/style.json",
    center: [18, 65],
    zoom: 4,
  });

  map.on("load", () => {
    map.addSource("trains", {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: [],
      },
    });

    map.addLayer({
      id: "train-locations",
      type: "symbol",
      source: "trains",
      layout: {
        "icon-image": "circle-11",
        "icon-allow-overlap": true,
        "text-field": ["get", "ro"],
        "text-font": ["Source Sans 3 Regular"],
        "text-offset": [0, 0.2],
        "text-anchor": "top",
      },
    });

    map.on("moveend", () => {
      updateTrainLocations();
    });

    const updateTrainLocations = async () => {
      const bounds = map.getBounds();
      const bbox = `${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()}`;
      try {
        const response = await fetch(
          `/train-api/v1/vehicles?routeType=2&bbox=${bbox}`
        );
        const data = await response.json();
        map.getSource("trains").setData(data);
      } catch (error) {
        console.error("Error fetching train locations:", error);
      }
    };

    updateTrainLocations();
    setInterval(updateTrainLocations, 15000);
  });
});
