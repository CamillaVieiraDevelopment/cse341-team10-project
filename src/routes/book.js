
import { getDb } from '../db/connect.js';
import { generateConfirmationCode } from '../includes/helpers.js';
import {
    getTicketClassesForDay
} from '../models/ticket-classes.js';

const bookingPage = async (req, res) => {
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

        if (!Array.isArray(schedule.daysOfWeek) || schedule.daysOfWeek.length === 0) {
            return res.status(400).send('Schedule has no available days');
        }

        const firstDay = schedule.daysOfWeek[0].toLowerCase();
        const ticketClasses = await getTicketClassesForDay(firstDay);

        const ticketOptions = ticketClasses.map((ticketClass) => ({
            class: ticketClass.class,
            name: ticketClass.name,
            price: trip.distance * ticketClass.pricePerKm,
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
        return res.status(500).send('Unable to load booking page');
    }
};

const processBookingRequest = async (req, res) => {
    try {
        const { scheduleId, selectedDay, ticketClass, passengers } = req.body;
        const db = getDb();

        const schedule = await db.collection('schedules').findOne({
            id: Number(scheduleId)
        });

        if (!schedule) {
            return res.status(404).send('Schedule not found');
        }

        const normalizedDay = String(selectedDay || '').trim().toLowerCase();

        const scheduleDays = (schedule.daysOfWeek || []).map((day) =>
            day.toLowerCase()
        );

        if (!scheduleDays.includes(normalizedDay)) {
            return res.status(400).send('Selected day is not available for this schedule');
        }

        const ticketClasses = await getTicketClassesForDay(normalizedDay);

        const selectedTicket = ticketClasses.find(
            (ticket) => ticket.class === ticketClass && ticket.available
        );

        if (!selectedTicket) {
            return res.status(400).send('Selected ticket class is not available on this day');
        }

        if (!Array.isArray(passengers) || passengers.length < 1 || passengers.length > 8) {
            return res.status(400).send('You must provide between 1 and 8 passengers');
        }

        const trip = await db.collection('trips').findOne({
            id: schedule.tripId
        });

        if (!trip) {
            return res.status(404).send('Trip not found');
        }

        const pricePerTicket = trip.distance * selectedTicket.pricePerKm;
        const confirmation = {
            id: generateConfirmationCode(),
            createdAt: new Date().toISOString(),
            scheduleId: schedule.id,
            tripId: trip.id,
            ticketClass: selectedTicket.class,
            selectedDay: normalizedDay,
            passengers,
            pricePerTicket,
            totalAmount: pricePerTicket * passengers.length
        };

        await db.collection('confirmations').insertOne(confirmation);

        return res.redirect(`/trips/confirmation/${confirmation.id}`);
    } catch (error) {
        console.error('Error processing booking:', error);
        return res.status(500).send('Unable to process booking');
    }
};

export { bookingPage, processBookingRequest };
