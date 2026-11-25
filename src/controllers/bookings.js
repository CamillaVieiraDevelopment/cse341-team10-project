import { getDb } from '../db/connect.js';
import { generateConfirmationCode } from '../includes/helpers.js';
import {
    createBooking,
    getAllBookings as findAllBookings,
    getBookingById,
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
            tripId,
            ticketClass,
            selectedDay,
            passengers,
        } = req.body ?? {};

        const booking = await createBooking({
            id: generateConfirmationCode(),
            userId: req.user.id,
            scheduleId,
            tripId,
            ticketClass,
            selectedDay,
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

export {
    getAllBookings,
    bookingPage,
    processBookingRequest,
    bookingConfirmationPage,
    bookingsAdminPage,
};
