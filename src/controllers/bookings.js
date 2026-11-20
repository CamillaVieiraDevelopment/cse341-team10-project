import { getDb } from "../db/connect.js";
import { generateConfirmationCode } from "../includes/helpers.js";
import {
  createBooking as createBookingInDb,
  getAllBookings as findAllBookings,
  getBookingById as findBookingById,
} from "../models/bookings.js";

// API controller: sends JSON
export async function getAllBookings(req, res) {
  try {
    const bookings = await findAllBookings();

    return res.status(200).json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);

    return res.status(500).json({
      error: "Failed to fetch bookings",
    });
  }
}

// EJS controllers: render pages
export async function bookingPage(req, res) {
  const { scheduleId } = req.params;

  const db = getDb();
  const schedule = await db.collection("schedules").findOne({ id: Number(scheduleId) });
  const trip = await db.collection("trips").findOne({ id: schedule.tripId });
  const ticketClasses = await db.collection("ticketClasses").find({}).toArray();
  const ticketOptions = ticketClasses.map((ticketClass) => ({
    class: ticketClass.class,
    name: ticketClass.name,
    price: trip.distance * ticketClass.pricePerKm,
    amenities: ticketClass.amenities,
    description: ticketClass.description,
  }));

  res.render("trips/book", {
    title: "Book Trip",
    schedule,
    ticketOptions,
  });
}

export async function processBookingRequest(req, res) {
  try {
    const { scheduleId, tripId, ticketClass, selectedDay, passengers } = req.body ?? {};

    const createdBooking = await createBookingInDb({
      id: generateConfirmationCode(),
      scheduleId,
      tripId,
      ticketClass,
      selectedDay,
      passengers: Array.isArray(passengers) ? passengers : [],
    });

    return res.redirect(`/trips/confirmation/${createdBooking.id}`);
  } catch (error) {
    if (error.name === "ValidationError") {
      console.error("Invalid booking request:", error.message);

      return res.status(400).send("Invalid booking request. Please check your details and try again.");
    }

    console.error("Error creating booking:", error);

    return res.status(500).send("Failed to create booking");
  }
}

export async function bookingConfirmationPage(req, res) {
  try {
    const { confirmationId } = req.params;
    const booking = await findBookingById(confirmationId);

    if (!booking) {
      return res.status(404).send("Booking not found");
    }

    return res.render("trips/confirm", {
      title: "Trip Confirmation",
      confirmation: booking,
    });
  } catch (error) {
    console.error("Error fetching booking:", error);

    return res.status(500).send("Failed to load booking");
  }
}

export async function bookingsAdminPage(req, res) {
  return res.render("bookings", {
    title: "Bookings Admin",
  });
}