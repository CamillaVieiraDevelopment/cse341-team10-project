
import { getAllTrips, getTripById } from '../models/trips.js';
import { getDb } from '../db/connect.js';

// API Controllers

const getAllTripsHandler = async (req, res) => {
    try {
        const { page = '1', limit = '10' } = req.query;

        const isValidPositiveInteger = (value) =>
            typeof value === 'string' &&
            /^\d+$/.test(value) &&
            Number.isSafeInteger(Number(value)) &&
            Number(value) > 0;

        if (!isValidPositiveInteger(page) || !isValidPositiveInteger(limit)) {
            return res.status(400).json({
                message: 'Page and limit must be positive integers.'
            });
        }

        const currentPage = Number(page);
        const pageSize = Number(limit);

        if (pageSize > 50) {
            return res.status(400).json({
                message: 'Limit cannot exceed 50.'
            });
        }

        const result = await getAllTrips({
            page: currentPage,
            limit: pageSize
        });

        return res.status(200).json(result);
    } catch (error) {
        console.error('Error retrieving trips:', error);

        return res.status(500).json({
            message: 'An error occurred while retrieving trips.'
        });
    }
};

const getTripByIdHandler = async (req, res) => {
    try {
        const { id } = req.params;
        const trip = await getTripById(id);

        if (!trip) {
            return res.status(404).json({
                message: 'Trip not found.'
            });
        }

        return res.status(200).json(trip);
    } catch (error) {
        console.error('Error retrieving trip:', error);

        return res.status(500).json({
            message: 'An error occurred while retrieving the trip.'
        });
    }
};

const getTripSchedulesHandler = async (req, res) => {
    try {
        const { id } = req.params;
        const db = getDb();

        const schedules = await db.collection('schedules')
            .find({ tripId: id, status: true })
            .sort({ departureTime: 1 })
            .toArray();

        return res.status(200).json(schedules);
    } catch (error) {
        console.error('Error retrieving trip schedules:', error);

        return res.status(500).json({
            message: 'An error occurred while retrieving trip schedules.'
        });
    }
};

// EJS Controllers

const getTripsListPage = (req, res) => {
    res.render('trips/list', {
        title: 'Scenic Train Trips'
    });
};

const getTripDetailsPage = (req, res) => {
    res.render('trips/details', {
        title: 'Trip Details'
    });
};

export {
    getAllTripsHandler,
    getTripByIdHandler,
    getTripSchedulesHandler,
    getTripsListPage,
    getTripDetailsPage
};
