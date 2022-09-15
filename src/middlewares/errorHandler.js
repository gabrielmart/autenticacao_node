const errorResponder = (err, req, res, next) => {
    res.header('Content-Type', 'application/json')
    res.status(err.status || 500).json({
        error: {
            name: err.name,
            message: err.message
        }
    })
}

module.exports = { errorResponder }