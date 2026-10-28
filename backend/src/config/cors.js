import cors from 'cors';

// Allowed React development server origins.
const allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5174',
];

// Export the named configuration expected by src/app.js.
export const corsOptions = {
    origin(origin, callback) {
        // Permit requests without an Origin header and approved frontend origins.
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        // Reject origins that are not in the allowlist.
        return callback(new Error(`Origin is not allowed by CORS: ${origin}`));
    },
    credentials: true,
};
