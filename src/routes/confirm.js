
import { getDb } from '../db/connect.js';

const confirmationPage = async (req, res, next) => {
    try {
        const { confirmationId } = req.params;

        const confirmation = await getDb()
            .collection('confirmations')
            .findOne({ id: confirmationId });

        if (!confirmation) {
            return res.status(404).render('errors/404', {
                title: 'Confirmation Not Found',
            });
        }

        const isOwner = confirmation.userId === req.user.id;
        const isAdmin = req.user.role === 'admin';

        if (!isOwner && !isAdmin) {
            return res.status(403).render('errors/403', {
                title: 'Access Denied',
            });
        }

        return res.render('trips/confirm', {
            title: 'Trip Confirmation',
            confirmation,
        });
    } catch (error) {
        return next(error);
    }
};

export default confirmationPage;
