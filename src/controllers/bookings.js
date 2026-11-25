
import { getDb } from '../db/connect.js';
import { generateConfirmationCode } from '../includes/helpers.js';

import {
    createBooking,
    getAllBookings as findAllBookings,
    getBookingById,
} from '../models/bookings.js';

import {
    getTicketClassesForDay
} from '../models/ticket-classes.js';

// API Controllers

const getAllBookings = async (req, res) => {
    try {
        const bookings = await findAllBookings();

        return res.status(200).json(bookings);
    } catch (error) {
        console.error('Error retrieving bookings:', error);

        return res.status(500).json({
            message: 'An error occurred while retrieving bookings.',
        });
    }
};

// EJS Controllers

const bookingPage = async (req, res, next) => {
    try {
        const { scheduleId } = req.params;
        const db = getDb();

        const schedule = await db.collection('schedules').findOne({
            id: Number(scheduleId)
        });

        if (!schedule) {
            return res.status(404).send('Schedule not found');
        }

        const trip = await db.collection('trips').findOne({
            id: schedule.tripId
        });

        if (!trip) {
            return res.status(404).send('Trip not found');
        }

        if (!Array.isArray(schedule.daysOfWeek) ||
            schedule.daysOfWeek.length === 0) {
            return res.status(400).send('No operating days available');
        }

        const firstDay = String(schedule.daysOfWeek[0])
            .trim()
            .toLowerCase();

        const ticketClasses = await getTicketClassesForDay(firstDay);

        const ticketOptions = ticketClasses.map((ticketClass) => ({
            class: ticketClass.class,
            name: ticketClass.name,
            price: trip.distance * ticketClass.pricePerKm,
            pricePerKm: ticketClass.pricePerKm,
            amenities: ticketClass.amenities,
            description: ticketClass.description,
            available: ticketClass.available
        }));

        return res.render('trips/book', {
            title: 'Book Trip',
            schedule,
            ticketOptions,
            distance: trip.distance
        });

    } catch (error) {
        console.error('Error loading booking page:', error);
        return next(error);
    }
};

// Process booking form

const processBookingRequest = async (req, res, next) => {
    try {
        const {
            scheduleId,
            ticketClass,
            selectedDay,
            passengers
        } = req.body;

        // Validate required fields
        if (!scheduleId || !ticketClass || !selectedDay) {
            return res.status(400).send(
                'Please complete all required booking fields.'
            );
        }

        // Validate schedule ID
        const parsedScheduleId = Number(scheduleId);

        if (!Number.isInteger(parsedScheduleId) || parsedScheduleId <= 0) {
            return res.status(400).send('Invalid schedule ID.');
        }

        const db = getDb();

        // Find schedule
        const schedule = await db.collection('schedules').findOne({
            id: parsedScheduleId
        });

        if (!schedule) {
            return res.status(404).send('Schedule not found.');
        }

        // Validate selected day
        const normalizedDay = String(selectedDay)
            .trim()
            .toLowerCase();

        const scheduleDays = (schedule.daysOfWeek || [])
            .map(day => String(day).trim().toLowerCase());

        if (!scheduleDays.includes(normalizedDay)) {
            return res.status(400).send(
                'The selected day is not available for this schedule.'
            );
        }

        // Validate ticket class availability
        const ticketClasses = await getTicketClassesForDay(normalizedDay);

        const selectedTicket = ticketClasses.find(
            ticket =>
                ticket.class === String(ticketClass).trim().toLowerCase()
                && ticket.available
        );

        if (!selectedTicket) {
            return res.status(400).send(
                'The selected ticket class is not available on this day.'
            );
        }

        // Validate passengers
        if (!Array.isArray(passengers) ||
            passengers.length < 1 ||
            passengers.length > 8) {
            return res.status(400).send(
                'A booking must have between 1 and 8 passengers.'
            );
        }

        const validatedPassengers = passengers.map(passenger => ({
            firstName: String(passenger.firstName || '').trim(),
            lastName: String(passenger.lastName || '').trim(),
            email: String(passenger.email || '').trim(),
            phone: String(passenger.phone || '').trim()
        }));

        const invalidPassenger = validatedPassengers.some(passenger =>
            !passenger.firstName ||
            !passenger.lastName ||
            !passenger.email ||
            !passenger.phone
        );

        if (invalidPassenger) {
            return res.status(400).send(
                'Please complete all passenger information.'
            );
        }

        // Generate confirmation code
        const confirmationCode = generateConfirmationCode();

        // Save booking in MongoDB
        await createBooking({
            id: confirmationCode,
            scheduleId: parsedScheduleId,
            tripId: schedule.tripId,
            ticketClass: selectedTicket.class,
            selectedDay: normalizedDay,
            passengers: validatedPassengers
        });

        // Redirect to confirmation page
        return res.redirect(
            `/trips/confirmation/${confirmationCode}`
        );

    } catch (error) {
        console.error('Error processing booking:', error);
        return next(error);
    }
};

// Booking confirmation page

const bookingConfirmationPage = async (req, res, next) => {
    try {
        const { confirmationId } = req.params;
        const booking = await getBookingById(confirmationId);

        if (!booking) {
            const notFoundError = new Error('Booking not found');
            notFoundError.status = 404;

            return next(notFoundError);
        }

        return res.render('trips/confirm', {
            title: 'Trip Confirmation',
            confirmation: booking,
        });
    } catch (error) {
        return next(error);
    }
};

// Admin page

const bookingsAdminPage = (req, res) => {
    return res.render('bookings', {
        title: 'Bookings Admin',
    });
};

export {
    getAllBookings,
    bookingPage,
    processBookingRequest,
    bookingConfirmationPage,
    bookingsAdminPage,
};
