const DAYS_OF_WEEK = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday'
];

const PASSENGER_FIELDS = [
    { name: 'firstName', label: 'First name', type: 'text' },
    { name: 'lastName', label: 'Last name', type: 'text' },
    { name: 'email', label: 'Email', type: 'email' },
    { name: 'phone', label: 'Phone', type: 'tel' }
];

// The bookings currently on the page, keyed by booking id.
const bookingsById = new Map();

const getElement = (id) => {
    return document.getElementById(id);
};

const showMessage = (text, isError = false) => {
    const messageEl = getElement('bookings-message');

    if (!messageEl) {
        return;
    }

    messageEl.textContent = text;
    messageEl.classList.toggle('bookings-error', isError);
    messageEl.hidden = false;
};

const clearMessage = () => {
    const messageEl = getElement('bookings-message');

    if (!messageEl) {
        return;
    }

    messageEl.textContent = '';
    messageEl.hidden = true;
};

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

// Calls the API. Sends signed-out users to the login page, and turns
// error responses into thrown errors that carry the server's message.
const requestJson = async (url, options = {}) => {
    const response = await fetch(url, options);

    if (response.status === 401) {
        window.location.href = '/login';
        throw new Error('Please log in to continue.');
    }

    if (response.status === 204) {
        return null;
    }
    let payload = {};

    try {
        payload = await response.json();
    } catch (error) {
        console.error('Response was not valid JSON:', error.message);
    }

    if (!response.ok) {
        throw new Error(payload.message || `Request failed (${response.status})`);
    }

    return payload;
};

const buildBookingCard = (templateEl, booking) => {
    const fragment = templateEl.content.cloneNode(true);
    const cardEl = fragment.querySelector('.booking-card');
    const passengers = booking.passengers || [];

    cardEl.dataset.bookingId = booking.id;

    fragment.querySelector('[data-field="id"]').textContent = booking.id;
    fragment.querySelector('[data-field="created"]').textContent = formatBookingDate(booking.createdAt);
    fragment.querySelector('[data-field="trip"]').textContent = booking.tripId;
    fragment.querySelector('[data-field="schedule"]').textContent = booking.scheduleId;
    fragment.querySelector('[data-field="ticket-class"]').textContent = booking.ticketClass;
    fragment.querySelector('[data-field="day"]').textContent = booking.selectedDay;
    fragment.querySelector('[data-field="passenger-count"]').textContent = `Passengers (${passengers.length})`;

    const passengerListEl = fragment.querySelector('[data-field="passengers"]');

    passengers.forEach((passenger) => {
        passengerListEl.appendChild(buildPassengerItem(passenger));
    });

    return fragment;
};

const renderBookings = (bookings) => {
    const listEl = getElement('bookings-list');
    const templateEl = getElement('booking-card-template');
    const emptyEl = getElement('bookings-empty');
    const fragment = document.createDocumentFragment();

    bookingsById.clear();

    bookings.forEach((booking) => {
        bookingsById.set(booking.id, booking);
        fragment.appendChild(buildBookingCard(templateEl, booking));
    });

    listEl.replaceChildren(fragment);
    emptyEl.hidden = bookings.length > 0;
};

const loadBookings = async () => {
    const payload = await requestJson('/api/bookings');
    const bookings = Array.isArray(payload) ? payload : payload.bookings || [];

    renderBookings(bookings);
};

// Edit form

const buildPassengerFieldset = (passenger, index) => {
    const fieldset = document.createElement('fieldset');
    const legend = document.createElement('legend');

    fieldset.className = 'booking-edit-passenger';
    legend.textContent = `Passenger ${index + 1}`;
    fieldset.appendChild(legend);

    PASSENGER_FIELDS.forEach((field) => {
        const label = document.createElement('label');
        const input = document.createElement('input');

        label.className = 'booking-edit-label';
        label.textContent = field.label;

        input.className = 'booking-edit-input';
        input.type = field.type;
        input.name = field.name;
        input.value = passenger[field.name] ?? '';
        input.required = true;

        label.appendChild(input);
        fieldset.appendChild(label);
    });

    return fieldset;
};

