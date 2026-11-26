
import { Router } from 'express';
import {
    register,
    login,
    logout,
} from '../controllers/auth.js';
import { requirePageLogin } from '../middleware/auth.js';

const router = Router();

// Display login page.
router.get('/login', (req, res) => {
    if (req.user) {
        return res.redirect('/');
    }

    const message = req.query.registered
        ? 'Your account was created successfully. Please log in.'
        : req.query.loggedOut
            ? 'You have been logged out successfully.'
            : null;

    return res.render('login', {
        title: 'Login | Kizuna Rail',
        error: null,
        message,
    });
});

// Display registration page.
router.get('/register', (req, res) => {
    if (req.user) {
        return res.redirect('/');
    }

    return res.render('register', {
        title: 'Create Account | Kizuna Rail',
        error: null,
        formData: {
            name: '',
            username: '',
            email: '',
        },
    });
});

// Process authentication forms.
router.post('/register', register);
router.post('/login', login);
router.post('/logout', requirePageLogin, logout);

export default router;
