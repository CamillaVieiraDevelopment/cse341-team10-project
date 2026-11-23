import booking from "./schemas/bookings.js";

export async function createBooking(bookingData) {
  const createdBooking = await booking.create(bookingData);

  return createdBooking.toObject();
}

export async function getAllBookings() {
  return booking.find({}).sort({ createdAt: -1 }).lean();
}

export async function getBookingById(id) {
  return booking.findOne({ id }).lean();
}