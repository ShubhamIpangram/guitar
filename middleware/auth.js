const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const httpStatus = require('http-status');
const APIError = require('../helpers/APIError');
const db = require('../index')
const query = require('../query/query');
const userColl = db.collection('user')
const { ObjectID } = require('mongodb');
const { decrypt } = require('../helpers/commonfile');

dotenv.config();
const fs = require('fs');

// const publicKey = fs.readFileSync("/etc/public.key",
//     { encoding: 'utf8', flag: 'r' });


// verify JWT token and protect routes.
const protect = async (req, res, next) => {
    let token;
    let message = 'Not authorized to access this route.';
    let msg = 'The user belonging to this token does not exist.';
    // check header for authorization
    if (req.headers.authorization) {
        if (req.headers.authorization.startsWith('Bearer')) {
            token = decrypt(req.headers.authorization.split(' ')[1]);
        }
        else {
            token = decrypt(req.headers.authorization);
        }
    }

    // check token
    if (!token) {
        return next(new APIError(message, httpStatus.UNAUTHORIZED, true));
    }

    try {
        // Verify token
        const decoded = jwt.verify(token,
           //  publicKey, { algorithms: ['RS256']}
           );

        // const user = await User.findById(decoded.id);
        const decodeId = { _id: ObjectID(decoded._id) }
        const user = await query.findOne(userColl, decodeId);
        //   console.log(user)
        if (user) {
            req.user = user;
            next();
        } else {
            return next(new APIError(msg, httpStatus.UNAUTHORIZED, true));
        }
    } catch (e) {
        return next(new APIError(message, httpStatus.UNAUTHORIZED, true));
    }
}

// authorize only Admin
const authorize = async (req, res, next) => {
    const user = req.user;

    if (user.userType !== 'admin') {
        const message = 'Only admin can access this route.';
        return next(new APIError(message, httpStatus.UNAUTHORIZED, true));
    }
    next();
}

// authorize only Admin
const owned = async (req, res, next) => {
    const user = req.user;

    if (user.userType !== 'Therapist') {
        const message = 'Only owner can access this route.';
        return next(new APIError(message, httpStatus.UNAUTHORIZED, true));
    }
    // console.log(user);
    next();
}

module.exports = {
    protect,
    authorize,
    owned
}