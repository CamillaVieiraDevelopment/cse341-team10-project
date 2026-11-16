
import Trip from './schemas/trips.js';

const getAllTrips = async () => {
    return Trip.find({}).lean();
};

const getTripById = async (id) => {
    return Trip.findOne({ id }).lean();
};

const updateTrip = async (id, tripData) => {
    return Trip.findOneAndUpdate(
        { id },
        { $set: tripData },
        {
            returnDocument: 'after',
            runValidators: true,
        }
    ).lean();
};

const deleteTrip = async (id) => {
    return Trip.findOneAndDelete({ id }).lean();
};

export {
    getAllTrips,
    getTripById,
    updateTrip,
    deleteTrip,
};
