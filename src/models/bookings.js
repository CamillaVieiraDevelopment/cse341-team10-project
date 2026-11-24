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
export async function getBookingsByPassengerEmail(email) {
  return booking
    .find({ "passengers.email": email })
    .collation({ locale: "en", strength: 2 })
    .sort({ createdAt: -1 })
    .lean();
}

export async function updateBooking(id, updates) {
  const existingBooking = await booking.findOne({ id });

  if (!existingBooking) {
    return null;
  }

  existingBooking.set(updates);
  await existingBooking.save();

  return existingBooking.toObject();
}

export async function deleteBooking(id) {
  const result = await booking.deleteOne({ id });

  return result.deletedCount === 1;
}