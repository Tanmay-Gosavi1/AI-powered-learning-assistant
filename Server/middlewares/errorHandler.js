const errorHandler  = (err , req, res , next) => {
    let statusCode = err.statusCode || 500 ;
    let msg = err.message || 'Internal Server Error' ;

    // Mongoose bad objectId
    if(err.name === 'CastError'){
        statusCode = 400 ;
        msg = `Resource not found. Invalid: ${err.path}` ;
    }
    // Mongoose duplicate key
    if(err.code === 11000){
        statusCode = 400 ;
        msg = `Duplicate field value entered: ${JSON.stringify(err.keyValue)}` ;
    }
    // Mongoose validation error
    if(err.name === 'ValidationError'){
        statusCode = 400 ;
        msg = Object.values(err.errors).map(val => val.message).join(', ') ;
    }

    // Multer file size error
    if(err.code === 'LIMIT_FILE_SIZE'){
        statusCode = 400 ;
        msg = 'File size is too large. Maximum limit is 1MB.' ;
    }

    // JWT errors
    if(err.name === 'JsonWebTokenError'){
        statusCode = 401 ;
        msg = 'Invalid token. Please log in again.' ;
    }

    if(err.name === 'TokenExpiredError'){
        statusCode = 401 ;
        msg = 'Your token has expired. Please log in again.' ;
    }

    console.error("Error:", {
        message : err.message,
        stack : process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
    res.status(statusCode).json({
        success: false,
        error: msg,
        statusCode
    })
}

export default errorHandler ;