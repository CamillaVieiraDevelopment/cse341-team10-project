
import { describe, expect, test } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import Role from '../src/models/schemas/roles.js';
import User from '../src/models/schemas/users.js';
import { createUser } from '../src/models/users.js';

const createCustomer = async ({
    name = 'Test User',
    username = 'test_user',
    email = 'test@example.com',
    password = 'password123',
} = {}) => {
    const customerRole = await Role.findOne({
        name: 'customer',
    });

    return createUser({
        name,
        username,
        email,
        password,
        role: customerRole._id,
    });
};

describe('Authentication pages', () => {
    test('GET /register displays the registration form', async () => {
        const response = await request(app).get('/register');

        expect(response.status).toBe(200);
        expect(response.text).toContain('Create Your Account');
        expect(response.text).toContain('name="username"');
        expect(response.text).toContain('name="email"');
        expect(response.text).toContain('name="password"');
    });

    test('GET /login displays the login form', async () => {
        const response = await request(app).get('/login');

        expect(response.status).toBe(200);
        expect(response.text).toContain('Welcome Back');
        expect(response.text).toContain('name="email"');
        expect(response.text).toContain('name="password"');
    });
});

describe('POST /register', () => {
    const validRegistration = {
        name: 'New User',
        username: 'new_user',
        email: 'new@example.com',
        password: 'password123',
    };

    test('registers a new customer and redirects to login', async () => {
        const response = await request(app)
            .post('/register')
            .send(validRegistration);

        expect(response.status).toBe(302);
        expect(response.headers.location).toBe('/login?registered=true');

        const user = await User.findOne({
            email: 'new@example.com',
        }).populate('role');

        expect(user).not.toBeNull();
        expect(user.username).toBe('new_user');
        expect(user.role.name).toBe('customer');
        expect(user.passwordHash).not.toBe(validRegistration.password);
    });

    test('rejects registration when a required field is missing', async () => {
        const response = await request(app)
            .post('/register')
            .send({
                name: 'New User',
                email: 'new@example.com',
                password: 'password123',
            });

        expect(response.status).toBe(400);
        expect(response.text).toContain('All fields are required.');
    });

    test('rejects registration when name is not a string', async () => {
        const response = await request(app)
            .post('/register')
            .send({
                ...validRegistration,
                name: { invalid: true },
            });

        expect(response.status).toBe(400);
        expect(response.text).toContain('All fields are required.');
    });

    test('rejects registration when username is not a string', async () => {
        const response = await request(app)
            .post('/register')
            .send({
                ...validRegistration,
                username: ['invalid'],
            });

        expect(response.status).toBe(400);
        expect(response.text).toContain('All fields are required.');
    });

    test('rejects registration when password is not a string', async () => {
        const response = await request(app)
            .post('/register')
            .send({
                ...validRegistration,
                password: { invalid: true },
            });

        expect(response.status).toBe(400);
        expect(response.text).toContain('All fields are required.');
    });

    test('rejects usernames outside the allowed format', async () => {
        const response = await request(app)
            .post('/register')
            .send({
                ...validRegistration,
                username: 'new user!',
            });

        expect(response.status).toBe(400);
        expect(response.text).toContain(
            'Username must contain 3 to 30 characters'
        );
    });

    test('rejects passwords shorter than eight characters', async () => {
        const response = await request(app)
            .post('/register')
            .send({
                ...validRegistration,
                password: 'short',
            });

        expect(response.status).toBe(400);
        expect(response.text).toContain(
            'Password must contain at least 8 characters.'
        );
    });

    test('rejects an email that is already registered', async () => {
        await createCustomer();

        const response = await request(app)
            .post('/register')
            .send({
                ...validRegistration,
                username: 'another_user',
                email: 'test@example.com',
            });

        expect(response.status).toBe(409);
        expect(response.text).toContain(
            'An account with this email already exists.'
        );
    });

    test('rejects a username that is already registered', async () => {
        await createCustomer();

        const response = await request(app)
            .post('/register')
            .send({
                ...validRegistration,
                username: 'test_user',
                email: 'another@example.com',
            });

        expect(response.status).toBe(409);
        expect(response.text).toContain(
            'This username is already taken.'
        );
    });
});

describe('POST /login', () => {
    test('logs in a user with valid credentials and maintains the session', async () => {
        await createCustomer();

        const agent = request.agent(app);

        const loginResponse = await agent
            .post('/login')
            .send({
                email: 'test@example.com',
                password: 'password123',
            });

        expect(loginResponse.status).toBe(302);
        expect(loginResponse.headers.location).toBe('/');
        expect(loginResponse.headers['set-cookie']).toBeDefined();

        const homeResponse = await agent.get('/');

        expect(homeResponse.status).toBe(200);
        expect(homeResponse.text).toContain('Welcome, Test User');

        const loginPageResponse = await agent.get('/login');

        expect(loginPageResponse.status).toBe(302);
        expect(loginPageResponse.headers.location).toBe('/');
    });

    test('rejects an incorrect password', async () => {
        await createCustomer();

        const response = await request(app)
            .post('/login')
            .send({
                email: 'test@example.com',
                password: 'incorrect123',
            });

        expect(response.status).toBe(401);
        expect(response.text).toContain('Invalid email or password.');
    });

    test('rejects an email that does not exist', async () => {
        const response = await request(app)
            .post('/login')
            .send({
                email: 'unknown@example.com',
                password: 'password123',
            });

        expect(response.status).toBe(401);
        expect(response.text).toContain('Invalid email or password.');
    });

    test('rejects login when credentials are missing', async () => {
        const response = await request(app)
            .post('/login')
            .send({
                email: 'test@example.com',
            });

        expect(response.status).toBe(400);
        expect(response.text).toContain(
            'Email and password are required.'
        );
    });

    test('rejects login when email is not a string', async () => {
        const response = await request(app)
            .post('/login')
            .send({
                email: { invalid: true },
                password: 'password123',
            });

        expect(response.status).toBe(400);
        expect(response.text).toContain(
            'Email and password are required.'
        );
    });

    test('rejects login when password is not a string', async () => {
        const response = await request(app)
            .post('/login')
            .send({
                email: 'test@example.com',
                password: { invalid: true },
            });

        expect(response.status).toBe(400);
        expect(response.text).toContain(
            'Email and password are required.'
        );
    });
});

describe('POST /logout', () => {
    test('destroys the session and redirects to login', async () => {
        await createCustomer();

        const agent = request.agent(app);

        const loginResponse = await agent
            .post('/login')
            .send({
                email: 'test@example.com',
                password: 'password123',
            });

        expect(loginResponse.status).toBe(302);
        expect(loginResponse.headers.location).toBe('/');

        const homeResponse = await agent.get('/');

        expect(homeResponse.text).toContain('Welcome, Test User');

        const logoutResponse = await agent.post('/logout');

        expect(logoutResponse.status).toBe(302);
        expect(logoutResponse.headers.location).toBe(
            '/login?loggedOut=true'
        );

        const loginPageResponse = await agent.get(
            logoutResponse.headers.location
        );

        expect(loginPageResponse.status).toBe(200);
        expect(loginPageResponse.text).toContain(
            'You have been logged out.'
        );

        expect(loginPageResponse.text).not.toContain(
            'Welcome, Test User'
        );
    });

    test('requires authentication before logout', async () => {
        const response = await request(app).post('/logout');

        expect(response.status).toBe(302);
        expect(response.headers.location).toBe('/login');
    });
});
