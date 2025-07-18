import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { sendContactEmail } from '../services/emailService';

const router = Router();

// Validation rules for contact form
const contactValidation = [
    body('email')
        .optional()
        .isEmail()
        .withMessage('Please provide a valid email address'),
    body('message')
        .notEmpty()
        .withMessage('Message is required')
        .isLength({ min: 10, max: 1000 })
        .withMessage('Message must be between 10 and 1000 characters'),
];

// POST /api/contact - Submit contact form
router.post('/', contactValidation, async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation failed',
                details: errors.array()
            });
        }

        const { email, message } = req.body;
        
        // Send contact email
        await sendContactEmail({
            userEmail: email || 'No email provided',
            message,
            timestamp: new Date().toISOString()
        });

        res.status(200).json({
            message: 'Message sent successfully! We\'ll get back to you soon.'
        });

    } catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({
            error: 'Failed to send message. Please try again later.'
        });
    }
});

export default router;