
import Trip from './schemas/trips.js';

const getAllTrips = async ({ page = 1, limit = 10 } = {}) => {
    const skip = (page - 1) * limit;

    const [trips, totalItems] = await Promise.all([
        Trip.find({})
            .sort({ name: 1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        Trip.countDocuments({})
    ]);

    return {
        trips,
        pagination: {
            currentPage: page,
            pageSize: limit,
            totalItems,
            totalPages: Math.ceil(totalItems / limit)
        }
    };
};

const getTripById = async (id) => {
    return Trip.findOne({ id }).lean();
};

export { getAllTrips, getTripById };
