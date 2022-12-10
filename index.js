const express = require('express');
const helmet = require('helmet');
const session = require("express-session")
const bodyParser = require('body-parser')
const db = require('./config/database');
const APIError = require('./helpers/APIError');
const httpStatus = require('http-status');
const expressValidation = require('express-validation');
const path = require("path")
const cors = require('cors');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
var csrf = require('csurf');

const port = process.env.PORT || 9001

const app = express();
app.use(helmet());
app.use(bodyParser.urlencoded({ limit: '15gb', extended: false }));
app.use(bodyParser.json({ limit: '15gb' }));
app.use(cors());
app.use(logger('dev'));

app.use(cookieParser());
var csrfProtection = csrf({ cookie: true });

app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: process.env.SECRET_EXPREESESSION,
    resave: true,
    saveUninitialized: true
}));

db.connection().then((database) => {
    module.exports = database
    app.use('/api/auth', require('./routes/auth.route'));
    app.use('/api/category', require('./routes/category.route'));
    app.use('/api/level', require('./routes/level.route'));
    app.use('/api/lesson', require('./routes/lesson.route'));
    app.use('/api/file', require('./routes/file.route'));
    app.use('/api/adminUser', require('./routes/user.route'));
    app.use('/api/dailyTips', require('./routes/dailyTips.route'));
    app.use('/api/enrollment', require('./routes/enrollment.route'));
    app.use('/api/welcomeMessage', require('./routes/welcomeMessage.route'));
    app.use('/api/user', require('./routes/mobile/auth.route'));

    app.use((err, req, res, next) => {
        if (err instanceof expressValidation.ValidationError) {
            console.log(err)
            // validation error contains errors which is an array of error each containing message[]
            const unifiedErrorMessage = err.errors.map(Error => Error.messages.join('. ')).join(' and ');
            const error = new APIError(unifiedErrorMessage, err.status, true);
            return next(error);
        } else if (!(err instanceof APIError)) {
            console.log(err)
            const apiError = new APIError(err.message, err.status, err.name === 'UnauthorizedError' ? true : err.isPublic);
            return next(apiError);
        }
        return next(err);
    });

    app.use((req, res, next) => {
        const err = new APIError('API Not Found', httpStatus.NOT_FOUND, true);
        return next(err);
    });

    app.use((err, req, res, next) => {
        res.status(err.status).json({
            error: {
                message: err.isPublic ? err.message : httpStatus[err.status],
            }
        });
    }
    );
    app.listen(port, () => {
        console.log(`The guitar-learning app is up on port ${port}`);
    })
}).catch((e) => {
    const err = new APIError(`${e.message}`, httpStatus.NOT_FOUND, true);
    console.log("Error::----", e)
})
