
import { describe, expect, test } from 'vitest';
import Role from '../src/models/schemas/roles.js';
import User from '../src/models/schemas/users.js';
import {
    createUser,
    verifyPassword,
} from '../src/models/users.js';
import { seedRoles } from '../src/db/seed-roles.js';

describe('Authentication models', () => {
    describe('Default roles', () => {
        test('creates customer and admin roles', async () => {
            const roles = await Role.find().sort({ name: 1 });

            expect(roles.map((role) => role.name)).toEqual([
                'admin',
                'customer',
            ]);
        });

        test('does not create duplicate roles when seeded more than once', async () => {
            await seedRoles();
            await seedRoles();

            const roleCount = await Role.countDocuments();

            expect(roleCount).toBe(2);
        });
    });

    describe('User model', () => {
        test('creates a user with a normalized username and email', async () => {
            const customerRole = await Role.findOne({
                name: 'customer',
            });

            const user = await createUser({
                name: ' Test User ',
                username: ' Test_User ',
                email: ' TEST@EXAMPLE.COM ',
                password: 'password123',
                role: customerRole._id,
            });

            expect(user.name).toBe('Test User');
            expect(user.username).toBe('test_user');
            expect(user.email).toBe('test@example.com');
            expect(user.passwordHash).not.toBe('password123');
            expect(user.role.toString()).toBe(customerRole._id.toString());
        });

        test('stores a verifiable password hash', async () => {
            const customerRole = await Role.findOne({
                name: 'customer',
            });

            const user = await createUser({
                name: 'Test User',
                username: 'test_user',
                email: 'test@example.com',
                password: 'password123',
                role: customerRole._id,
            });

            const isValid = await verifyPassword(
                'password123',
                user.passwordHash
            );

            expect(isValid).toBe(true);
        });

        test('rejects a user without a username', async () => {
            const customerRole = await Role.findOne({
                name: 'customer',
            });

            await expect(
                createUser({
                    name: 'Test User',
                    email: 'test@example.com',
                    password: 'password123',
                    role: customerRole._id,
                })
            ).rejects.toMatchObject({
                name: 'ValidationError',
            });
        });

        test('rejects duplicate usernames', async () => {
            const customerRole = await Role.findOne({
                name: 'customer',
            });

            await User.init();

            await createUser({
                name: 'First User',
                username: 'same_user',
                email: 'first@example.com',
                password: 'password123',
                role: customerRole._id,
            });

            await expect(
                createUser({
                    name: 'Second User',
                    username: 'same_user',
                    email: 'second@example.com',
                    password: 'password123',
                    role: customerRole._id,
                })
            ).rejects.toMatchObject({
                code: 11000,
            });
        });
    });
});
