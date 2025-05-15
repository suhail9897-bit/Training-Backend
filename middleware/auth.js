const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    // console.log('SECRET VERIFY:', process.env.JWT_SECRET);

    let token = req.header('Authorization');
    // console.log('TOKEN RECEIVED:', token);

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    if (token.startsWith('Bearer ')) {
        token = token.slice(7, token.length);
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.admin = decoded;
        next();
    } catch (error) {
        console.error('JWT VERIFY ERROR:', error);
        res.status(400).json({ message: 'Invalid token' });
    }
};

module.exports = verifyToken;
