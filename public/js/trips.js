
const tripsContainer = document.querySelector('#trips-container');
const regionFilter = document.querySelector('#region-filter');
const seasonFilter = document.querySelector('#season-filter');
const tripsStatus = document.querySelector('#trips-status');

const pageSize = 10;

let currentPage = 1;
let currentTrips = [];
let pagination = null;

const escapeHTML = (value) => {
    return String(value ?? '').replace(/[&<>"']/g, (character) => {
        const entities = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        };

        return entities[character];
    });
};

const populateFilters = (trips) => {
    const regions = [...new Set(trips.map((trip) => trip.region))].sort();
    const seasons = [...new Set(trips.map((trip) => trip.bestSeason))].sort();

    regions.forEach((region) => {
        if ([...regionFilter.options].some((option) => option.value === region)) {
            return;
        }

        const option = document.createElement('option');
        option.value = region;
        option.textContent = region.charAt(0).toUpperCase() + region.slice(1);
        regionFilter.appendChild(option);
    });

    seasons.forEach((season) => {
        if ([...seasonFilter.options].some((option) => option.value === season)) {
            return;
        }

        const option = document.createElement('option');
        option.value = season;
        option.textContent = season.charAt(0).toUpperCase() + season.slice(1);
        seasonFilter.appendChild(option);
    });
};

const renderTrips = (trips) => {
    tripsContainer.innerHTML = '';

    if (trips.length === 0) {
        tripsStatus.textContent = 'No trips found.';
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
                    ${(trip.highlights || []).map((highlight) =>
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

    const filteredTrips = currentTrips.filter((trip) => {
        const matchesRegion =
            selectedRegion === 'all' || trip.region === selectedRegion;

        const matchesSeason =
            selectedSeason === 'all' || trip.bestSeason === selectedSeason;

        return matchesRegion && matchesSeason;
    });

    renderTrips(filteredTrips);
};

const renderPagination = () => {
    let paginationContainer = document.querySelector('#pagination-controls');

    if (!paginationContainer) {
        paginationContainer = document.createElement('div');
        paginationContainer.id = 'pagination-controls';
        paginationContainer.className = 'pagination-controls';
        tripsContainer.after(paginationContainer);
    }

    paginationContainer.innerHTML = '';

    if (!pagination || pagination.totalPages <= 1) {
        return;
    }

    const previousButton = document.createElement('button');
    previousButton.textContent = 'Previous';
    previousButton.type = 'button';
    previousButton.disabled = currentPage === 1;
    previousButton.addEventListener('click', () => {
        loadTrips(currentPage - 1);
    });

    const pageInfo = document.createElement('span');
    pageInfo.textContent =
        `Page ${pagination.currentPage} of ${pagination.totalPages}`;

    const nextButton = document.createElement('button');
    nextButton.textContent = 'Next';
    nextButton.type = 'button';
    nextButton.disabled = currentPage === pagination.totalPages;
    nextButton.addEventListener('click', () => {
        loadTrips(currentPage + 1);
    });

    paginationContainer.append(previousButton, pageInfo, nextButton);
};

const loadTrips = async (page = 1) => {
    try {
        tripsStatus.textContent = 'Loading trips...';

        const response = await fetch(
            `/api/trips?page=${page}&limit=${pageSize}`
        );

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        const data = await response.json();

        currentTrips = data.trips;
        pagination = data.pagination;
        currentPage = pagination.currentPage;

        populateFilters(currentTrips);
        applyFilters();
        renderPagination();
    } catch (error) {
        console.error('Error loading trips:', error);
        tripsStatus.textContent =
            'Unable to load trips. Please try again later.';
    }
};

regionFilter.addEventListener('change', applyFilters);
seasonFilter.addEventListener('change', applyFilters);

loadTrips();
