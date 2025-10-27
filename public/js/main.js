document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("search-input");
  const suggestions = document.getElementById("suggestions");
  let stations = [];
  let trains = [];

  const fetchAllData = async () => {
    const countries = ["fi", "no", "se"];
    const today = new Date().toISOString().slice(0, 10);

    // Fetch stations (this part is fine and can remain the same)
    const stationPromises = countries.map((country) =>
      fetch(`/train-api/v1/stations/${country}`).then((res) => res.json())
    );

    // Fetch trains, but keep the country context for each response
    const trainPromises = countries.map(
      (country) =>
        fetch(`/train-api/v1/trains/${country}/${today}`)
          .then((res) => res.json())
          .then((json) => ({ country, data: json })) // Package the country with its JSON response
    );

    const stationResponses = await Promise.all(stationPromises);
    stationResponses.forEach((res) => {
      if (res.success) stations.push(...res.data);
    });

    const trainResponses = await Promise.all(trainPromises);

    // Process the train responses
    trainResponses.forEach((response) => {
      if (response.data.success) {
        // For each train, create a new object that includes the 'feed' property
        const trainsWithFeed = response.data.data.map((train) => ({
          ...train,
          feed: response.country, // Manually add the country code as 'feed'
        }));
        trains.push(...trainsWithFeed);
      }
    });
  };

  fetchAllData();

  searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase();
    suggestions.innerHTML = "";
    if (query.length < 2) return;

    const stationMatches = stations
      .filter((s) => s.name.toLowerCase().includes(query))
      .slice(0, 5);

    const trainMatches = trains
      .filter((t) => t.train_number.toString().includes(query))
      .slice(0, 5);

    const today = new Date().toISOString().slice(0, 10);

    stationMatches.forEach((station) => {
      const div = document.createElement("div");
      div.textContent = `${station.name} (${station.station})`;
      div.onclick = () => {
        window.location.href = `/station/${station.feed_id}/${station.station}/${today}`;
      };
      suggestions.appendChild(div);
    });

    trainMatches.forEach((train) => {
      const div = document.createElement("div");
      div.textContent = `${train.train_type} ${train.train_number}: ${train.origin_name} - ${train.destination_name}`;

      div.onclick = () => {
        window.location.href = `/train/${train.feed}/${train.train_number}/${train.departure_date}`;
      };

      suggestions.appendChild(div);
    });
  });
});
