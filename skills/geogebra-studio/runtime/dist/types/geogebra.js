"use strict";
/**
 * GeoGebra Integration Types
 * Type definitions for GeoGebra Apps API integration
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeoGebraCommandError = exports.GeoGebraConnectionError = exports.GeoGebraError = void 0;
// Error types
class GeoGebraError extends Error {
    code;
    constructor(message, code) {
        super(message);
        this.code = code;
        this.name = 'GeoGebraError';
    }
}
exports.GeoGebraError = GeoGebraError;
class GeoGebraConnectionError extends GeoGebraError {
    constructor(message) {
        super(message, 'CONNECTION_ERROR');
        this.name = 'GeoGebraConnectionError';
    }
}
exports.GeoGebraConnectionError = GeoGebraConnectionError;
class GeoGebraCommandError extends GeoGebraError {
    command;
    constructor(message, command) {
        super(message, 'COMMAND_ERROR');
        this.command = command;
        this.name = 'GeoGebraCommandError';
    }
}
exports.GeoGebraCommandError = GeoGebraCommandError;
//# sourceMappingURL=geogebra.js.map