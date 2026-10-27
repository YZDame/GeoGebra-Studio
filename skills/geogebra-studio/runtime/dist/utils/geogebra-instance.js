"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeoGebraInstance = void 0;
// @ts-nocheck
const puppeteer_core_1 = __importDefault(require("puppeteer-core"));
const browser_1 = require("../studio/browser");
const html_1 = require("../export/html");
const workspace_1 = require("../export/workspace");
const geogebra_1 = require("../types/geogebra");
const logger_1 = __importDefault(require("./logger"));
const crypto_1 = require("crypto");
/**
 * GeoGebra Instance - Manages a single GeoGebra instance via Puppeteer
 */
/**
 * Escapes a string for safe use in JavaScript code.
 * Replaces backslashes and single quotes with their escaped equivalents.
 */
function escapeForJavaScript(input) {
    return input.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}
class GeoGebraInstance {
    browser;
    page;
    isInitialized = false;
    lastActivity = new Date();
    id;
    config;
    constructor(config = {}) {
        this.id = (0, crypto_1.randomUUID)();
        this.config = {
            appName: 'classic', // Changed from 'graphing' to 'classic' for full functionality
            width: 800,
            height: 600,
            showMenuBar: false,
            showToolBar: false,
            showAlgebraInput: false,
            showResetIcon: false,
            enableRightClick: true,
            language: 'en',
            ...config
        };
        logger_1.default.info(`Created GeoGebra instance ${this.id}`, { config: this.config });
    }
    /**
     * Initialize the GeoGebra instance
     */
    async initialize(headless = true, browserArgs = []) {
        try {
            logger_1.default.info(`Initializing GeoGebra instance ${this.id}`, { headless });
            // Launch browser
            this.browser = await puppeteer_core_1.default.launch({
                headless,
                executablePath: (0, browser_1.resolveBrowser)(),
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--disable-gpu',
                    ...browserArgs
                ]
            });
            // Create new page
            this.page = await this.browser.newPage();
            // Set viewport
            await this.page.setViewport({
                width: this.config.width || 800,
                height: this.config.height || 600
            });
            // Load GeoGebra
            await this.loadGeoGebra();
            // Wait for GeoGebra to be ready
            await this.waitForReady();
            this.isInitialized = true;
            this.updateActivity();
            logger_1.default.info(`GeoGebra instance ${this.id} initialized successfully`);
        }
        catch (error) {
            logger_1.default.error(`Failed to initialize GeoGebra instance ${this.id}`, error);
            await this.cleanup();
            throw new geogebra_1.GeoGebraConnectionError(`Failed to initialize GeoGebra: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Load GeoGebra applet in the browser
     */
    async loadGeoGebra() {
        if (!this.page) {
            throw new geogebra_1.GeoGebraConnectionError('Page not initialized');
        }
        const appletHTML = this.generateAppletHTML();
        await this.page.setContent(appletHTML);
        // Wait for GeoGebra to load
        await this.page.waitForFunction('window.ggbReady || window.ggbError', { timeout: 60000 });
        const bootError = await this.page.evaluate(() => window.ggbError);
        if (bootError)
            throw new geogebra_1.GeoGebraConnectionError(bootError);
    }
    /**
     * Generate HTML content with GeoGebra applet
     */
    generateAppletHTML() {
        return (0, html_1.constructionHtml)({ width: this.config.width, height: this.config.height, ggbBase64: this.config.ggbBase64 });
    }
    /**
     * Wait for GeoGebra to be ready
     */
    async waitForReady(timeout = 30000) {
        if (!this.page) {
            throw new geogebra_1.GeoGebraConnectionError('Page not initialized');
        }
        try {
            // Wait for both ggbReady flag and ggbApplet to be available
            await this.page.waitForFunction('window.ggbReady === true && window.ggbApplet && typeof window.ggbApplet.evalCommand === "function"', { timeout });
            // Additional verification that the applet is functional
            const isWorking = await this.page.evaluate(() => {
                try {
                    return typeof window.ggbApplet.evalCommand === 'function' &&
                        typeof window.ggbApplet.exists === 'function';
                }
                catch (e) {
                    return false;
                }
            });
            if (!isWorking) {
                throw new Error('GeoGebra applet methods not available');
            }
            logger_1.default.debug(`GeoGebra instance ${this.id} is ready and functional`);
        }
        catch (error) {
            // Log the current state for debugging
            try {
                const debugInfo = await this.page.evaluate(() => ({
                    ggbReady: window.ggbReady,
                    ggbAppletExists: !!window.ggbApplet,
                    ggbAppletType: typeof window.ggbApplet,
                    evalCommandExists: window.ggbApplet && typeof window.ggbApplet.evalCommand,
                    pageLocation: window.location.href,
                    pageTitle: document.title
                }));
                logger_1.default.error(`GeoGebra initialization failed. Debug info:`, debugInfo);
            }
            catch (debugError) {
                logger_1.default.error(`Failed to get debug info during initialization failure`, debugError);
            }
            throw new geogebra_1.GeoGebraConnectionError('GeoGebra failed to initialize within timeout');
        }
    }
    /**
     * Execute a GeoGebra command
     */
    async evalCommand(command) {
        this.ensureInitialized();
        this.updateActivity();
        try {
            logger_1.default.debug(`Executing command on instance ${this.id}: ${command}`);
            // First verify that the applet is still available
            const appletCheck = await this.page.evaluate(() => {
                return {
                    appletExists: !!window.ggbApplet,
                    evalCommandExists: !!window.ggbApplet && typeof window.ggbApplet.evalCommand === 'function'
                };
            });
            if (!appletCheck.appletExists || !appletCheck.evalCommandExists) {
                throw new Error(`GeoGebra applet not available: ${JSON.stringify(appletCheck)}`);
            }
            const result = await this.page.evaluate((cmd) => {
                try {
                    const success = window.ggbApplet.evalCommand(cmd);
                    return {
                        success: success,
                        error: success ? undefined : 'Command execution failed'
                    };
                }
                catch (error) {
                    return {
                        success: false,
                        error: error.message || 'Unknown error'
                    };
                }
            }, command);
            if (!result.success) {
                throw new geogebra_1.GeoGebraCommandError(result.error || 'Command failed', command);
            }
            logger_1.default.debug(`Command executed successfully on instance ${this.id}: ${command}`);
            return result;
        }
        catch (error) {
            logger_1.default.error(`Command execution failed on instance ${this.id}`, { command, error });
            if (error instanceof geogebra_1.GeoGebraCommandError) {
                throw error;
            }
            throw new geogebra_1.GeoGebraCommandError(`Failed to execute command: ${error instanceof Error ? error.message : String(error)}`, command);
        }
    }
    /**
     * Execute command and get labels of created objects
     */
    async evalCommandGetLabels(command) {
        this.ensureInitialized();
        this.updateActivity();
        try {
            const labels = await this.page.evaluate((cmd) => {
                const result = window.ggbApplet.evalCommandGetLabels(cmd);
                return result ? result.split(',').filter((label) => label.trim()) : [];
            }, command);
            logger_1.default.debug(`Command executed on instance ${this.id}, labels: ${labels.join(', ')}`);
            return labels;
        }
        catch (error) {
            logger_1.default.error(`Failed to execute command with labels on instance ${this.id}`, { command, error });
            throw new geogebra_1.GeoGebraCommandError(`Failed to execute command: ${error instanceof Error ? error.message : String(error)}`, command);
        }
    }
    /** Invoke a documented GeoGebra Apps API method against the live applet. */
    async callAppsApi(method, args = [], options = {}) {
        this.ensureInitialized();
        this.updateActivity();
        if (!/^[A-Za-z][A-Za-z0-9]*$/.test(method) || ['constructor', '__proto__', 'prototype', 'toString', 'valueOf'].includes(method)) {
            throw new Error('Invalid GeoGebra Apps API method name');
        }
        return this.page.evaluate(async ({ method, args, waitForCallbackIndex, callbackTimeoutMs, callbacks }) => {
            const api = window.ggbApplet;
            const target = api?.[method];
            if (typeof target !== 'function')
                throw new Error(`GeoGebra Apps API method is unavailable: ${method}`);
            const invocationArgs = [...args];
            const callbackStore = (window.__geogebraMcpCallbacks ??= { functions: {}, events: {} });
            for (const descriptor of callbacks ?? []) {
                if (!Number.isInteger(descriptor.argumentIndex) || descriptor.argumentIndex < 0 || descriptor.argumentIndex > 20 || !/^[A-Za-z0-9_-]{1,80}$/.test(descriptor.id)) {
                    throw new Error('Invalid persistent callback descriptor');
                }
                callbackStore.events[descriptor.id] ??= [];
                callbackStore.functions[descriptor.id] ??= (...values) => {
                    const queue = callbackStore.events[descriptor.id];
                    queue.push(values);
                    if (queue.length > 100)
                        queue.splice(0, queue.length - 100);
                };
                invocationArgs[descriptor.argumentIndex] = callbackStore.functions[descriptor.id];
            }
            if (waitForCallbackIndex !== undefined) {
                const index = waitForCallbackIndex;
                if (!Number.isInteger(index) || index < 0 || index > 20)
                    throw new Error('Invalid callback argument index');
                return await new Promise((resolve, reject) => {
                    const timer = setTimeout(() => reject(new Error(`GeoGebra API callback timed out: ${method}`)), callbackTimeoutMs);
                    invocationArgs[index] = (value) => { clearTimeout(timer); resolve(value); };
                    try {
                        const immediate = target.apply(api, invocationArgs);
                        if (immediate && typeof immediate.then === 'function')
                            immediate.then(resolve, reject);
                    }
                    catch (error) {
                        clearTimeout(timer);
                        reject(error);
                    }
                });
            }
            const result = target.apply(api, invocationArgs);
            return result && typeof result.then === 'function' ? await result : result;
        }, { method, args, ...options, callbackTimeoutMs: options.callbackTimeoutMs ?? 15000 });
    }
    async readAppsApiCallbackEvents(id, clear = true) {
        this.ensureInitialized();
        if (!/^[A-Za-z0-9_-]{1,80}$/.test(id))
            throw new Error('Invalid callback id');
        return this.page.evaluate(({ id, clear }) => {
            const store = window.__geogebraMcpCallbacks;
            const events = store?.events?.[id] ?? [];
            const copy = events.slice();
            if (clear && store?.events?.[id])
                store.events[id] = [];
            return copy;
        }, { id, clear });
    }
    /** Enumerate callable methods exposed by the currently loaded official applet API. */
    async listAppsApiMethods() {
        this.ensureInitialized();
        return this.page.evaluate(() => {
            const api = window.ggbApplet;
            const names = new Set();
            for (let object = api; object && object !== Object.prototype; object = Object.getPrototypeOf(object)) {
                for (const name of Object.getOwnPropertyNames(object)) {
                    if (/^[A-Za-z][A-Za-z0-9]*$/.test(name) && typeof api[name] === 'function' && !['constructor', 'toString', 'valueOf'].includes(name))
                        names.add(name);
                }
            }
            return [...names].sort();
        });
    }
    /**
     * Delete an object
     */
    async deleteObject(objName) {
        this.ensureInitialized();
        this.updateActivity();
        try {
            await this.page.evaluate(`window.ggbApplet.deleteObject('${escapeForJavaScript(objName)}');`);
            return true;
        }
        catch (error) {
            logger_1.default.error(`Failed to delete object ${objName} on instance ${this.id}`, error);
            return false;
        }
    }
    /**
     * Check if object exists
     */
    async exists(objName) {
        this.ensureInitialized();
        this.updateActivity();
        try {
            const exists = await this.page.evaluate((name) => {
                return window.ggbApplet.exists(name);
            }, objName);
            return exists;
        }
        catch (error) {
            logger_1.default.error(`Failed to check existence of object ${objName} on instance ${this.id}`, error);
            return false;
        }
    }
    /**
     * Check if object is defined
     */
    async isDefined(objName) {
        this.ensureInitialized();
        this.updateActivity();
        try {
            const defined = await this.page.evaluate((name) => {
                return window.ggbApplet.isDefined(name);
            }, objName);
            return defined;
        }
        catch (error) {
            logger_1.default.error(`Failed to check if object ${objName} is defined on instance ${this.id}`, error);
            return false;
        }
    }
    /**
     * Get all object names
     */
    async getAllObjectNames(type) {
        this.ensureInitialized();
        this.updateActivity();
        try {
            const names = await this.page.evaluate((objType) => {
                return window.ggbApplet.getAllObjectNames(objType);
            }, type);
            return names || [];
        }
        catch (error) {
            logger_1.default.error(`Failed to get object names on instance ${this.id}`, error);
            return [];
        }
    }
    /**
     * Set each object's caption to LaTeX name form ($name$) and show caption label mode.
     */
    async applyLatexCaptionDefaults(objectNames, showLabel = true) {
        this.ensureInitialized();
        this.updateActivity();
        if (objectNames.length === 0) {
            return;
        }
        const uniqueNames = Array.from(new Set(objectNames.filter(name => name && name.trim())));
        if (uniqueNames.length === 0) {
            return;
        }
        try {
            const result = await this.page.evaluate((names, shouldShowLabel) => {
                const applet = window.ggbApplet;
                const failed = [];
                for (const name of names) {
                    try {
                        if (!applet.exists(name)) {
                            failed.push(name);
                            continue;
                        }
                        applet.setCaption(name, `$${name}$`);
                        applet.setLabelStyle(name, 3);
                        if (shouldShowLabel) {
                            applet.setLabelVisible(name, true);
                        }
                    }
                    catch (_error) {
                        failed.push(name);
                    }
                }
                return { failed };
            }, uniqueNames, showLabel);
            if (Array.isArray(result?.failed) && result.failed.length > 0) {
                logger_1.default.warn(`Failed to apply LaTeX caption defaults for ${result.failed.length} object(s)`, {
                    instanceId: this.id,
                    failedObjects: result.failed
                });
            }
        }
        catch (error) {
            logger_1.default.error(`Failed to apply LaTeX caption defaults on instance ${this.id}`, {
                objectNames: uniqueNames,
                error
            });
            throw error;
        }
    }
    /**
     * Apply default visual style settings to objects.
     * - Point-like objects: point size
     * - Line-like objects: line thickness
     */
    async applyDefaultStyleSettings(objectNames, pointSize, lineThickness) {
        this.ensureInitialized();
        this.updateActivity();
        if (objectNames.length === 0) {
            return;
        }
        const uniqueNames = Array.from(new Set(objectNames.filter(name => name && name.trim())));
        if (uniqueNames.length === 0) {
            return;
        }
        try {
            const result = await this.page.evaluate((names, pointSizeValue, lineThicknessValue) => {
                const applet = window.ggbApplet;
                const failed = [];
                const pointTypes = new Set(['point']);
                const lineTypes = new Set([
                    'line',
                    'segment',
                    'ray',
                    'vector',
                    'circle',
                    'conic',
                    'polygon',
                    'function',
                    'curve'
                ]);
                for (const name of names) {
                    try {
                        if (!applet.exists(name)) {
                            failed.push(name);
                            continue;
                        }
                        const rawType = String(applet.getObjectType(name) || '').toLowerCase();
                        if (pointTypes.has(rawType)) {
                            applet.setPointSize(name, pointSizeValue);
                        }
                        else if (lineTypes.has(rawType)) {
                            applet.setLineThickness(name, lineThicknessValue);
                        }
                    }
                    catch (_error) {
                        failed.push(name);
                    }
                }
                return { failed };
            }, uniqueNames, pointSize, lineThickness);
            if (Array.isArray(result?.failed) && result.failed.length > 0) {
                logger_1.default.warn(`Failed to apply default style settings for ${result.failed.length} object(s)`, {
                    instanceId: this.id,
                    failedObjects: result.failed
                });
            }
        }
        catch (error) {
            logger_1.default.error(`Failed to apply default style settings on instance ${this.id}`, {
                objectNames: uniqueNames,
                pointSize,
                lineThickness,
                error
            });
            throw error;
        }
    }
    /**
     * Get object information
     */
    async getObjectInfo(objName) {
        this.ensureInitialized();
        this.updateActivity();
        try {
            const info = await this.page.evaluate((name) => {
                if (!window.ggbApplet.exists(name)) {
                    return null;
                }
                const type = window.ggbApplet.getObjectType(name);
                // Base information that all objects have
                const baseInfo = {
                    name,
                    type,
                    visible: window.ggbApplet.getVisible(name),
                    defined: window.ggbApplet.isDefined(name),
                    color: window.ggbApplet.getColor(name)
                };
                // Try to get value and valueString safely
                let value = null;
                let valueString = null;
                try {
                    value = window.ggbApplet.getValue(name);
                }
                catch (e) {
                    // Some objects don't have a numeric value
                }
                try {
                    valueString = window.ggbApplet.getValueString(name);
                }
                catch (e) {
                    // Some objects don't have a value string
                }
                // Only try to get coordinates for objects that support them
                // Points, segments, lines, circles typically have coordinates
                // Functions, curves, implicit curves typically don't
                const coordinateTypes = ['point', 'segment', 'line', 'circle', 'polygon', 'vector'];
                let coordinates = {};
                if (coordinateTypes.includes(type.toLowerCase())) {
                    try {
                        coordinates = {
                            x: window.ggbApplet.getXcoord(name),
                            y: window.ggbApplet.getYcoord(name),
                            z: window.ggbApplet.getZcoord(name)
                        };
                    }
                    catch (e) {
                        // If coordinate access fails, just omit coordinates
                    }
                }
                return {
                    ...baseInfo,
                    value,
                    valueString,
                    ...coordinates
                };
            }, objName);
            return info;
        }
        catch (error) {
            logger_1.default.error(`Failed to get object info for ${objName} on instance ${this.id}`, error);
            return null;
        }
    }
    /**
     * Get X coordinate of object
     */
    async getXcoord(objName) {
        this.ensureInitialized();
        this.updateActivity();
        try {
            const x = await this.page.evaluate((name) => {
                return window.ggbApplet.getXcoord(name);
            }, objName);
            return x || 0;
        }
        catch (error) {
            logger_1.default.error(`Failed to get X coordinate of ${objName} on instance ${this.id}`, error);
            return 0;
        }
    }
    /**
     * Get Y coordinate of object
     */
    async getYcoord(objName) {
        this.ensureInitialized();
        this.updateActivity();
        try {
            const y = await this.page.evaluate((name) => {
                return window.ggbApplet.getYcoord(name);
            }, objName);
            return y || 0;
        }
        catch (error) {
            logger_1.default.error(`Failed to get Y coordinate of ${objName} on instance ${this.id}`, error);
            return 0;
        }
    }
    /**
     * Get Z coordinate of object
     */
    async getZcoord(objName) {
        this.ensureInitialized();
        this.updateActivity();
        try {
            const z = await this.page.evaluate((name) => {
                return window.ggbApplet.getZcoord(name);
            }, objName);
            return z || 0;
        }
        catch (error) {
            logger_1.default.error(`Failed to get Z coordinate of ${objName} on instance ${this.id}`, error);
            return 0;
        }
    }
    /**
     * Get value of object
     */
    async getValue(objName) {
        this.ensureInitialized();
        this.updateActivity();
        try {
            const value = await this.page.evaluate((name) => {
                return window.ggbApplet.getValue(name);
            }, objName);
            return value || 0;
        }
        catch (error) {
            logger_1.default.error(`Failed to get value of ${objName} on instance ${this.id}`, error);
            return 0;
        }
    }
    /**
     * Get value string of object
     */
    async getValueString(objName) {
        this.ensureInitialized();
        this.updateActivity();
        try {
            const valueStr = await this.page.evaluate((name) => {
                return window.ggbApplet.getValueString(name);
            }, objName);
            return valueStr || '';
        }
        catch (error) {
            logger_1.default.error(`Failed to get value string of ${objName} on instance ${this.id}`, error);
            return '';
        }
    }
    /**
     * Clear construction
     */
    async newConstruction() {
        this.ensureInitialized();
        this.updateActivity();
        try {
            await this.page.evaluate(() => {
                window.ggbApplet.newConstruction();
            });
            logger_1.default.debug(`Construction cleared on instance ${this.id}`);
        }
        catch (error) {
            logger_1.default.error(`Failed to clear construction on instance ${this.id}`, error);
            throw new geogebra_1.GeoGebraError(`Failed to clear construction: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Reset construction
     */
    async reset() {
        this.ensureInitialized();
        this.updateActivity();
        try {
            await this.page.evaluate(() => {
                window.ggbApplet.reset();
            });
            logger_1.default.debug(`Construction reset on instance ${this.id}`);
        }
        catch (error) {
            logger_1.default.error(`Failed to reset construction on instance ${this.id}`, error);
            throw new geogebra_1.GeoGebraError(`Failed to reset construction: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Refresh views
     */
    async refreshViews() {
        this.ensureInitialized();
        this.updateActivity();
        try {
            await this.page.evaluate(() => {
                window.ggbApplet.refreshViews();
            });
            logger_1.default.debug(`Views refreshed on instance ${this.id}`);
        }
        catch (error) {
            logger_1.default.error(`Failed to refresh views on instance ${this.id}`, error);
            throw new geogebra_1.GeoGebraError(`Failed to refresh views: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Set coordinate system bounds
     */
    async setCoordSystem(xmin, xmax, ymin, ymax) {
        this.ensureInitialized();
        this.updateActivity();
        try {
            await this.page.evaluate((xmin, xmax, ymin, ymax) => {
                window.ggbApplet.setCoordSystem(xmin, xmax, ymin, ymax);
            }, xmin, xmax, ymin, ymax);
            logger_1.default.debug(`Coordinate system set on instance ${this.id}: x[${xmin}, ${xmax}], y[${ymin}, ${ymax}]`);
        }
        catch (error) {
            logger_1.default.error(`Failed to set coordinate system on instance ${this.id}`, error);
            throw new geogebra_1.GeoGebraError(`Failed to set coordinate system: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Set axes visibility
     */
    async setAxesVisible(xAxis, yAxis) {
        this.ensureInitialized();
        this.updateActivity();
        try {
            await this.page.evaluate((xAxis, yAxis) => {
                window.ggbApplet.setAxesVisible(xAxis, yAxis);
            }, xAxis, yAxis);
            logger_1.default.debug(`Axes visibility set on instance ${this.id}: x=${xAxis}, y=${yAxis}`);
        }
        catch (error) {
            logger_1.default.error(`Failed to set axes visibility on instance ${this.id}`, error);
            throw new geogebra_1.GeoGebraError(`Failed to set axes visibility: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Set grid visibility
     */
    async setGridVisible(visible) {
        this.ensureInitialized();
        this.updateActivity();
        try {
            await this.page.evaluate((visible) => {
                window.ggbApplet.setGridVisible(visible);
            }, visible);
            logger_1.default.debug(`Grid visibility set on instance ${this.id}: ${visible}`);
        }
        catch (error) {
            logger_1.default.error(`Failed to set grid visibility on instance ${this.id}`, error);
            throw new geogebra_1.GeoGebraError(`Failed to set grid visibility: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Check if GeoGebra is ready
     */
    async isReady() {
        if (!this.page)
            return false;
        try {
            const ready = await this.page.evaluate(() => {
                return window.ggbReady === true && window.ggbApplet;
            });
            return ready;
        }
        catch (error) {
            logger_1.default.error(`Failed to check ready state on instance ${this.id}`, error);
            return false;
        }
    }
    /**
     * Export construction as PNG (base64) with enhanced parameters
     * GEB-17: Enhanced with validation, retry logic, and better error handling
     */
    async exportPNG(scale = 1, transparent = false, dpi = 72, width, height) {
        this.ensureInitialized();
        this.updateActivity();
        // GEB-17: Validate export readiness before attempting
        const readiness = await this.validateExportReadiness('png');
        if (!readiness.ready) {
            throw new geogebra_1.GeoGebraError(`PNG export not ready: ${readiness.issues.join(', ')}. Recommendations: ${readiness.recommendations.join(', ')}`);
        }
        return this.retryOperation(async () => {
            const pngBase64 = await this.page.evaluate((scale, transparent, dpi, width, height) => {
                try {
                    // GEB-17: Enhanced applet availability check
                    const applet = window.ggbApplet;
                    if (!applet) {
                        throw new Error('GeoGebra applet not available');
                    }
                    if (typeof applet.getPNGBase64 !== 'function') {
                        throw new Error('getPNGBase64 method not available on applet');
                    }
                    // Calculate effective scale if width/height provided
                    let effectiveScale = scale;
                    if (width !== undefined && height !== undefined) {
                        // Get current dimensions with better error handling
                        let graphics;
                        try {
                            graphics = applet.getGraphicsOptions ? applet.getGraphicsOptions() : { width: 800, height: 600 };
                        }
                        catch (e) {
                            // Fallback to default dimensions if getGraphicsOptions fails
                            graphics = { width: 800, height: 600 };
                        }
                        const currentWidth = graphics.width || 800;
                        const currentHeight = graphics.height || 600;
                        const scaleX = width / currentWidth;
                        const scaleY = height / currentHeight;
                        effectiveScale = Math.min(scaleX, scaleY);
                    }
                    // GEB-17: Enhanced PNG export with better error handling and validation
                    let result = null;
                    let lastError = null;
                    // Try primary method with full parameters
                    try {
                        result = applet.getPNGBase64(effectiveScale, transparent, dpi);
                        if (result && typeof result === 'string' && result.length > 0) {
                            return result; // Success with primary method
                        }
                    }
                    catch (e1) {
                        lastError = e1;
                        // Continue to fallback methods
                    }
                    // Try without dpi parameter
                    try {
                        result = applet.getPNGBase64(effectiveScale, transparent);
                        if (result && typeof result === 'string' && result.length > 0) {
                            return result; // Success with fallback method
                        }
                    }
                    catch (e2) {
                        lastError = e2;
                        // Continue to next fallback
                    }
                    // Try simplest approach with just scale
                    try {
                        result = applet.getPNGBase64(effectiveScale);
                        if (result && typeof result === 'string' && result.length > 0) {
                            return result; // Success with simple method
                        }
                    }
                    catch (e3) {
                        lastError = e3;
                        // Continue to final fallback
                    }
                    // Try with default scale as last resort
                    try {
                        result = applet.getPNGBase64(1);
                        if (result && typeof result === 'string' && result.length > 0) {
                            return result; // Success with default scale
                        }
                    }
                    catch (e4) {
                        lastError = e4;
                    }
                    // If we get here, all methods failed
                    throw new Error(`All PNG export methods failed. Last error: ${lastError ? lastError.message : 'Unknown error'}. Result was: ${typeof result} with length ${result ? result.length : 'undefined'}`);
                }
                catch (error) {
                    throw new Error(`PNG export failed: ${error.message || error}`);
                }
            }, scale, transparent, dpi, width, height);
            // GEB-17: Enhanced validation of the result
            if (!pngBase64) {
                throw new Error('PNG export returned null or undefined');
            }
            if (typeof pngBase64 !== 'string') {
                throw new Error(`PNG export returned invalid type: ${typeof pngBase64}`);
            }
            if (pngBase64.length === 0) {
                throw new Error('PNG export returned empty string');
            }
            // Enhanced base64 validation
            if (!/^[A-Za-z0-9+/]*={0,2}$/.test(pngBase64)) {
                throw new Error(`Result is not valid base64. Length: ${pngBase64.length}, starts with: ${pngBase64.substring(0, 50)}`);
            }
            // Additional check for minimum reasonable size (base64 should be substantial for a real image)
            if (pngBase64.length < 100) {
                throw new Error(`PNG result suspiciously small (${pngBase64.length} characters): ${pngBase64}`);
            }
            logger_1.default.debug(`PNG exported from instance ${this.id} with scale ${scale}, transparent ${transparent}, dpi ${dpi}, dimensions ${width}x${height}, result length: ${pngBase64.length}`);
            return pngBase64;
        }, 3, 1000, 'PNG export');
    }
    /**
     * Export construction as SVG
     * GEB-17: Enhanced with better validation and error handling, no more placeholder responses
     */
    /** Raw PGF is internal input to the mandatory Gikz pipeline. */
    async exportNativeTikZ() { return this.nativeExport('tikz'); }
    async exportSVG() { return this.nativeExport('svg'); }
    async exportPDF() { return this.nativeExport('pdf'); }
    async exportGGB() { return this.nativeExport('ggb'); }
    async nativeExport(format) {
        this.ensureInitialized();
        this.updateActivity();
        const result = await this.page.evaluate((kind) => new Promise((resolve, reject) => {
            const api = window.ggbApplet;
            const timer = setTimeout(() => reject(new Error(kind + ' export timed out')), 20000);
            const done = (value) => {
                clearTimeout(timer);
                if (!value || typeof value !== 'string')
                    reject(new Error(kind + ' export returned no data'));
                else
                    resolve(value);
            };
            try {
                if (kind === 'ggb')
                    api.getBase64(done);
                else if (kind === 'svg')
                    api.exportSVG(done);
                else if (kind === 'tikz')
                    api.exportPGF(done);
                else
                    api.exportPDF(1, done);
            }
            catch (e) {
                clearTimeout(timer);
                reject(e);
            }
        }), format);
        if (format === 'tikz') {
            if (!result.includes('\\begin{tikzpicture}'))
                throw new geogebra_1.GeoGebraError('Invalid native TikZ export');
            return result;
        }
        if (format === 'svg') {
            if (!result.includes('<svg'))
                throw new geogebra_1.GeoGebraError('Invalid SVG export');
            return result;
        }
        const base64 = result.replace(/^data:[^,]+,/, '');
        const bytes = Buffer.from(base64, 'base64');
        if (format === 'ggb' && bytes.subarray(0, 2).toString() !== 'PK')
            throw new geogebra_1.GeoGebraError('GGB export is not a ZIP archive');
        if (format === 'pdf' && bytes.subarray(0, 5).toString() !== '%PDF-')
            throw new geogebra_1.GeoGebraError('Invalid native PDF export');
        return base64;
    }
    /** Load a generated viewer and wait for its native applet and responsive layout. */
    async renderHtml(html) {
        this.ensureInitialized();
        // A fresh document prevents lexical globals and old applet callbacks leaking between renders.
        await this.page.goto("about:blank");
        await this.page.setContent(html);
        await this.page.waitForFunction('window.ggbReady || window.ggbError', { timeout: 60000 });
        const error = await this.page.evaluate(() => window.ggbError);
        if (error)
            throw new geogebra_1.GeoGebraConnectionError(error);
        await this.page.waitForFunction(() => {
            const view = JSON.parse(window.ggbApplet.getViewProperties(1));
            return view.width > 0 && view.height > 0 && Math.abs(view.invXscale / view.invYscale - 1) < 1e-6;
        }, { timeout: 10000 });
    }
    async capturePreview() {
        this.ensureInitialized();
        // Native LaTeX loads fonts after appletOnLoad; capture the completed paint.
        // GeoGebra maintains background requests, so network idle is not a readiness condition.
        await this.page.evaluate(() => new Promise(resolve => setTimeout(resolve, 2000)));
        await this.page.evaluate(async () => { await document.fonts.ready; await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))); });
        return this.page.screenshot({ type: 'png' });
    }
    async getConstructionXML() {
        this.ensureInitialized();
        return this.page.evaluate(() => String(window.ggbApplet.getXML()));
    }
    /**
     * Validate that a file path is within the workspace directory to prevent path traversal attacks
     * @param filePath - The file path to validate
     * @param workspaceDir - The workspace directory
     * @returns The validated absolute path
     * @throws Error if path is outside workspace
     */
    validateFilePath(filePath, workspaceDir) {
        const path = require('path');
        const fullPath = path.resolve(workspaceDir, filePath);
        const normalizedWorkspace = path.resolve(workspaceDir);
        // Check if the resolved path is within the workspace
        if (!fullPath.startsWith(normalizedWorkspace + path.sep) && fullPath !== normalizedWorkspace) {
            throw new Error(`Path traversal detected: ${filePath} resolves outside workspace`);
        }
        return fullPath;
    }
    /**
     * Calculate optimal view coordinates to fit all visible objects
     * @param padding - Padding percentage around objects (default: 0.2 for 20% margin)
     * @param minRange - Minimum range for each axis (default: 2)
     * @returns View coordinates {xmin, xmax, ymin, ymax} or null if no visible points
     */
    async calculateAutoZoomCoordinates(padding = 0.2, minRange = 2) {
        this.ensureInitialized();
        this.updateActivity();
        const objectNames = await this.getAllObjectNames();
        const allObjects = [];
        for (const name of objectNames) {
            const info = await this.getObjectInfo(name);
            if (info) {
                allObjects.push(info);
            }
        }
        const visiblePoints = allObjects.filter((obj) => obj.type === 'point' && obj.visible && obj.defined &&
            typeof obj.x === 'number' && typeof obj.y === 'number');
        if (visiblePoints.length === 0) {
            return null;
        }
        let minX = Infinity;
        let maxX = -Infinity;
        let minY = Infinity;
        let maxY = -Infinity;
        for (const point of visiblePoints) {
            minX = Math.min(minX, point.x);
            maxX = Math.max(maxX, point.x);
            minY = Math.min(minY, point.y);
            maxY = Math.max(maxY, point.y);
        }
        let rangeX = maxX - minX;
        let rangeY = maxY - minY;
        // Ensure minimum range
        if (rangeX < minRange) {
            const center = (minX + maxX) / 2;
            minX = center - minRange / 2;
            maxX = center + minRange / 2;
            rangeX = minRange;
        }
        if (rangeY < minRange) {
            const center = (minY + maxY) / 2;
            minY = center - minRange / 2;
            maxY = center + minRange / 2;
            rangeY = minRange;
        }
        // Apply padding
        const padX = rangeX * padding;
        const padY = rangeY * padding;
        return {
            xmin: minX - padX,
            xmax: maxX + padX,
            ymin: minY - padY,
            ymax: maxY + padY
        };
    }
    /**
     * Apply auto-zoom to fit all visible objects
     * @param padding - Padding percentage around objects (default: 0.2 for 20% margin)
     * @param minRange - Minimum range for each axis (default: 2)
     * @returns true if auto-zoom was applied, false if no visible points
     */
    async applyAutoZoom(padding = 0.2, minRange = 2) {
        this.ensureInitialized();
        if (!Number.isFinite(padding) || padding < 0 || padding > 2 || !Number.isFinite(minRange) || minRange <= 0)
            throw new geogebra_1.GeoGebraError('Invalid auto zoom padding or minimum range');
        return this.page.evaluate(async (pad, minimum) => {
            const api = window.ggbApplet;
            if (!api.getAllObjectNames().length)
                return false;
            // Native fitting includes conic extents. Preserve equal coordinate scales.
            api.showAllObjects();
            // GeoGebra animates fitting; read the bounds after that animation settles.
            await new Promise(resolve => setTimeout(resolve, 600));
            const view = JSON.parse(api.getViewProperties(1));
            const spanX = Math.max(view.width * view.invXscale * (1 + 2 * pad), minimum);
            const spanY = Math.max(view.height * view.invYscale * (1 + 2 * pad), minimum);
            const scale = Math.max(spanX / view.width, spanY / view.height);
            const cx = view.xMin + view.width * view.invXscale / 2;
            const cy = view.yMin + view.height * view.invYscale / 2;
            api.setCoordSystem(cx - view.width * scale / 2, cx + view.width * scale / 2, cy - view.height * scale / 2, cy + view.height * scale / 2);
            await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
            return true;
        }, padding, minRange);
    }
    /**
     * Load a GeoGebra construction from a .ggb file
     * @param ggbBase64OrPath - Either base64-encoded .ggb content or file path
     */
    async loadGGB(ggbBase64OrPath) {
        this.ensureInitialized();
        this.updateActivity();
        return this.retryOperation(async () => {
            let ggbBase64 = ggbBase64OrPath;
            // Check if it's a file path (contains path separators or ends with .ggb)
            if (!(/^[A-Za-z0-9+/]+={0,2}$/.test(ggbBase64OrPath) && Buffer.from(ggbBase64OrPath, 'base64').subarray(0, 2).toString() === 'PK')) {
                // It's a file path, read the file
                const fs = await Promise.resolve().then(() => __importStar(require('fs/promises')));
                const path = await Promise.resolve().then(() => __importStar(require('path')));
                // Resolve path relative to workspace or current directory
                const workspaceDir = (0, workspace_1.currentWorkspace)();
                const fullPath = this.validateFilePath(ggbBase64OrPath, workspaceDir);
                try {
                    await fs.access(fullPath);
                }
                catch (error) {
                    throw new Error(`GGB file not found: ${fullPath}`);
                }
                // Read file and convert to base64 (async)
                const buffer = await fs.readFile(fullPath);
                ggbBase64 = buffer.toString('base64');
            }
            // Validate base64 format
            if (!/^[A-Za-z0-9+/]*={0,2}$/.test(ggbBase64)) {
                throw new Error('Invalid base64 format for GGB data');
            }
            await this.page.evaluate((base64Data) => new Promise((resolve, reject) => {
                const timer = setTimeout(() => reject(new Error('GGB load timed out')), 20000);
                try {
                    window.ggbApplet.setBase64(base64Data, () => { clearTimeout(timer); resolve(); });
                }
                catch (error) {
                    clearTimeout(timer);
                    reject(error);
                }
            }), ggbBase64);
            logger_1.default.debug(`GGB file loaded into instance ${this.id}`);
        }, 3, 1000, 'GGB load');
    }
    /**
     * Export animation as GIF or video frames
     * GEB-17: Enhanced with comprehensive applet availability checks
     */
    async exportAnimation(options = {}) {
        this.ensureInitialized();
        this.updateActivity();
        // GEB-17: Validate export readiness before attempting
        const readiness = await this.validateExportReadiness('animation');
        if (!readiness.ready) {
            throw new geogebra_1.GeoGebraError(`Animation export not ready: ${readiness.issues.join(', ')}. Recommendations: ${readiness.recommendations.join(', ')}`);
        }
        const { duration = 5000, // 5 seconds
        frameRate = 10, // 10 fps
        format = 'frames', width, height } = options;
        return this.retryOperation(async () => {
            // GEB-17: Enhanced applet availability and animation readiness check
            const animationCheck = await this.page.evaluate(() => {
                const applet = window.ggbApplet;
                if (!applet) {
                    return { ready: false, error: 'GeoGebra applet not available' };
                }
                if (typeof applet.startAnimation !== 'function' || typeof applet.stopAnimation !== 'function') {
                    return { ready: false, error: 'Animation methods not available on applet' };
                }
                if (typeof applet.isAnimationRunning !== 'function') {
                    return { ready: false, error: 'Animation status method not available' };
                }
                // Check if there are any objects that can be animated
                try {
                    const allObjects = applet.getAllObjectNames();
                    if (!allObjects || allObjects.length === 0) {
                        return { ready: false, error: 'No objects available for animation' };
                    }
                }
                catch (e) {
                    return { ready: false, error: 'Cannot access object list for animation' };
                }
                return { ready: true, error: null };
            });
            if (!animationCheck.ready) {
                throw new Error(`Animation export failed: ${animationCheck.error}`);
            }
            const frameInterval = 1000 / frameRate;
            const totalFrames = Math.ceil(duration / frameInterval);
            const frames = [];
            logger_1.default.debug(`Starting animation capture for instance ${this.id}: ${totalFrames} frames over ${duration}ms`);
            try {
                // Start animation
                await this.page.evaluate(() => {
                    window.ggbApplet.startAnimation();
                });
                // Capture frames
                for (let i = 0; i < totalFrames; i++) {
                    // Wait for frame interval
                    await new Promise(resolve => setTimeout(resolve, frameInterval));
                    // Capture frame as PNG
                    try {
                        const frameData = await this.exportPNG(1, false, 72, width, height);
                        frames.push(frameData);
                        logger_1.default.debug(`Captured frame ${i + 1}/${totalFrames} for instance ${this.id}`);
                    }
                    catch (frameError) {
                        logger_1.default.warn(`Failed to capture frame ${i + 1}/${totalFrames} for instance ${this.id}:`, frameError);
                        // Continue with next frame rather than failing completely
                    }
                }
                // Stop animation
                await this.page.evaluate(() => {
                    window.ggbApplet.stopAnimation();
                });
                if (frames.length === 0) {
                    throw new Error('No frames were successfully captured');
                }
                logger_1.default.debug(`Animation capture completed for instance ${this.id}: ${frames.length} frames captured`);
                if (format === 'frames') {
                    return frames;
                }
                else {
                    // For GIF format, we would need additional processing
                    // For now, return the frames and let the caller handle GIF creation
                    logger_1.default.warn('GIF format not yet implemented, returning frames');
                    return frames;
                }
            }
            catch (error) {
                // Ensure animation is stopped even if capture fails
                try {
                    await this.page.evaluate(() => {
                        window.ggbApplet.stopAnimation();
                    });
                }
                catch (stopError) {
                    logger_1.default.error(`Failed to stop animation after capture error:`, stopError);
                }
                throw error;
            }
        }, 2, 3000, 'Animation export'); // Fewer retries, longer delay for animation
    }
    /**
     * Cleanup resources
     */
    async cleanup() {
        logger_1.default.debug(`Cleaning up GeoGebra instance ${this.id}`);
        try {
            if (this.page && !this.page.isClosed()) {
                await this.page.close();
            }
        }
        catch (error) {
            logger_1.default.error(`Error closing page for instance ${this.id}`, error);
        }
        try {
            if (this.browser) {
                await this.browser.close();
            }
        }
        catch (error) {
            logger_1.default.error(`Error closing browser for instance ${this.id}`, error);
        }
        this.page = undefined;
        this.browser = undefined;
        this.isInitialized = false;
        logger_1.default.debug(`GeoGebra instance ${this.id} cleaned up successfully`);
    }
    /**
     * Get instance state
     */
    getState() {
        return {
            id: this.id,
            isReady: this.isInitialized,
            lastActivity: this.lastActivity,
            config: this.config
        };
    }
    /**
     * GEB-17: Enhanced diagnostic method to check applet health
     */
    async checkAppletHealth() {
        this.ensureInitialized();
        try {
            const healthCheck = await this.page.evaluate(() => {
                const issues = [];
                const applet = window.ggbApplet;
                // Check basic applet availability
                const hasApplet = !!applet;
                if (!hasApplet) {
                    issues.push('GeoGebra applet not found');
                }
                // Check core methods
                const hasEvalCommand = hasApplet && typeof applet.evalCommand === 'function';
                if (!hasEvalCommand) {
                    issues.push('evalCommand method not available');
                }
                // Check export methods
                const hasPNGExport = hasApplet && typeof applet.getPNGBase64 === 'function';
                const hasSVGExport = hasApplet && (typeof applet.exportSVG === 'function' || typeof applet.getSVG === 'function');
                if (!hasPNGExport) {
                    issues.push('PNG export method (getPNGBase64) not available');
                }
                if (!hasSVGExport) {
                    issues.push('SVG export methods not available');
                }
                // Check animation methods
                const hasAnimationMethods = hasApplet &&
                    typeof applet.startAnimation === 'function' &&
                    typeof applet.stopAnimation === 'function';
                if (!hasAnimationMethods) {
                    issues.push('Animation methods not available');
                }
                // Test a simple command to verify functionality
                let commandWorks = false;
                if (hasEvalCommand) {
                    try {
                        // Try a harmless command
                        const result = typeof applet.evalCommand === 'function' && typeof applet.getAllObjectNames === 'function';
                        commandWorks = Boolean(result);
                    }
                    catch (e) {
                        issues.push('Command execution test failed: ' + e.message);
                    }
                }
                return {
                    issues,
                    capabilities: {
                        hasApplet,
                        hasEvalCommand: hasEvalCommand && commandWorks,
                        hasExportMethods: hasPNGExport && hasSVGExport,
                        hasAnimationMethods
                    },
                    exportAvailability: {
                        png: hasPNGExport,
                        svg: hasSVGExport,
                        pdf: hasApplet && typeof applet.exportPDF === 'function'
                    }
                };
            });
            const isHealthy = healthCheck.issues.length === 0;
            return {
                isHealthy,
                ...healthCheck
            };
        }
        catch (error) {
            return {
                isHealthy: false,
                issues: [`Health check failed: ${error instanceof Error ? error.message : String(error)}`],
                capabilities: {
                    hasApplet: false,
                    hasEvalCommand: false,
                    hasExportMethods: false,
                    hasAnimationMethods: false
                },
                exportAvailability: {
                    png: false,
                    svg: false,
                    pdf: false
                }
            };
        }
    }
    /**
     * GEB-17: Enhanced method to validate export readiness before attempting export
     */
    async validateExportReadiness(exportType) {
        this.ensureInitialized();
        const health = await this.checkAppletHealth();
        const issues = [];
        const recommendations = [];
        if (!health.isHealthy) {
            issues.push(...health.issues);
            recommendations.push('Reinitialize the GeoGebra instance');
        }
        // Type-specific checks
        switch (exportType) {
            case 'png':
                if (!health.exportAvailability.png) {
                    issues.push('PNG export method not available');
                    recommendations.push('Check GeoGebra applet initialization');
                }
                break;
            case 'svg':
                if (!health.exportAvailability.svg) {
                    issues.push('SVG export method not available');
                    recommendations.push('Check GeoGebra applet initialization');
                }
                break;
            case 'pdf':
                // PDF uses browser PDF generation, check page availability
                if (!this.page || this.page.isClosed()) {
                    issues.push('Browser page not available for PDF generation');
                    recommendations.push('Reinitialize the browser instance');
                }
                break;
            case 'animation':
                if (!health.capabilities.hasAnimationMethods) {
                    issues.push('Animation methods not available');
                    recommendations.push('Check GeoGebra applet initialization');
                }
                // Check if there are objects to animate
                try {
                    const objects = await this.getAllObjectNames();
                    if (objects.length === 0) {
                        issues.push('No objects available for animation');
                        recommendations.push('Create geometric objects before exporting animation');
                    }
                }
                catch (e) {
                    issues.push('Cannot check for objects to animate');
                }
                break;
        }
        return {
            ready: issues.length === 0,
            issues,
            recommendations
        };
    }
    /**
     * GEB-17: Retry mechanism for failed operations
     */
    async retryOperation(operation, maxRetries = 3, delay = 1000, operationName = 'operation') {
        let lastError;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                logger_1.default.debug(`Attempting ${operationName} (attempt ${attempt}/${maxRetries})`);
                return await operation();
            }
            catch (error) {
                lastError = error;
                logger_1.default.warn(`${operationName} attempt ${attempt} failed:`, error);
                if (attempt < maxRetries) {
                    // Wait before retrying, with exponential backoff
                    const waitTime = delay * Math.pow(2, attempt - 1);
                    logger_1.default.debug(`Waiting ${waitTime}ms before retry`);
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                }
            }
        }
        throw new Error(`${operationName} failed after ${maxRetries} attempts: ${lastError instanceof Error ? lastError.message : String(lastError)}`);
    }
    /**
     * Execute code in the browser context for debugging
     */
    async debugEvaluate(code) {
        this.ensureInitialized();
        if (!this.page) {
            throw new geogebra_1.GeoGebraConnectionError('Page not available');
        }
        return await this.page.evaluate(code);
    }
    /**
     * Update last activity timestamp
     */
    updateActivity() {
        this.lastActivity = new Date();
    }
    /**
     * Ensure instance is initialized
     */
    ensureInitialized() {
        if (!this.isInitialized) {
            throw new geogebra_1.GeoGebraConnectionError('GeoGebra instance not initialized');
        }
    }
    /**
     * Animation Methods
     */
    async setAnimating(objName, animate) {
        this.ensureInitialized();
        this.updateActivity();
        try {
            await this.page.evaluate((objName, animate) => {
                window.ggbApplet.setAnimating(objName, animate);
            }, objName, animate);
            logger_1.default.debug(`Set animating for ${objName} on instance ${this.id}: ${animate}`);
        }
        catch (error) {
            logger_1.default.error(`Failed to set animating for ${objName} on instance ${this.id}`, error);
            throw new geogebra_1.GeoGebraError(`Failed to set animating: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async setAnimationSpeed(objName, speed) {
        this.ensureInitialized();
        this.updateActivity();
        try {
            await this.page.evaluate((objName, speed) => {
                window.ggbApplet.setAnimationSpeed(objName, speed);
            }, objName, speed);
            logger_1.default.debug(`Set animation speed for ${objName} on instance ${this.id}: ${speed}`);
        }
        catch (error) {
            logger_1.default.error(`Failed to set animation speed for ${objName} on instance ${this.id}`, error);
            throw new geogebra_1.GeoGebraError(`Failed to set animation speed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async startAnimation() {
        this.ensureInitialized();
        this.updateActivity();
        try {
            await this.page.evaluate(() => {
                window.ggbApplet.startAnimation();
            });
            logger_1.default.debug(`Started animation on instance ${this.id}`);
        }
        catch (error) {
            logger_1.default.error(`Failed to start animation on instance ${this.id}`, error);
            throw new geogebra_1.GeoGebraError(`Failed to start animation: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async stopAnimation() {
        this.ensureInitialized();
        this.updateActivity();
        try {
            await this.page.evaluate(() => {
                window.ggbApplet.stopAnimation();
            });
            logger_1.default.debug(`Stopped animation on instance ${this.id}`);
        }
        catch (error) {
            logger_1.default.error(`Failed to stop animation on instance ${this.id}`, error);
            throw new geogebra_1.GeoGebraError(`Failed to stop animation: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async isAnimationRunning() {
        this.ensureInitialized();
        this.updateActivity();
        try {
            const isRunning = await this.page.evaluate(() => {
                return window.ggbApplet.isAnimationRunning();
            });
            logger_1.default.debug(`Animation running status on instance ${this.id}: ${isRunning}`);
            return isRunning;
        }
        catch (error) {
            logger_1.default.error(`Failed to check animation status on instance ${this.id}`, error);
            throw new geogebra_1.GeoGebraError(`Failed to check animation status: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async setTrace(objName, flag) {
        this.ensureInitialized();
        this.updateActivity();
        try {
            await this.page.evaluate((objName, flag) => {
                window.ggbApplet.setTrace(objName, flag);
            }, objName, flag);
            logger_1.default.debug(`Set trace for ${objName} on instance ${this.id}: ${flag}`);
        }
        catch (error) {
            logger_1.default.error(`Failed to set trace for ${objName} on instance ${this.id}`, error);
            throw new geogebra_1.GeoGebraError(`Failed to set trace: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async setValue(objName, value) {
        this.ensureInitialized();
        this.updateActivity();
        try {
            await this.page.evaluate((objName, value) => {
                window.ggbApplet.setValue(objName, value);
            }, objName, value);
            logger_1.default.debug(`Set value for ${objName} on instance ${this.id}: ${value}`);
        }
        catch (error) {
            logger_1.default.error(`Failed to set value for ${objName} on instance ${this.id}`, error);
            throw new geogebra_1.GeoGebraError(`Failed to set value: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}
exports.GeoGebraInstance = GeoGebraInstance;
//# sourceMappingURL=geogebra-instance.js.map