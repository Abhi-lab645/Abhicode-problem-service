import winston from 'winston';
import 'winston-mongodb';
import { MONGODB_LOGS_URL } from './server.config.js';

const allowedTransports = [];

// 1. Create our custom format

const myFormat = winston.format((info) => {

    info.level = info.level.toUpperCase();

    return info;
});

// 2. Create the actual format instance

const actualFormat = myFormat();

// 3. Custom format: extracts caller file, function & line number from stack trace

const callerInfo = winston.format((info) => {

    // Capture a fresh stack trace from this point
    const stackLines = new Error().stack.split('\n');

    // Walk up the stack to skip winston internals and find your actual code
    const callerLine = stackLines.find((line) =>
        line.includes('/src/') &&
        !line.includes('logger.config')
    );

    if (callerLine) {

        // Extract:  at FunctionName (file:///...src/path/file.js:LINE:COL)
        const match = callerLine.match(/at (\S+) \((.+):(\d+):\d+\)/) ||
            callerLine.match(/at (.+):(\d+):\d+/);

        if (match) {
            info.caller = match[2]
                ? `${match[1]} → ${match[2].split('/src/')[1]}:${match[3]}`
                : `${match[1]}:${match[2]}`;
        }
    }

    return info;
});

// 4. Custom format: converts stack string → array of lines (clean MongoDB storage)

const stackToArray = winston.format((info) => {

    if (info.stack && typeof info.stack === 'string') {

        // Turn "Error: msg\n    at X\n    at Y" into a clean array
        info.stack = info.stack
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean);
    }

    return info;

});

// 4. Console transport (colorized output in terminal)

/*
allowedTransports.push(new winston.transports.Console({

    format: winston.format.combine(

        // Capture stack trace from Error objects
        winston.format.errors({ stack: true }),

        // Convert level to uppercase
        actualFormat,

        // Inject caller file + line
        callerInfo(),

        // Apply color
        winston.format.colorize(),

        // Add timestamp
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),

        // Final output — shows caller location and stack if present
        winston.format.printf((log) => {
            let output = `${log.timestamp} [${log.level}] : ${log.message}`;
            if (log.caller)  output += `\n    📍 at ${log.caller}`;
            if (log.stack)   output += `\n    🔴 Stack:\n${log.stack}`;
            return output;
        })
    )
})
);
*/

// 5. MongoDB transport (saves logs to Abhicode-logger-service DB)

allowedTransports.push(new winston.transports.MongoDB({

    db: MONGODB_LOGS_URL,        // mongodb://localhost:27017/Abhicode-logger-service
    collection: 'logs',          // Collection name inside the DB
    level: 'info',               // Save 'info' and above (info, warn, error)
    storeHost: true,             // Also save the hostname
    tryReconnect: true,          // Auto-reconnect if DB drops

    options: {},

    format: winston.format.combine(

        // Add timestamp
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),

        // Convert stack string → array of lines for clean DB storage
        stackToArray()
    )

}));

// 6. File transport (saves logs to app.log in pretty JSON format)

allowedTransports.push(new winston.transports.File({

    filename: 'app.log',

    format: winston.format.combine(

        // Inject caller file + line
        callerInfo(),

        // Add timestamp
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),

        // Pretty-print JSON (space: 2) — stack is already an array from global format
        winston.format.json({ space: 2 })
    )

}));

const logger = winston.createLogger({

    // Global format: runs FIRST before ANY transport sees the info object
    format: winston.format.combine(

        // 1. Convert Error objects → { message: err.message, stack: err.stack (string) }
        winston.format.errors({ stack: true }),

        // 2. Convert stack string → array of lines (so ALL transports get clean array)
        stackToArray()
    ),

    transports: allowedTransports

});

export default logger;

