
const tripsContainer = document.querySelector('#trips-container');
const regionFilter = document.querySelector('#region-filter');
const seasonFilter = document.querySelector('#season-filter');
const searchInput = document.querySelector('#trip-search');
const clearFiltersButton = document.querySelector('#clear-filters');
const tripsStatus = document.querySelector('#trips-status');

const pageSize = 10;

let currentPage = 1;
let pagination = null;
let searchTimeout = null;

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

const populateSelect = (select, values, defaultLabel) => {
    const selectedValue = select.value;

    select.innerHTML = '';

    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = defaultLabel;
    select.appendChild(defaultOption);

    values.forEach((value) => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent =
            value.charAt(0).toUpperCase() + value.slice(1);

        select.appendChild(option);
    });

    if (values.includes(selectedValue)) {
        select.value = selectedValue;
    }
};

const populateFilters = (availableFilters) => {
    populateSelect(
        regionFilter,
        availableFilters.regions,
        'All Regions'
    );

    populateSelect(
        seasonFilter,
        availableFilters.seasons,
        'Any Season'
    );
};

const renderTrips = (trips) => {
    tripsContainer.innerHTML = '';

    if (trips.length === 0) {
        tripsStatus.textContent = 'No trips found.';
        return;
    }

    tripsStatus.textContent =
        `${pagination.totalItems} trip(s) found.`;

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

const renderPagination = () => {
    const paginationContainer =
        document.querySelector('#pagination-controls');

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

    paginationContainer.append(
        previousButton,
        pageInfo,
        nextButton
    );
};

const loadTrips = async (page = 1) => {
    try {
        tripsStatus.textContent = 'Loading trips...';

        const params = new URLSearchParams({
            page: String(page),
            limit: String(pageSize)
        });

        if (regionFilter.value) {
            params.set('region', regionFilter.value);
        }

        if (seasonFilter.value) {
            params.set('season', seasonFilter.value);
        }

        if (searchInput.value.trim()) {
            params.set('search', searchInput.value.trim());
        }

        const response = await fetch(`/api/trips?${params.toString()}`);

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        const data = await response.json();

        pagination = data.pagination;
        currentPage = pagination.currentPage;

        populateFilters(data.availableFilters);
        renderTrips(data.trips);
        renderPagination();
    } catch (error) {
        console.error('Error loading trips:', error);

        tripsStatus.textContent =
            'Unable to load trips. Please try again later.';

        tripsContainer.innerHTML = '';
        document.querySelector('#pagination-controls').innerHTML = '';
    }
};

const applyFilters = () => {
    currentPage = 1;
    loadTrips(1);
};

regionFilter.addEventListener('change', applyFilters);
seasonFilter.addEventListener('change', applyFilters);

searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);

    searchTimeout = setTimeout(() => {
        applyFilters();
    }, 300);
});

clearFiltersButton.addEventListener('click', () => {
    regionFilter.value = '';
    seasonFilter.value = '';
    searchInput.value = '';

    applyFilters();
});

loadTrips();
