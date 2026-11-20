
const tripsContainer = document.querySelector('#trips-container');
const regionFilter = document.querySelector('#region-filter');
const seasonFilter = document.querySelector('#season-filter');
const tripsStatus = document.querySelector('#trips-status');

let allTrips = [];

const escapeHTML = (value) => {
    return String(value ?? '').replace(/[&<>"']/g, (character) => {
        const entities = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
        };

        return entities[character];
    });
};

const populateFilters = (trips) => {
    const regions = [...new Set(trips.map((trip) => trip.region))].sort();
    const seasons = [...new Set(trips.map((trip) => trip.bestSeason))].sort();

    regions.forEach((region) => {
        const option = document.createElement('option');
        option.value = region;
        option.textContent = region.charAt(0).toUpperCase() + region.slice(1);
        regionFilter.appendChild(option);
    });

    seasons.forEach((season) => {
        const option = document.createElement('option');
        option.value = season;
        option.textContent = season.charAt(0).toUpperCase() + season.slice(1);
        seasonFilter.appendChild(option);
    });
};

const renderTrips = (trips) => {
    tripsContainer.innerHTML = '';

    if (trips.length === 0) {
        tripsStatus.textContent = 'No trips found for the selected filters.';
        return;
    }

    tripsStatus.textContent = '';

    trips.forEach((trip) => {
        const card = document.createElement('div');
        card.className = `route-card ${escapeHTML(trip.region)}`;

        card.innerHTML = `
            <div class="route-header">
                <h2 class="route-name">${escapeHTML(trip.name)}</h2>
                <span class="route-region">${escapeHTML(trip.region)}</span>
            </div>

            <div class="station-info">
                <div class="station">
                    <div class="station-type">From:</div>
                    <div class="station-name">${escapeHTML(trip.startStation)}</div>
                </div>
                <div class="route-arrow">&#8594;</div>
                <div class="station">
                    <div class="station-type">To:</div>
                    <div class="station-name">${escapeHTML(trip.endStation)}</div>
                </div>
            </div>

            <div class="route-details">
                <div class="detail-item">
                    <span class="detail-icon">&#128337;</span>
                    <span>
                        <span class="detail-label">Duration:</span>
                        ${escapeHTML(trip.duration)}
                    </span>
                </div>

                <div class="detail-item">
                    <span class="detail-icon">&#128205;</span>
                    <span>
                        <span class="detail-label">Distance:</span>
                        ${escapeHTML(trip.distance)}km
                    </span>
                </div>

                <div class="detail-item">
                    <span class="season-badge season-${escapeHTML(trip.bestSeason)}">
                        Best in ${escapeHTML(trip.bestSeason)}
                    </span>
                </div>
            </div>

            <div class="route-description">
                ${escapeHTML(trip.description)}
            </div>

            <div class="highlights">
                <div class="highlights-list">
                    ${trip.highlights.map((highlight) =>
            `<span class="highlight-tag">${escapeHTML(highlight)}</span>`
        ).join('')}
                </div>
            </div>

            <div class="route-actions">
                <a href="/trips/${encodeURIComponent(trip.id)}"
                   class="view-details-btn">
                    View Details &amp; Book &#8594;
                </a>
            </div>
        `;

        tripsContainer.appendChild(card);
    });
};

const applyFilters = () => {
    const selectedRegion = regionFilter.value;
    const selectedSeason = seasonFilter.value;

    console.log('Selected region:', selectedRegion);
    console.log('Selected season:', selectedSeason);

    const filteredTrips = allTrips.filter((trip) => {
        const matchesRegion =
            selectedRegion === 'all' || trip.region === selectedRegion;

        const matchesSeason =
            selectedSeason === 'all' || trip.bestSeason === selectedSeason;

        return matchesRegion && matchesSeason;
    });

    console.log('Filtered trips:', filteredTrips);

    renderTrips(filteredTrips);
};
const loadTrips = async () => {
    try {
        tripsStatus.textContent = 'Loading trips...';

        const response = await fetch('/api/trips');

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        allTrips = await response.json();

        populateFilters(allTrips);
        renderTrips(allTrips);
    } catch (error) {
        console.error('Error loading trips:', error);
        tripsStatus.textContent = 'Unable to load trips. Please try again later.';
    }
};

regionFilter.addEventListener('change', applyFilters);
seasonFilter.addEventListener('change', applyFilters);

loadTrips();
