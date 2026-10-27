"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importDefault(require("winston"));
// Check if we're in MCP mode (stdio communication)
// When piping input, process.stdin.isTTY is undefined, not false
const isMcpMode = !process.stdin.isTTY;
// Create logger instance
const logger = winston_1.default.createLogger({
    level: isMcpMode ? 'error' : (process.env['LOG_LEVEL'] || 'info'),
    format: winston_1.default.format.combine(winston_1.default.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
    }), winston_1.default.format.errors({ stack: true }), winston_1.default.format.printf((info) => {
        const { timestamp, level, message, stack, ...meta } = info;
        let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
        if (Object.keys(meta).length > 0) {
            log += ` ${JSON.stringify(meta)}`;
        }
        if (stack) {
            log += `\n${stack}`;
        }
        return log;
    })),
    defaultMeta: { service: 'geogebra-mcp-server' },
    transports: [
        // Use stderr instead of stdout to avoid interfering with MCP JSON-RPC communication
        new winston_1.default.transports.Console({
            stderrLevels: ['error', 'warn', 'info', 'debug'],
            format: winston_1.default.format.simple() // Remove colorization for MCP compatibility
        })
    ]
});
// Add file transport in production
if (process.env['NODE_ENV'] === 'production') {
    logger.add(new winston_1.default.transports.File({
        filename: 'logs/error.log',
        level: 'error'
    }));
    logger.add(new winston_1.default.transports.File({
        filename: 'logs/combined.log'
    }));
}
exports.default = logger;
//# sourceMappingURL=logger.js.map