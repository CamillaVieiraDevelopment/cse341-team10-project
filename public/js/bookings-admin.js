const formatBookingDate = (isoString) => {
    const date = new Date(isoString);

    if (Number.isNaN(date.getTime())) {
        return 'Unknown date';
    }

    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
};

const buildPassengerItem = (passenger) => {
    const item = document.createElement('li');

    item.textContent = `${passenger.firstName} ${passenger.lastName} (${passenger.email}, ${passenger.phone})`;

    return item;
};

const hookBookingsAdmin = async () => {
    const listEl = document.getElementById('bookings-list');
    const templateEl = document.getElementById('booking-card-template');
    const loadingEl = document.getElementById('bookings-loading');
    const errorEl = document.getElementById('bookings-error');
    const emptyEl = document.getElementById('bookings-empty');

    if (!listEl || !templateEl) {
        return;
    }

    try {
        const response = await fetch('/api/bookings');

        if (!response.ok) {
            throw new Error(`Failed to load bookings (${response.status})`);
        }

        const payload = await response.json();
        const bookings = Array.isArray(payload) ? payload : payload.bookings || [];
        const fragment = document.createDocumentFragment();

        bookings.forEach((booking) => {
            const card = templateEl.content.cloneNode(true);
            const passengers = booking.passengers || [];

            card.querySelector('[data-field="id"]').textContent = booking.id;
            card.querySelector('[data-field="created"]').textContent = formatBookingDate(booking.createdAt);
            card.querySelector('[data-field="trip"]').textContent = booking.tripId;
            card.querySelector('[data-field="schedule"]').textContent = booking.scheduleId;
            card.querySelector('[data-field="ticket-class"]').textContent = booking.ticketClass;
            card.querySelector('[data-field="day"]').textContent = booking.selectedDay;
            card.querySelector('[data-field="passenger-count"]').textContent = `Passengers (${passengers.length})`;

            const passengerListEl = card.querySelector('[data-field="passengers"]');

            passengers.forEach((passenger) => {
                passengerListEl.appendChild(buildPassengerItem(passenger));
            });

            fragment.appendChild(card);
        });

        listEl.replaceChildren(fragment);
        loadingEl.hidden = true;
        emptyEl.hidden = bookings.length > 0;
    } catch (error) {
        loadingEl.hidden = true;
        errorEl.hidden = false;
        errorEl.textContent = 'Unable to load bookings right now. Please try again in a moment.';
    }
};

document.addEventListener('DOMContentLoaded', hookBookingsAdmin);