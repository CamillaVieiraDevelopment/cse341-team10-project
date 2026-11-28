
import { getDb } from '../db/connect.js';
import { generateConfirmationCode } from '../includes/helpers.js';
import {
    createBooking,
    getAllBookings as findAllBookings,
    getBookingById,
    getBookingsByPassengerEmail,
} from '../models/bookings.js';

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
            id: Number(scheduleId),
        });

        if (!schedule) {
            const error = new Error('Schedule not found');
            error.status = 404;
            return next(error);
        }

        const trip = await db.collection('trips').findOne({
            id: schedule.tripId,
        });

        if (!trip) {
            const error = new Error('Trip not found');
            error.status = 404;
            return next(error);
        }

        const ticketClasses = await db.collection('ticketClasses')
            .find({})
            .toArray();

        const ticketOptions = ticketClasses.map((ticketClass) => ({
            class: ticketClass.class,
            name: ticketClass.name,
            price: trip.distance * ticketClass.pricePerKm,
            amenities: ticketClass.amenities,
            description: ticketClass.description,
        }));

        return res.render('trips/book', {
            title: 'Book Trip',
            schedule,
            ticketOptions,
        });
    } catch (error) {
        return next(error);
    }
};

const processBookingRequest = async (req, res, next) => {
    try {
        const {
            scheduleId,
            ticketClass,
            selectedDay,
            passengers,
        } = req.body ?? {};

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

        // Retrieve the schedule from the database
        const schedule = await db.collection('schedules').findOne({
            id: parsedScheduleId,
        });

        if (!schedule) {
            return res.status(404).send('Schedule not found.');
        }

        // Validate selected operating day
        const normalizedDay = String(selectedDay).trim().toLowerCase();

        const scheduleDays = Array.isArray(schedule.daysOfWeek)
            ? schedule.daysOfWeek.map(day => String(day).trim().toLowerCase())
            : [];

        if (!scheduleDays.includes(normalizedDay)) {
            return res.status(400).send(
                'The selected day is not available for this schedule.'
            );
        }

        // Validate that the trip associated with the schedule exists
        const trip = await db.collection('trips').findOne({
            id: schedule.tripId,
        });

        if (!trip) {
            return res.status(404).send('Trip not found.');
        }

        // Create booking using trusted database values
        const booking = await createBooking({
            id: generateConfirmationCode(),
            userId: req.user.id,
            scheduleId: parsedScheduleId,
            tripId: schedule.tripId,
            ticketClass: String(ticketClass).trim().toLowerCase(),
            selectedDay: normalizedDay,
            passengers: Array.isArray(passengers) ? passengers : [],
        });

        return res.redirect(`/trips/confirmation/${booking.id}`);
    } catch (error) {
        if (error.name === 'ValidationError') {
            console.error('Invalid booking request:', error.message);

            return res
                .status(400)
                .send('Invalid booking request. Please check your details and try again.');
        }

        return next(error);
    }
};

const bookingConfirmationPage = async (req, res, next) => {
    try {
        const { confirmationId } = req.params;
        const booking = await getBookingById(confirmationId);

        if (!booking) {
            const notFoundError = new Error('Booking not found');
            notFoundError.status = 404;
            return next(notFoundError);
        }

        const isOwner = booking.userId === req.user.id;
        const isAdmin = req.user.role === 'admin';

        if (!isOwner && !isAdmin) {
            return res.status(403).render('errors/403', {
                title: 'Access Denied',
            });
        }

        return res.render('trips/confirm', {
            title: 'Trip Confirmation',
            confirmation: booking,
        });
    } catch (error) {
        return next(error);
    }
};

const bookingsAdminPage = (req, res) => {
    return res.render('bookings', {
        title: 'Bookings Admin',
    });
};

// Get bookings associated with the logged-in user.
const getMyBookings = async (req, res) => {
    try {
        const bookings = await getBookingsByPassengerEmail(
            req.user.email
        );

        return res.status(200).json(bookings);
    } catch (error) {
        console.error('Error retrieving user bookings:', error);

        return res.status(500).json({
            message: 'An error occurred while retrieving your bookings.',
        });
    }
};

export {
    getAllBookings,
    bookingPage,
    processBookingRequest,
    bookingConfirmationPage,
    bookingsAdminPage,
    getMyBookings,
};
