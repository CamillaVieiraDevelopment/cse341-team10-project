
import { beforeEach, describe, expect, test } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcrypt';
import app from '../app.js';
import Role from '../src/models/schemas/roles.js';
import User from '../src/models/schemas/users.js';
import Trip from '../src/models/schemas/trips.js';
import { getDb } from '../src/db/connect.js';

const password = 'TestPassword123!';

let adminAgent;
let customerAgent;

const createTestUsers = async () => {
    const adminRole = await Role.create({ name: 'admin' });
    const customerRole = await Role.create({ name: 'customer' });

    const passwordHash = await bcrypt.hash(password, 4);

    await User.create({
        name: 'Test Admin',
        email: 'admin@test.com',
        passwordHash,
        role: adminRole._id,
    });

    await User.create({
        name: 'Test Customer',
        email: 'customer@test.com',
        passwordHash,
        role: customerRole._id,
    });

    adminAgent = request.agent(app);
    customerAgent = request.agent(app);

    await adminAgent
        .post('/login')
        .send({
            email: 'admin@test.com',
            password,
        })
        .expect(302);

    await customerAgent
        .post('/login')
        .send({
            email: 'customer@test.com',
            password,
        })
        .expect(302);
};

beforeEach(async () => {
    await createTestUsers();
});

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

describe('PUT /api/trips/:id', () => {
    test('admin can update an existing trip', async () => {
        const response = await adminAgent
            .put('/api/trips/alpine-panorama')
            .send({
                name: 'Updated Alpine Express',
                distance: 200,
            });

        expect(response.status).toBe(200);
        expect(response.body.trip).toEqual(
            expect.objectContaining({
                id: 'alpine-panorama',
                name: 'Updated Alpine Express',
                distance: 200,
            })
        );

        const updatedTrip = await Trip.findOne({
            id: 'alpine-panorama',
        }).lean();

        expect(updatedTrip.name).toBe('Updated Alpine Express');
    });

    test('returns 404 when the trip does not exist', async () => {
        const response = await adminAgent
            .put('/api/trips/nonexistent-trip')
            .send({
                name: 'Updated Trip',
            });

        expect(response.status).toBe(404);
    });

    test('returns 400 when trip data is invalid', async () => {
        const response = await adminAgent
            .put('/api/trips/alpine-panorama')
            .send({
                distance: -10,
            });

        expect(response.status).toBe(400);
    });

    test('returns 400 when no valid fields are provided', async () => {
        const response = await adminAgent
            .put('/api/trips/alpine-panorama')
            .send({
                invalidField: 'value',
            });

        expect(response.status).toBe(400);
    });

    test('prevents customers from updating trips', async () => {
        const response = await customerAgent
            .put('/api/trips/alpine-panorama')
            .send({
                name: 'Unauthorized Update',
            });

        expect(response.status).toBe(403);
    });

    test('prevents unauthenticated users from updating trips', async () => {
        const response = await request(app)
            .put('/api/trips/alpine-panorama')
            .send({
                name: 'Unauthorized Update',
            });

        expect(response.status).toBe(401);
    });
});

describe('DELETE /api/trips/:id', () => {
    test('admin can delete a trip without associated schedules', async () => {
        await Trip.create({
            id: 'test-trip-delete',
            name: 'Test Trip',
            description: 'Temporary trip for deletion testing.',
            region: 'central',
            startStation: 'nagoya',
            endStation: 'toyama',
            duration: '2 hours',
            distance: 100,
            highlights: ['Test highlight'],
            bestSeason: 'spring',
            operatingMonths: [3, 4, 5],
        });

        const response = await adminAgent
            .delete('/api/trips/test-trip-delete');

        expect(response.status).toBe(200);

        const deletedTrip = await Trip.findOne({
            id: 'test-trip-delete',
        });

        expect(deletedTrip).toBeNull();
    });

    test('prevents deletion when the trip has booking confirmations but no schedules', async () => {
        await Trip.create({
            id: 'test-trip-confirmed',
            name: 'Confirmed Test Trip',
            description: 'Temporary trip for confirmation testing.',
            region: 'central',
            startStation: 'nagoya',
            endStation: 'toyama',
            duration: '2 hours',
            distance: 100,
            highlights: ['Test highlight'],
            bestSeason: 'spring',
            operatingMonths: [3, 4, 5],
        });

        await getDb().collection('confirmations').insertOne({
            id: 'test-confirmation',
            tripId: 'test-trip-confirmed',
        });

        const response = await adminAgent.delete(
            '/api/trips/test-trip-confirmed'
        );

        expect(response.status).toBe(409);

        const existingTrip = await Trip.findOne({
            id: 'test-trip-confirmed',
        });

        expect(existingTrip).not.toBeNull();
    });

    test('prevents deletion when the trip has associated schedules', async () => {
        const response = await adminAgent
            .delete('/api/trips/alpine-panorama');

        expect(response.status).toBe(409);

        const existingTrip = await Trip.findOne({
            id: 'alpine-panorama',
        });

        expect(existingTrip).not.toBeNull();
    });

    test('returns 404 when the trip does not exist', async () => {
        const response = await adminAgent
            .delete('/api/trips/nonexistent-trip');

        expect(response.status).toBe(404);
    });

    test('prevents customers from deleting trips', async () => {
        const response = await customerAgent
            .delete('/api/trips/alpine-panorama');

        expect(response.status).toBe(403);
    });

    test('prevents unauthenticated users from deleting trips', async () => {
        const response = await request(app)
            .delete('/api/trips/alpine-panorama');

        expect(response.status).toBe(401);
    });
});