const buildEditForm = (booking) => {
    const form = document.createElement('form');
    const dayLabel = document.createElement('label');
    const daySelect = document.createElement('select');
    const actionsEl = document.createElement('div');
    const saveButton = document.createElement('button');
    const cancelButton = document.createElement('button');

    form.className = 'booking-edit-form';

    dayLabel.className = 'booking-edit-label';
    dayLabel.textContent = 'Day';

    daySelect.className = 'booking-edit-input';
    daySelect.name = 'selectedDay';

    // Keep the saved day selectable even if it is not one of the seven names.
    const dayChoices = DAYS_OF_WEEK.includes(booking.selectedDay)
        ? DAYS_OF_WEEK
        : [booking.selectedDay, ...DAYS_OF_WEEK];

    dayChoices.forEach((day) => {
        const option = document.createElement('option');

        option.value = day;
        option.textContent = day.charAt(0).toUpperCase() + day.slice(1);
        daySelect.appendChild(option);
    });

    daySelect.value = booking.selectedDay;
    dayLabel.appendChild(daySelect);
    form.appendChild(dayLabel);

    (booking.passengers || []).forEach((passenger, index) => {
        form.appendChild(buildPassengerFieldset(passenger, index));
    });

    actionsEl.className = 'booking-actions';

    saveButton.type = 'submit';
    saveButton.className = 'booking-button';
    saveButton.textContent = 'Save';

    cancelButton.type = 'button';
    cancelButton.className = 'booking-button booking-button-secondary';
    cancelButton.dataset.action = 'cancel';
    cancelButton.textContent = 'Cancel';

    actionsEl.append(saveButton, cancelButton);
    form.appendChild(actionsEl);

    return form;
};

const readEditForm = (form, booking) => {
    const passengers = Array.from(form.querySelectorAll('.booking-edit-passenger')).map((fieldset) => {
        const passenger = {};

        PASSENGER_FIELDS.forEach((field) => {
            passenger[field.name] = fieldset.querySelector(`[name="${field.name}"]`).value.trim();
        });

        return passenger;
    });

    return {
        // The ticket class is not editable on this page, so it is sent back unchanged.
        ticketClass: booking.ticketClass,
        selectedDay: form.elements.selectedDay.value,
        passengers
    };
};

const showEditMode = (cardEl, booking) => {
    const viewEl = cardEl.querySelector('[data-field="view"]');
    const editEl = cardEl.querySelector('[data-field="edit"]');

    editEl.replaceChildren(buildEditForm(booking));
    viewEl.hidden = true;
    editEl.hidden = false;
};

const showViewMode = (cardEl) => {
    const viewEl = cardEl.querySelector('[data-field="view"]');
    const editEl = cardEl.querySelector('[data-field="edit"]');

    editEl.replaceChildren();
    editEl.hidden = true;
    viewEl.hidden = false;
};

// Saving and deleting

const saveBooking = async (booking, form) => {
    const saveButton = form.querySelector('[type="submit"]');

    saveButton.disabled = true;

    try {
        await requestJson(`/api/bookings/${encodeURIComponent(booking.id)}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(readEditForm(form, booking))
        });

        await loadBookings();
        showMessage(`Booking ${booking.id} was updated.`);
    } catch (error) {
        showMessage(error.message, true);
    } finally {
        saveButton.disabled = false;
    }
};

const removeBooking = async (booking) => {
    const confirmed = window.confirm(`Delete booking ${booking.id}? This cannot be undone.`);

    if (!confirmed) {
        return;
    }

    try {
        await requestJson(`/api/bookings/${encodeURIComponent(booking.id)}`, {
            method: 'DELETE'
        });

        await loadBookings();
        showMessage(`Booking ${booking.id} was deleted.`);
    } catch (error) {
        showMessage(error.message, true);
    }
};

// One listener on the list handles every card, including cards added later.
const handleListClick = (event) => {
    const button = event.target.closest('[data-action]');

    if (!button) {
        return;
    }

    const cardEl = button.closest('.booking-card');
    const booking = bookingsById.get(cardEl.dataset.bookingId);

    if (!booking) {
        return;
    }

    if (button.dataset.action === 'edit') {
        clearMessage();
        showEditMode(cardEl, booking);
    }

    if (button.dataset.action === 'cancel') {
        showViewMode(cardEl);
    }

    if (button.dataset.action === 'delete') {
        removeBooking(booking);
    }
};

const handleListSubmit = (event) => {
    const form = event.target.closest('.booking-edit-form');

    if (!form) {
        return;
    }

    event.preventDefault();

    const cardEl = form.closest('.booking-card');
    const booking = bookingsById.get(cardEl.dataset.bookingId);

    if (booking) {
        saveBooking(booking, form);
    }
};

const hookBookingsAdmin = async () => {
    const listEl = getElement('bookings-list');
    const templateEl = getElement('booking-card-template');
    const loadingEl = getElement('bookings-loading');
    const errorEl = getElement('bookings-error');

    if (!listEl || !templateEl) {
        return;
    }

    listEl.addEventListener('click', handleListClick);
    listEl.addEventListener('submit', handleListSubmit);

    try {
        await loadBookings();
    } catch (error) {
        errorEl.hidden = false;
        errorEl.textContent = 'Unable to load bookings right now. Please try again in a moment.';
    } finally {
        loadingEl.hidden = true;
    }
};

document.addEventListener('DOMContentLoaded', hookBookingsAdmin);