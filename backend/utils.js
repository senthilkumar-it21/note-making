import jwt from 'jsonwebtoken';
export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    const token = authHeader && authHeader.split(' ')[1];  // Extract the token part

    if (!token) {
        return res.status(401).json({ error: true, message: "No token provided" });
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: true, message: "Invalid token" });
        }

        console.log("Decoded token user:", user); // Log user object

        if (!user || !user._id) {
            return res.status(403).json({ error: true, message: "User ID not found in token" });
        }

        req.user = user;
        next();
    });


};
