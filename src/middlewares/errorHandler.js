const errorResponder = (err, req, res, next) => {
    res.status(err.statusCode || 500).send(err.message)
}

const initializeUnhandledException = () => {
    process.on('unhandledRejection', (reason, promise) => {
        console.log(reason.name, reason.message);
        console.log('UNHANDLED REJECTION! Shutting down...');
        process.exit(1);
    });

    process.on('uncaughtException', (error) => {
        console.log(error.name, error.message);
        console.log('UNCAUGHT EXCEPTION! Shutting down...');
        process.exit(1);
    });
};

module.exports = { errorResponder, initializeUnhandledException }