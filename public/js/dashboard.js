document.addEventListener('DOMContentLoaded', async () => {
    const bookingsList = document.getElementById('bookings-list');

    if (!bookingsList) {
        return;
    }

    try {
        const response = await fetch('/api/bookings/mine');

        if (!response.ok) {
            throw new Error('Unable to retrieve your bookings.');
        }

        const bookings = await response.json();

        bookingsList.replaceChildren();

        if (!Array.isArray(bookings) || bookings.length === 0) {
            const message = document.createElement('p');
            message.textContent = 'You do not have any bookings yet.';
            bookingsList.appendChild(message);
            return;
        }

        const list = document.createElement('ul');

        bookings.forEach((booking) => {
            const item = document.createElement('li');

            const title = document.createElement('h3');
            title.textContent = `Booking ${booking.id}`;

            const details = document.createElement('p');
            details.textContent = [
                `Trip ID: ${booking.tripId ?? 'N/A'}`,
                `Schedule ID: ${booking.scheduleId ?? 'N/A'}`,
                `Travel day: ${booking.selectedDay ?? 'N/A'}`,
                `Ticket class: ${booking.ticketClass ?? 'N/A'}`
            ].join(' | ');

            item.append(title, details);
            list.appendChild(item);
        });

        bookingsList.appendChild(list);
    } catch (error) {
        console.error('Dashboard bookings error:', error);

        const message = document.createElement('p');
        message.textContent = 'Unable to load your bookings. Please try again later.';
        bookingsList.replaceChildren(message);
    }
});
