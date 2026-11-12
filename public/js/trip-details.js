
const tripContainer = document.querySelector('#trip-details');
const tripStatus = document.querySelector('#trip-status');

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

const renderTripDetails = (trip) => {
    if (!tripContainer) {
        throw new Error('Trip container not found.');
    }

    tripContainer.innerHTML = `
        <article class="route-detail">
            <div class="route-header">
                <div class="route-header-content">
                    <h1 class="route-name">${escapeHTML(trip.name)}</h1>
                    <p class="route-description">${escapeHTML(trip.description)}</p>

                    <div class="highlights">
                        <div class="highlights-list">
                            ${trip.highlights.map((highlight) =>
        `<span class="highlight-tag">${escapeHTML(highlight)}</span>`
    ).join('')}
                        </div>
                    </div>
                </div>

                ${trip.imageUrl ? `
                    <div class="route-image">
                        <img src="${escapeHTML(trip.imageUrl)}"
                             alt="${escapeHTML(trip.name)}">
                    </div>
                ` : ''}
            </div>

            <div class="route-info">
                <div class="info-grid">
                    <div class="info-item">
                        <span class="info-label">Region</span>
                        <span class="info-value">${escapeHTML(trip.region)}</span>
                    </div>

                    <div class="info-item">
                        <span class="info-label">Duration</span>
                        <span class="info-value">${escapeHTML(trip.duration)}</span>
                    </div>

                    <div class="info-item">
                        <span class="info-label">Distance</span>
                        <span class="info-value">${escapeHTML(trip.distance)} km</span>
                    </div>

                    <div class="info-item">
                        <span class="info-label">Best Season</span>
                        <span class="info-value">${escapeHTML(trip.bestSeason)}</span>
                    </div>
                </div>

                <div class="route-stations">
                    <h2>Trip</h2>
                    <div class="stations">
                        <div class="station">
                            <span class="station-label">Start</span>
                            <span class="station-name">${escapeHTML(trip.startStation)}</span>
                        </div>
                        <div class="station">
                            <span class="station-label">End</span>
                            <span class="station-name">${escapeHTML(trip.endStation)}</span>
                        </div>
                    </div>
                </div>

                <div class="route-operating">
                    <h2>Operating Schedule</h2>
                    <div class="months-grid">
                        ${trip.operatingMonths.map((month) =>
        `<span class="month-badge">${escapeHTML(month)}</span>`
    ).join('')}
                    </div>
                </div>
            </div>
        </article>
    `;
};

const loadTripDetails = async () => {
    try {
        if (!tripContainer || !tripStatus) {
            throw new Error('Trip page elements not found.');
        }

        const tripId = window.location.pathname.split('/').pop();

        tripStatus.textContent = 'Loading trip details...';

        const response = await fetch(
            `/api/trips/${encodeURIComponent(tripId)}`
        );

        if (!response.ok) {
            throw new Error(`Trip API error: ${response.status}`);
        }

        const trip = await response.json();

        renderTripDetails(trip);
        tripStatus.textContent = '';

    } catch (error) {
        console.error('Error loading trip details:', error);

        if (tripStatus) {
            tripStatus.textContent =
                'Unable to load trip details. Please try again later.';
        }
    }
};

loadTripDetails();
