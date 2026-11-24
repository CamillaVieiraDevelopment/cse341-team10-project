import { getDb } from '../db/connect.js';
import { generateConfirmationCode } from '../includes/helpers.js';
import {
    createBooking,
    deleteBooking,
    getAllBookings as findAllBookings,
    getBookingById,
    getBookingsByPassengerEmail as findBookingsByPassengerEmail,
    updateBooking,
} from '../models/bookings.js';

// Access helpers

const isAdmin = (user) => {
    return user.role === 'admin';
};

const isPassengerOnBooking = (booking, user) => {
    if (!user.email) {
        return false;
    }

    const userEmail = user.email.toLowerCase();

    return (booking.passengers ?? []).some((passenger) => {
        return passenger.email?.toLowerCase() === userEmail;
    });
};

const canManageBooking = (booking, user) => {
    return isAdmin(user) || isPassengerOnBooking(booking, user);
};

const findBookingsForUser = async (user) => {
    if (isAdmin(user)) {
        return findAllBookings();
    }

    if (!user.email) {
        return [];
    }

    return findBookingsByPassengerEmail(user.email);
};

// API Controllers

const getAllBookings = async (req, res) => {
    try {
        const bookings = await findBookingsForUser(req.user);

        return res.status(200).json(bookings);
    } catch (error) {
        console.error('Error retrieving bookings:', error);

        return res.status(500).json({
            message: 'An error occurred while retrieving bookings.',
        });
    }
};

const updateBookingHandler = async (req, res) => {
    const requestedId = req.params.id;

    try {
        const existingBooking = await getBookingById(requestedId);

        if (!existingBooking) {
            return res.status(404).json({ message: 'Booking not found.' });
        }

        if (!canManageBooking(existingBooking, req.user)) {
            return res.status(403).json({
                message: 'You do not have permission to change this booking.',
            });
        }

        const { ticketClass, selectedDay, passengers } = req.body ?? {};

        if (!ticketClass || !selectedDay || !Array.isArray(passengers)) {
            return res.status(400).json({
                message: 'Missing or invalid booking fields.',
            });
        }

        const updatedBooking = await updateBooking(requestedId, {
            ticketClass,
            selectedDay,
            passengers,
        });

        if (!updatedBooking) {
            return res.status(404).json({ message: 'Booking not found.' });
        }

        return res.status(200).json(updatedBooking);
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                message: 'Missing or invalid booking fields.',
            });
        }

        console.error('Error updating booking:', error);

        return res.status(500).json({
            message: 'An error occurred while updating the booking.',
        });
    }
};

const deleteBookingHandler = async (req, res) => {
    const requestedId = req.params.id;

    try {
        const existingBooking = await getBookingById(requestedId);

        if (!existingBooking) {
            return res.status(404).json({ message: 'Booking not found.' });
        }

        if (!canManageBooking(existingBooking, req.user)) {
            return res.status(403).json({
                message: 'You do not have permission to change this booking.',
            });
        }

        await deleteBooking(requestedId);

        return res.status(204).send();
    } catch (error) {
        console.error('Error deleting booking:', error);

        return res.status(500).json({
            message: 'An error occurred while deleting the booking.',
        });
    }
};

// EJS Controllers

const bookingPage = async (req, res) => {
    const { scheduleId } = req.params;

    const db = getDb();
    const schedule = await db.collection('schedules').findOne({ id: Number(scheduleId) });
    const trip = await db.collection('trips').findOne({ id: schedule.tripId });
    const ticketClasses = await db.collection('ticketClasses').find({}).toArray();
    const ticketOptions = ticketClasses.map((ticketClass) => ({
        class: ticketClass.class,
        name: ticketClass.name,
        price: trip.distance * ticketClass.pricePerKm,
        amenities: ticketClass.amenities,
        description: ticketClass.description
    }));

    res.render('trips/book', {
        title: 'Book Trip',
        schedule,
        ticketOptions
    });
};

const processBookingRequest = async (req, res, next) => {
    try {
        const { scheduleId, tripId, ticketClass, selectedDay, passengers } = req.body ?? {};

        const booking = await createBooking({
            id: generateConfirmationCode(),
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
    updateBookingHandler,
    deleteBookingHandler,
    bookingPage,
    processBookingRequest,
    bookingConfirmationPage,
    bookingsAdminPage,
};