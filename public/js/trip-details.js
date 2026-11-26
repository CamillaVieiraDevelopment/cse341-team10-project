
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

const formatDay = (day) => {
    return String(day)
        .charAt(0)
        .toUpperCase() + String(day).slice(1);
};

const renderSchedules = (schedules, error = null) => {
    if (error) {
        return `
            <section class="route-schedules">
                <h2>Available Departures</h2>
                <p role="alert">
                    Unable to load departure schedules. Please try again later.
                </p>
            </section>
        `;
    }

    if (!schedules.length) {
        return `
            <section class="route-schedules">
                <h2>Available Departures</h2>
                <p>No active schedules are currently available for this trip.</p>
            </section>
        `;
    }

    return `
        <section class="route-schedules">
            <h2>Available Departures</h2>
            <p>Select a departure time to continue with your booking.</p>

            <div class="schedules-list">
                ${schedules.map((schedule) => `
                    <article class="schedule-card">
                        <div class="schedule-times">
                            <div>
                                <span class="info-label">Departure</span>
                                <strong>${escapeHTML(schedule.departureTime)}</strong>
                            </div>

                            <div>
                                <span class="info-label">Arrival</span>
                                <strong>${escapeHTML(schedule.arrivalTime)}</strong>
                            </div>
                        </div>

                        <div class="schedule-days">
                            <span class="info-label">Operating Days</span>
                            <span>
                                ${(schedule.daysOfWeek || [])
            .map((day) => escapeHTML(formatDay(day)))
            .join(', ')}
                            </span>
                        </div>

                        <div class="schedule-actions">
                            <a
                                href="/trips/booking/${encodeURIComponent(schedule.id)}"
                                class="btn btn-primary"
                            >
                                Book Now
                            </a>
                        </div>
                    </article>
                `).join('')}
            </div>
        </section>
    `;
};

const renderTripDetails = (trip, schedules, scheduleError = null) => {
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
                            ${(trip.highlights || []).map((highlight) =>
        `<span class="highlight-tag">${escapeHTML(highlight)}</span>`
    ).join('')}
                        </div>
                    </div>
                </div>

                ${trip.imageUrl ? `
                    <div class="route-image">
                        <img
                            src="${escapeHTML(trip.imageUrl)}"
                            alt="${escapeHTML(trip.name)}"
                        >
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
                        ${(trip.operatingMonths || []).map((month) =>
        `<span class="month-badge">${escapeHTML(month)}</span>`
    ).join('')}
                    </div>
                </div>

                ${renderSchedules(schedules, scheduleError)}
            </div>
        </article>
    `;
};

const loadTripDetails = async () => {
    try {
        if (!tripContainer || !tripStatus) {
            throw new Error('Trip page elements not found.');
        }

        const tripId = window.location.pathname
            .split('/')
            .filter(Boolean)
            .pop();

        tripStatus.textContent = 'Loading trip details...';

        const tripResponse = await fetch(
            `/api/trips/${encodeURIComponent(tripId)}`
        );

        if (!tripResponse.ok) {
            throw new Error(`Trip API error: ${tripResponse.status}`);
        }

        const trip = await tripResponse.json();

        let schedules = [];
        let scheduleError = false;

        try {
            const schedulesResponse = await fetch(
                `/api/trips/${encodeURIComponent(tripId)}/schedules`
            );

            if (!schedulesResponse.ok) {
                throw new Error(
                    `Schedules API error: ${schedulesResponse.status}`
                );
            }

            schedules = await schedulesResponse.json();

            if (!Array.isArray(schedules)) {
                throw new Error('Invalid schedules response.');
            }
        } catch (error) {
            console.error('Error loading trip schedules:', error);
            scheduleError = true;
        }

        renderTripDetails(trip, schedules, scheduleError);
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
