import Trip from './schemas/trips.js';

const escapeRegex = (value) =>
    value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getAllTrips = async ({
    page = 1,
    limit = 10,
    region = '',
    season = '',
    search = ''
} = {}) => {
    const skip = (page - 1) * limit;

    const filters = {};

    if (region) {
        filters.region = {
            $regex: `^${escapeRegex(region)}$`,
            $options: 'i'
        };
    }

    if (season) {
        filters.bestSeason = {
            $regex: `^${escapeRegex(season)}$`,
            $options: 'i'
        };
    }

    if (search) {
        const searchRegex = {
            $regex: escapeRegex(search),
            $options: 'i'
        };

        filters.$or = [
            { name: searchRegex },
            { description: searchRegex }
        ];
    }

    const [trips, totalItems, regions, seasons] = await Promise.all([
        Trip.find(filters)
            .sort({ name: 1 })
            .skip(skip)
            .limit(limit)
            .lean(),

        Trip.countDocuments(filters),

        Trip.distinct('region'),

        Trip.distinct('bestSeason')
    ]);

    return {
        trips,
        filters: {
            region: region || null,
            season: season || null,
            search: search || ''
        },
        availableFilters: {
            regions: regions.sort(),
            seasons: seasons.sort()
        },
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