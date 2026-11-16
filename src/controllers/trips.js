
import {
    getAllTrips,
    getTripById,
    updateTrip,
    deleteTrip,
} from '../models/trips.js';
import { getDb } from '../db/connect.js';

// API Controllers

const getAllTripsHandler = async (req, res) => {
    try {
        const trips = await getAllTrips();

        return res.status(200).json(trips);
    } catch (error) {
        console.error('Error retrieving trips:', error);

        return res.status(500).json({
            message: 'An error occurred while retrieving trips.',
        });
    }
};

const getTripByIdHandler = async (req, res) => {
    try {
        const { id } = req.params;
        const trip = await getTripById(id);

        if (!trip) {
            return res.status(404).json({
                message: 'Trip not found.',
            });
        }

        return res.status(200).json(trip);
    } catch (error) {
        console.error('Error retrieving trip:', error);

        return res.status(500).json({
            message: 'An error occurred while retrieving the trip.',
        });
    }
};

const updateTripHandler = async (req, res) => {
    try {
        const { id } = req.params;

        if (
            !req.body ||
            typeof req.body !== 'object' ||
            Array.isArray(req.body)
        ) {
            return res.status(400).json({
                message: 'Invalid trip data.',
            });
        }

        const allowedFields = [
            'name',
            'description',
            'region',
            'startStation',
            'endStation',
            'duration',
            'distance',
            'highlights',
            'bestSeason',
            'operatingMonths',
            'imageUrl',
        ];

        const tripData = {};

        for (const field of allowedFields) {
            if (Object.hasOwn(req.body, field)) {
                tripData[field] = req.body[field];
            }
        }

        if (Object.keys(tripData).length === 0) {
            return res.status(400).json({
                message: 'At least one valid field must be provided.',
            });
        }

        const updatedTrip = await updateTrip(id, tripData);

        if (!updatedTrip) {
            return res.status(404).json({
                message: 'Trip not found.',
            });
        }

        return res.status(200).json({
            message: 'Trip updated successfully.',
            trip: updatedTrip,
        });
    } catch (error) {
        if (error.name === 'ValidationError' || error.name === 'CastError') {
            return res.status(400).json({
                message: 'Invalid trip data.',
                error: error.message,
            });
        }

        console.error('Error updating trip:', error);

        return res.status(500).json({
            message: 'An error occurred while updating the trip.',
        });
    }
};

const deleteTripHandler = async (req, res) => {
    try {
        const { id } = req.params;

        const trip = await getTripById(id);

        if (!trip) {
            return res.status(404).json({
                message: 'Trip not found.',
            });
        }

        const db = getDb();

        const associatedSchedules = await db
            .collection('schedules')
            .findOne({ tripId: id });

        if (associatedSchedules) {
            return res.status(409).json({
                message: 'This trip cannot be deleted because it has associated schedules.',
            });
        }

        const associatedConfirmations = await db
            .collection('confirmations')
            .findOne({ tripId: id });

        if (associatedConfirmations) {
            return res.status(409).json({
                message: 'This trip cannot be deleted because it has associated confirmations.',
            });
        }

        const deletedTrip = await deleteTrip(id);

        if (!deletedTrip) {
            return res.status(404).json({
                message: 'Trip not found.',
            });
        }

        return res.status(200).json({
            message: 'Trip deleted successfully.',
            trip: deletedTrip,
        });
    } catch (error) {
        console.error('Error deleting trip:', error);

        return res.status(500).json({
            message: 'An error occurred while deleting the trip.',
        });
    }
};

// EJS Controllers

const getTripsListPage = (req, res) => {
    res.render('trips/list', {
        title: 'Scenic Train Trips',
    });
};

const getTripDetailsPage = (req, res) => {
    res.render('trips/details', {
        title: 'Trip Details',
    });
};

export {
    getAllTripsHandler,
    getTripByIdHandler,
    updateTripHandler,
    deleteTripHandler,
    getTripsListPage,
    getTripDetailsPage,
};
