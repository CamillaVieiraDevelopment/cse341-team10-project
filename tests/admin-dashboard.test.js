
import { describe, expect, test } from 'vitest';
import request from 'supertest';

import app from '../app.js';
import Role from '../src/models/schemas/roles.js';
import { createUser } from '../src/models/users.js';

const createAccount = async ({
    name,
    username,
    email,
    roleName,
}) => {
    const role = await Role.findOne({
        name: roleName,
    });

    return createUser({
        name,
        username,
        email,
        password: 'password123',
        role: role._id,
    });
};

const loginAs = async (agent, email) => {
    return agent
        .post('/login')
        .send({
            email,
            password: 'password123',
        });
};

describe('GET /admin', () => {
    test('redirects an unauthenticated user to login', async () => {
        const response = await request(app)
            .get('/admin');

        expect(response.status).toBe(302);
        expect(response.headers.location).toBe('/login');
    });

    test('returns 403 when an authenticated customer accesses the dashboard', async () => {
        await createAccount({
            name: 'Test Customer',
            username: 'test_customer',
            email: 'customer@example.com',
            roleName: 'customer',
        });

        const agent = request.agent(app);

        const loginResponse = await loginAs(
            agent,
            'customer@example.com'
        );

        expect(loginResponse.status).toBe(302);

        const dashboardResponse = await agent.get('/admin');

        expect(dashboardResponse.status).toBe(403);
        expect(dashboardResponse.text).toContain(
            '403 - Access Denied'
        );
    });

    test('allows an authenticated administrator to access the dashboard', async () => {
        await createAccount({
            name: 'Test Administrator',
            username: 'test_admin',
            email: 'admin@example.com',
            roleName: 'admin',
        });

        const agent = request.agent(app);

        const loginResponse = await loginAs(
            agent,
            'admin@example.com'
        );

        expect(loginResponse.status).toBe(302);

        const dashboardResponse = await agent.get('/admin');

        expect(dashboardResponse.status).toBe(200);
        expect(dashboardResponse.text).toContain(
            'Admin Dashboard'
        );
        expect(dashboardResponse.text).toContain(
            'Welcome to the admin dashboard.'
        );
    });
});
