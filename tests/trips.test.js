
import { describe, expect, test } from 'vitest';
import request from 'supertest';
import app from '../app.js';

describe('GET /api/trips', () => {
    test('returns a successful response with default pagination', async () => {
        const response = await request(app).get('/api/trips');

        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toContain('application/json');

        expect(response.body).toHaveProperty('trips');
        expect(response.body).toHaveProperty('filters');
        expect(response.body).toHaveProperty('availableFilters');
        expect(response.body).toHaveProperty('pagination');

        expect(response.body.trips).toBeInstanceOf(Array);
        expect(response.body.trips.length).toBeLessThanOrEqual(10);

        expect(response.body.pagination).toEqual(
            expect.objectContaining({
                currentPage: 1,
                pageSize: 10,
                totalItems: 6,
                totalPages: 1
            })
        );

        expect(response.body.availableFilters.regions).toEqual(
            ['central', 'hokkaido', 'kansai', 'northern']
        );

        expect(response.body.availableFilters.seasons).toEqual(
            ['autumn', 'spring', 'summer', 'winter']
        );
    });

    test('returns the requested number of trips per page', async () => {
        const response = await request(app)
            .get('/api/trips?page=1&limit=2');

        expect(response.status).toBe(200);
        expect(response.body.trips).toHaveLength(2);

        expect(response.body.pagination).toEqual(
            expect.objectContaining({
                currentPage: 1,
                pageSize: 2,
                totalItems: 6,
                totalPages: 3
            })
        );
    });

    test('returns different trips when navigating between pages', async () => {
        const firstPage = await request(app)
            .get('/api/trips?page=1&limit=2');

        const secondPage = await request(app)
            .get('/api/trips?page=2&limit=2');

        expect(firstPage.status).toBe(200);
        expect(secondPage.status).toBe(200);

        const firstPageIds = firstPage.body.trips.map((trip) => trip.id);
        const secondPageIds = secondPage.body.trips.map((trip) => trip.id);

        expect(firstPageIds).not.toEqual(secondPageIds);

        expect(firstPage.body.pagination.currentPage).toBe(1);
        expect(secondPage.body.pagination.currentPage).toBe(2);
    });

    test('returns an empty array for a valid page with no results', async () => {
        const response = await request(app)
            .get('/api/trips?page=9999&limit=10');

        expect(response.status).toBe(200);
        expect(response.body.trips).toEqual([]);
        expect(response.body.pagination.currentPage).toBe(9999);
    });

    test('filters trips by region', async () => {
        const response = await request(app)
            .get('/api/trips?region=central');

        expect(response.status).toBe(200);
        expect(response.body.trips).toHaveLength(2);
        expect(response.body.pagination.totalItems).toBe(2);
        expect(response.body.filters.region).toBe('central');

        expect(
            response.body.trips.every((trip) => trip.region === 'central')
        ).toBe(true);
    });

    test('filters trips by season', async () => {
        const response = await request(app)
            .get('/api/trips?season=autumn');

        expect(response.status).toBe(200);
        expect(response.body.trips).toHaveLength(3);
        expect(response.body.pagination.totalItems).toBe(3);
        expect(response.body.filters.season).toBe('autumn');

        expect(
            response.body.trips.every((trip) => trip.bestSeason === 'autumn')
        ).toBe(true);
    });

    test('searches trip names and descriptions', async () => {
        const response = await request(app)
            .get('/api/trips?search=mountain');

        expect(response.status).toBe(200);
        expect(response.body.trips.length).toBeGreaterThan(0);

        const matchingTrips = response.body.trips.every((trip) =>
            /mountain/i.test(trip.name) ||
            /mountain/i.test(trip.description)
        );

        expect(matchingTrips).toBe(true);
        expect(response.body.filters.search).toBe('mountain');
    });

    test('performs case-insensitive keyword searches', async () => {
        const response = await request(app)
            .get('/api/trips?search=CHERRY');

        expect(response.status).toBe(200);
        expect(response.body.trips).toHaveLength(1);
        expect(response.body.trips[0].id).toBe('sakura-valley');
    });

    test('combines region and season filters', async () => {
        const response = await request(app)
            .get('/api/trips?region=central&season=autumn');

        expect(response.status).toBe(200);
        expect(response.body.trips).toHaveLength(2);
        expect(response.body.pagination.totalItems).toBe(2);

        expect(
            response.body.trips.every((trip) =>
                trip.region === 'central' &&
                trip.bestSeason === 'autumn'
            )
        ).toBe(true);
    });

    test('combines search, region, season, and pagination', async () => {
        const response = await request(app)
            .get('/api/trips?page=1&limit=1&region=central&season=autumn&search=alps');

        expect(response.status).toBe(200);
        expect(response.body.trips).toHaveLength(1);
        expect(response.body.trips[0].id).toBe('alpine-panorama');

        expect(response.body.filters).toEqual({
            region: 'central',
            season: 'autumn',
            search: 'alps'
        });

        expect(response.body.pagination).toEqual(
            expect.objectContaining({
                currentPage: 1,
                pageSize: 1,
                totalItems: 2,
                totalPages: 2
            })
        );
    });

    test('returns an empty array when no trips match the filters', async () => {
        const response = await request(app)
            .get('/api/trips?region=hokkaido&season=summer');

        expect(response.status).toBe(200);
        expect(response.body.trips).toEqual([]);
        expect(response.body.pagination.totalItems).toBe(0);
        expect(response.body.pagination.totalPages).toBe(0);
    });

    test('returns an empty array when the search has no matches', async () => {
        const response = await request(app)
            .get('/api/trips?search=nonexistentkeyword');

        expect(response.status).toBe(200);
        expect(response.body.trips).toEqual([]);
        expect(response.body.pagination.totalItems).toBe(0);
    });

    test('handles special regex characters safely in search', async () => {
        const response = await request(app)
            .get('/api/trips?search=%5B');

        expect(response.status).toBe(200);
        expect(response.body.trips).toEqual([]);
        expect(response.body.pagination.totalItems).toBe(0);
    });

    test('filters are case-insensitive', async () => {
        const response = await request(app)
            .get('/api/trips?region=CENTRAL&season=AUTUMN');

        expect(response.status).toBe(200);
        expect(response.body.trips).toHaveLength(2);
    });

    test.each([
        ['page=0'],
        ['page=-1'],
        ['page=1.5'],
        ['page=abc'],
        ['limit=0'],
        ['limit=-1'],
        ['limit=1.5'],
        ['limit=abc'],
        ['limit=51']
    ])('returns 400 for invalid pagination parameter: %s', async (query) => {
        const response = await request(app)
            .get(`/api/trips?${query}`);

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('message');
    });

    test.each([
        ['region=' + 'a'.repeat(51)],
        ['season=' + 'a'.repeat(51)],
        ['search=' + 'a'.repeat(101)]
    ])('returns 400 for oversized filter or search parameter: %s', async (query) => {
        const response = await request(app)
            .get(`/api/trips?${query}`);

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('message');
    });

    test('returns 400 when a filter parameter is repeated', async () => {
        const response = await request(app)
            .get('/api/trips?region=central&region=northern');

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('message');
    });
});

describe('GET /api/trips/:id', () => {
    test('returns a specific trip by id', async () => {
        const response = await request(app)
            .get('/api/trips/alpine-panorama');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(
            expect.objectContaining({
                id: 'alpine-panorama'
            })
        );
    });

    test('returns 404 when the trip does not exist', async () => {
        const response = await request(app)
            .get('/api/trips/nonexistent-trip');

        expect(response.status).toBe(404);
        expect(response.body).toEqual({
            message: 'Trip not found.'
        });
    });
});
