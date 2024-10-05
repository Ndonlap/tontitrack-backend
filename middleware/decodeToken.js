const UserModel = require("../models/User");
const jwt = require('jsonwebtoken')

const decodeToken = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        if (!token)
            return res.status(403).send({ error: 'Token is required.' });
        const decodeUserPayload = jwt.verify(token, 'mytoken');
        let {
            id,
            name,
            accountType,
            email
        } = decodeUserPayload;
        req.userId = id;
        req.name = name;
        req.accountType = accountType;
        req.email = email;
        next();
    } catch (error) {
        return res.status(403).send({ error: 'Token is required.' });
    }
}

module.exports = decodeToken