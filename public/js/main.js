document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("search-input");
  const suggestions = document.getElementById("suggestions");
  let stations = [];
  let trains = [];

  window.addEventListener("pageshow", function (event) {
    if (event.persisted) {
      searchInput.value = "";
      suggestions.innerHTML = "";
      suggestions.style.display = "none";
    }
  });

  const fetchAllData = async () => {
    const countries = ["fi", "no", "se"];
    const today = new Date().toISOString().slice(0, 10);
    const stationPromises = countries.map((country) =>
      fetch(`/train-api/v1/stations/${country}`).then((res) => res.json())
    );
    const trainPromises = countries.map((country) =>
      fetch(`/train-api/v1/trains/${country}/${today}`)
        .then((res) => res.json())
        .then((json) => ({ country, data: json }))
    );
    const stationResponses = await Promise.all(stationPromises);
    stationResponses.forEach((res) => {
      if (res.success) stations.push(...res.data);
    });
    const trainResponses = await Promise.all(trainPromises);
    trainResponses.forEach((response) => {
      if (response.data.success) {
        const trainsWithFeed = response.data.data.map((train) => ({
          ...train,
          feed: response.country,
        }));
        trains.push(...trainsWithFeed);
      }
    });
  };

  fetchAllData();

  const getScoredMatches = (items, query, key) => {
    const scoredItems = items.map((item) => {
      const value = item[key].toString().toLowerCase();
      let score = 0;
      if (value === query) {
        score = 3;
      } else if (value.startsWith(query)) {
        score = 2;
      } else if (value.includes(query)) {
        score = 1;
      }
      return { item, score };
    });
    return scoredItems
      .filter((scored) => scored.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((scored) => scored.item);
  };

  searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase();

    if (query.length < 2) {
      suggestions.innerHTML = "";
      suggestions.style.display = "none";
      return;
    }

    const stationMatches = getScoredMatches(stations, query, "name").slice(
      0,
      5
    );
    const trainMatches = getScoredMatches(trains, query, "train_number").slice(
      0,
      5
    );

    suggestions.innerHTML = "";
    if (stationMatches.length === 0 && trainMatches.length === 0) {
      suggestions.style.display = "none";
      return;
    }

    suggestions.style.display = "block";
    const today = new Date().toISOString().slice(0, 10);

    const flagMap = {
      fi: "🇫🇮",
      se: "🇸🇪",
      no: "🇳🇴",
    };

    stationMatches.forEach((station) => {
      const div = document.createElement("div");
      div.textContent = `${flagMap[station.feed_id] || "•"} ${station.name} (${
        station.station
      })`;
      div.onclick = () => {
        window.location.href = `/station/${station.feed_id}/${station.station}/${today}`;
        suggestions.innerHTML = "";
        suggestions.style.display = "none";
      };
      suggestions.appendChild(div);
    });

    trainMatches.forEach((train) => {
      const div = document.createElement("div");
      div.textContent = `${flagMap[train.feed] || "•"} ${train.train_type} ${
        train.train_number
      }: ${train.origin_name} - ${train.destination_name}`;
      div.onclick = () => {
        window.location.href = `/train/${train.feed}/${train.train_number}/${train.departure_date}`;
        suggestions.innerHTML = "";
        suggestions.style.display = "none";
      };
      suggestions.appendChild(div);
    });
  });

  document.addEventListener("click", function (event) {
    if (!searchInput.contains(event.target)) {
      suggestions.style.display = "none";
    }
  });
});
