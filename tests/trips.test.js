
import { describe, expect, test } from 'vitest';
import request from 'supertest';
import app from '../app.js';

describe('GET /api/trips', () => {
    test('returns a successful JSON response with an array of trips', async () => {
        const response = await request(app).get('/api/trips');

        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toContain('application/json');
        expect(response.body).toBeInstanceOf(Array);
    });

    test('returns a specific trip by id', async () => {
        const response = await request(app).get('/api/trips/alpine-panorama');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(
            expect.objectContaining({
                id: 'alpine-panorama',
            })
        );
    });

    test('returns 404 when the trip does not exist', async () => {
        const response = await request(app).get('/api/trips/nonexistent-trip');

        expect(response.status).toBe(404);
        expect(response.body).toEqual({
            message: 'Trip not found.',
        });
    });
});
