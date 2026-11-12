
import { getAllTrips, getTripById } from '../models/trips.js';

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
    getTripsListPage,
    getTripDetailsPage,
};
