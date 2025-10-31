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
    const countries = ["fi", "no", "se", "gb"];
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
      if (res.success) {
        const visibleStations = res.data.filter(
          (station) => !station.is_hidden && station.type === "station"
        );
        stations.push(...visibleStations);
      }
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

  // Now includes country-specific logic for train searches.
  const getScoredMatches = (items, query, keys) => {
    const scoredItems = items.map((item) => {
      let maxScore = 0; // Find the best score across all keys for this item

      keys.forEach((key) => {
        // Check if the item actually has this property
        if (!item[key]) return;

        // Country-specific search logic for trains
        // This logic applies only when the item is a train (has a 'feed' property)
        if (item.feed) {
          // For UK (gb) trains, only match against 'headcode'
          if (item.feed === "gb" && key !== "headcode") {
            return; // Skip this key and continue to the next one
          }
          // For all other trains, only match against 'train_number'
          if (item.feed !== "gb" && key !== "train_number") {
            return; // Skip this key
          }
        }
        // For non-train items (stations), this block is skipped, and all provided keys are used.

        const value = item[key].toString().toLowerCase();
        let currentScore = 0;

        if (value === query) {
          currentScore = 3; // Exact match
        } else if (value.startsWith(query)) {
          currentScore = 2; // Starts with
        } else if (value.includes(query)) {
          currentScore = 1; // Contains
        }

        if (currentScore > maxScore) {
          maxScore = currentScore;
        }
      });

      return { item, score: maxScore };
    });

    return scoredItems
      .filter((scored) => scored.score > 0) // Keep only actual matches
      .sort((a, b) => b.score - a.score) // Sort by score, descending
      .map((scored) => scored.item); // Return just the original items
  };

  searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase();

    if (query.length < 2) {
      suggestions.innerHTML = "";
      suggestions.style.display = "none";
      return;
    }

    const stationMatches = getScoredMatches(stations, query, ["name"]).slice(
      0,
      5
    );
    const trainMatches = getScoredMatches(trains, query, [
      "train_number",
      "headcode",
    ]).slice(0, 5);

    suggestions.innerHTML = "";
    if (stationMatches.length === 0 && trainMatches.length === 0) {
      suggestions.style.display = "none";
      return;
    }

    suggestions.style.display = "block";
    const today = new Date().toISOString().slice(0, 10);
    const flagMap = { fi: "🇫🇮", se: "🇸🇪", no: "🇳🇴", gb: "🇬🇧" };

    trainMatches.forEach((train) => {
      const div = document.createElement("div");
      const displayNumber =
        train.feed === "gb" && train.headcode
          ? train.headcode
          : train.train_number;
      div.textContent = `${flagMap[train.feed] || "•"} ${
        train.train_type
      } ${displayNumber}: ${train.origin_name} - ${train.destination_name}`;
      div.onclick = () => {
        window.location.href = `/train/${train.feed}/${train.train_number}/${train.departure_date}`;
        suggestions.innerHTML = "";
        suggestions.style.display = "none";
      };
      suggestions.appendChild(div);
    });

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
  });

  document.addEventListener("click", function (event) {
    if (!searchInput.contains(event.target)) {
      suggestions.style.display = "none";
    }
  });
});
