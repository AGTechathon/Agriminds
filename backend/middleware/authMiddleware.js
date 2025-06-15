const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    console.log('🚀 [authMiddleware] Request received for:', req.url);
    const authHeader = req.headers['authorization'];
    console.log('🚀 Authorization header:', authHeader);
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('❌ [authMiddleware] No valid Bearer token provided');
        return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('🚀 [authMiddleware] Decoded token:', decoded);
        if (!decoded.id && !decoded.userId) {
            console.log('❌ [authMiddleware] No id or userId in token');
            return res.status(401).json({ message: 'Invalid token: Missing user ID' });
        }
        req.user = {
            id: decoded.id || decoded.userId,
            userId: decoded.id || decoded.userId,
            role: decoded.role
        };
        console.log('🚀 [authMiddleware] Set req.user:', req.user);
        return next();
    } catch (err) {
        console.error('❌ [authMiddleware] Token error:', err.message);
        return res.status(401).json({ message: 'Invalid token' });
    }
};

module.exports = authMiddleware;