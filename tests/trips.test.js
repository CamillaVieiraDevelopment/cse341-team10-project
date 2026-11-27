
import { describe, expect, test } from 'vitest';
import request from 'supertest';
import app from '../app.js';

describe('GET /api/trips', () => {
    test('returns a successful response with default pagination', async () => {
        const response = await request(app).get('/api/trips');

        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toContain('application/json');

        expect(response.body).toHaveProperty('trips');
        expect(response.body).toHaveProperty('pagination');

        expect(response.body.trips).toBeInstanceOf(Array);
        expect(response.body.trips.length).toBeLessThanOrEqual(10);

        expect(response.body.pagination).toEqual(
            expect.objectContaining({
                currentPage: 1,
                pageSize: 10,
                totalItems: expect.any(Number),
                totalPages: expect.any(Number)
            })
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
                pageSize: 2
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
