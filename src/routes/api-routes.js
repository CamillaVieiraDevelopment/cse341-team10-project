
import { Router } from 'express';
import {
    getAllTicketClasses,
    getTicketClassesForDay
} from '../controllers/ticket-classes.js';

const router = Router();

router.get('/ticket-classes', (req, res) => {
    if (req.query.day !== undefined) {
        return getTicketClassesForDay(req, res);
    }

    return getAllTicketClasses(req, res);
});

export default router;
