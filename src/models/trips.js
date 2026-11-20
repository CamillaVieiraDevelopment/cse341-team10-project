
import Trip from './schemas/trips.js';

const getAllTrips = async () => {
    return Trip.find({}).lean();
};

const getTripById = async (id) => {
    return Trip.findOne({ id }).lean();
};

export { getAllTrips, getTripById };
