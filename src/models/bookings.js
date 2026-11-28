
import booking from './schemas/bookings.js';

export async function createBooking(bookingData) {
    return booking.create(bookingData);
}

export async function getAllBookings() {
    return booking.find().sort({ createdAt: -1 }).lean();
}

export async function getBookingById(id) {
    return booking.findOne({ id }).lean();
}

export async function getBookingsByPassengerEmail(email) {
    return booking
        .find({
            'passengers.email': email.toLowerCase().trim(),
        })
        .sort({ createdAt: -1 })
        .lean();
}