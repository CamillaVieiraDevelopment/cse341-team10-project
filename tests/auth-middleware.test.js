
import { describe, expect, test, vi } from 'vitest';

import {
    loadSessionUser,
    requireApiLogin,
    requirePageLogin,
    requireApiRole,
    requirePageRole,
} from '../src/middleware/auth.js';

const createResponse = () => ({
    locals: {},
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    redirect: vi.fn().mockReturnThis(),
    render: vi.fn().mockReturnThis(),
});

describe('loadSessionUser', () => {
    test('loads the authenticated user from the session', () => {
        const user = {
            id: 'user-123',
            name: 'Test User',
            role: 'customer',
        };

        const req = {
            session: { user },
        };

        const res = createResponse();
        const next = vi.fn();

        loadSessionUser(req, res, next);

        expect(req.user).toEqual(user);
        expect(res.locals.user).toEqual(user);
        expect(next).toHaveBeenCalledTimes(1);
    });

    test('sets user to null when no session exists', () => {
        const req = {};
        const res = createResponse();
        const next = vi.fn();

        loadSessionUser(req, res, next);

        expect(req.user).toBeNull();
        expect(res.locals.user).toBeNull();
        expect(next).toHaveBeenCalledTimes(1);
    });
});

describe('requireApiLogin', () => {
    test('returns 401 when the user is not authenticated', () => {
        const req = { user: null };
        const res = createResponse();
        const next = vi.fn();

        requireApiLogin(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Authentication required.',
        });
        expect(next).not.toHaveBeenCalled();
    });

    test('allows an authenticated user to continue', () => {
        const req = {
            user: { id: 'user-123', role: 'customer' },
        };

        const res = createResponse();
        const next = vi.fn();

        requireApiLogin(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(res.status).not.toHaveBeenCalled();
    });
});

describe('requirePageLogin', () => {
    test('redirects an unauthenticated user to login', () => {
        const req = { user: null };
        const res = createResponse();
        const next = vi.fn();

        requirePageLogin(req, res, next);

        expect(res.redirect).toHaveBeenCalledWith('/login');
        expect(next).not.toHaveBeenCalled();
    });

    test('allows an authenticated user to continue', () => {
        const req = {
            user: { id: 'user-123', role: 'customer' },
        };

        const res = createResponse();
        const next = vi.fn();

        requirePageLogin(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(res.redirect).not.toHaveBeenCalled();
    });
});

describe('requireApiRole', () => {
    const requireAdmin = requireApiRole('admin');

    test('returns 401 when the user is not authenticated', () => {
        const req = { user: null };
        const res = createResponse();
        const next = vi.fn();

        requireAdmin(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Authentication required.',
        });
        expect(next).not.toHaveBeenCalled();
    });

    test('returns 403 when the user does not have the required role', () => {
        const req = {
            user: { id: 'user-123', role: 'customer' },
        };

        const res = createResponse();
        const next = vi.fn();

        requireAdmin(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
            message: 'You do not have permission to access this resource.',
        });
        expect(next).not.toHaveBeenCalled();
    });

    test('allows an administrator to continue', () => {
        const req = {
            user: { id: 'admin-123', role: 'admin' },
        };

        const res = createResponse();
        const next = vi.fn();

        requireAdmin(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(res.status).not.toHaveBeenCalled();
    });
});

describe('requirePageRole', () => {
    const requireAdmin = requirePageRole('admin');

    test('redirects an unauthenticated user to login', () => {
        const req = { user: null };
        const res = createResponse();
        const next = vi.fn();

        requireAdmin(req, res, next);

        expect(res.redirect).toHaveBeenCalledWith('/login');
        expect(next).not.toHaveBeenCalled();
    });

    test('renders the 403 page when the user lacks the required role', () => {
        const req = {
            user: { id: 'user-123', role: 'customer' },
        };

        const res = createResponse();
        const next = vi.fn();

        requireAdmin(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.render).toHaveBeenCalledWith('errors/403', {
            title: 'Access Denied',
        });
        expect(next).not.toHaveBeenCalled();
    });

    test('allows an administrator to continue', () => {
        const req = {
            user: { id: 'admin-123', role: 'admin' },
        };

        const res = createResponse();
        const next = vi.fn();

        requireAdmin(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(res.status).not.toHaveBeenCalled();
    });
});
