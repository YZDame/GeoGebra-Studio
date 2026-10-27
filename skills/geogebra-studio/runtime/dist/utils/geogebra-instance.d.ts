import { GeoGebraConfig, GeoGebraAPI, GeoGebraCommandResult, GeoGebraObject } from '../types/geogebra';
export declare class GeoGebraInstance implements GeoGebraAPI {
    private browser?;
    private page?;
    private isInitialized;
    private lastActivity;
    readonly id: string;
    readonly config: GeoGebraConfig;
    constructor(config?: GeoGebraConfig);
    /**
     * Initialize the GeoGebra instance
     */
    initialize(headless?: boolean, browserArgs?: string[]): Promise<void>;
    /**
     * Load GeoGebra applet in the browser
     */
    private loadGeoGebra;
    /**
     * Generate HTML content with GeoGebra applet
     */
    private generateAppletHTML;
    /**
     * Wait for GeoGebra to be ready
     */
    private waitForReady;
    /**
     * Execute a GeoGebra command
     */
    evalCommand(command: string): Promise<GeoGebraCommandResult>;
    /**
     * Execute command and get labels of created objects
     */
    evalCommandGetLabels(command: string): Promise<string[]>;
    /** Invoke a documented GeoGebra Apps API method against the live applet. */
    callAppsApi(method: string, args?: unknown[], options?: {
        waitForCallbackIndex?: number;
        callbackTimeoutMs?: number;
        callbacks?: Array<{
            argumentIndex: number;
            id: string;
        }>;
    }): Promise<unknown>;
    readAppsApiCallbackEvents(id: string, clear?: boolean): Promise<unknown[][]>;
    /** Enumerate callable methods exposed by the currently loaded official applet API. */
    listAppsApiMethods(): Promise<string[]>;
    /**
     * Delete an object
     */
    deleteObject(objName: string): Promise<boolean>;
    /**
     * Check if object exists
     */
    exists(objName: string): Promise<boolean>;
    /**
     * Check if object is defined
     */
    isDefined(objName: string): Promise<boolean>;
    /**
     * Get all object names
     */
    getAllObjectNames(type?: string): Promise<string[]>;
    /**
     * Set each object's caption to LaTeX name form ($name$) and show caption label mode.
     */
    applyLatexCaptionDefaults(objectNames: string[], showLabel?: boolean): Promise<void>;
    /**
     * Apply default visual style settings to objects.
     * - Point-like objects: point size
     * - Line-like objects: line thickness
     */
    applyDefaultStyleSettings(objectNames: string[], pointSize: number, lineThickness: number): Promise<void>;
    /**
     * Get object information
     */
    getObjectInfo(objName: string): Promise<GeoGebraObject | null>;
    /**
     * Get X coordinate of object
     */
    getXcoord(objName: string): Promise<number>;
    /**
     * Get Y coordinate of object
     */
    getYcoord(objName: string): Promise<number>;
    /**
     * Get Z coordinate of object
     */
    getZcoord(objName: string): Promise<number>;
    /**
     * Get value of object
     */
    getValue(objName: string): Promise<number>;
    /**
     * Get value string of object
     */
    getValueString(objName: string): Promise<string>;
    /**
     * Clear construction
     */
    newConstruction(): Promise<void>;
    /**
     * Reset construction
     */
    reset(): Promise<void>;
    /**
     * Refresh views
     */
    refreshViews(): Promise<void>;
    /**
     * Set coordinate system bounds
     */
    setCoordSystem(xmin: number, xmax: number, ymin: number, ymax: number): Promise<void>;
    /**
     * Set axes visibility
     */
    setAxesVisible(xAxis: boolean, yAxis: boolean): Promise<void>;
    /**
     * Set grid visibility
     */
    setGridVisible(visible: boolean): Promise<void>;
    /**
     * Check if GeoGebra is ready
     */
    isReady(): Promise<boolean>;
    /**
     * Export construction as PNG (base64) with enhanced parameters
     * GEB-17: Enhanced with validation, retry logic, and better error handling
     */
    exportPNG(scale?: number, transparent?: boolean, dpi?: number, width?: number, height?: number): Promise<string>;
    /**
     * Export construction as SVG
     * GEB-17: Enhanced with better validation and error handling, no more placeholder responses
     */
    /** Raw PGF is internal input to the mandatory Gikz pipeline. */
    exportNativeTikZ(): Promise<string>;
    exportSVG(): Promise<string>;
    exportPDF(): Promise<string>;
    exportGGB(): Promise<string>;
    private nativeExport;
    /** Load a generated viewer and wait for its native applet and responsive layout. */
    renderHtml(html: string): Promise<void>;
    capturePreview(): Promise<Uint8Array>;
    getConstructionXML(): Promise<string>;
    /**
     * Validate that a file path is within the workspace directory to prevent path traversal attacks
     * @param filePath - The file path to validate
     * @param workspaceDir - The workspace directory
     * @returns The validated absolute path
     * @throws Error if path is outside workspace
     */
    validateFilePath(filePath: string, workspaceDir: string): string;
    /**
     * Calculate optimal view coordinates to fit all visible objects
     * @param padding - Padding percentage around objects (default: 0.2 for 20% margin)
     * @param minRange - Minimum range for each axis (default: 2)
     * @returns View coordinates {xmin, xmax, ymin, ymax} or null if no visible points
     */
    calculateAutoZoomCoordinates(padding?: number, minRange?: number): Promise<{
        xmin: number;
        xmax: number;
        ymin: number;
        ymax: number;
    } | null>;
    /**
     * Apply auto-zoom to fit all visible objects
     * @param padding - Padding percentage around objects (default: 0.2 for 20% margin)
     * @param minRange - Minimum range for each axis (default: 2)
     * @returns true if auto-zoom was applied, false if no visible points
     */
    applyAutoZoom(padding?: number, minRange?: number): Promise<boolean>;
    /**
     * Load a GeoGebra construction from a .ggb file
     * @param ggbBase64OrPath - Either base64-encoded .ggb content or file path
     */
    loadGGB(ggbBase64OrPath: string): Promise<void>;
    /**
     * Export animation as GIF or video frames
     * GEB-17: Enhanced with comprehensive applet availability checks
     */
    exportAnimation(options?: {
        duration?: number;
        frameRate?: number;
        format?: 'gif' | 'frames';
        width?: number;
        height?: number;
    }): Promise<string | string[]>;
    /**
     * Cleanup resources
     */
    cleanup(): Promise<void>;
    /**
     * Get instance state
     */
    getState(): {
        id: string;
        isReady: boolean;
        lastActivity: Date;
        config: GeoGebraConfig;
    };
    /**
     * GEB-17: Enhanced diagnostic method to check applet health
     */
    checkAppletHealth(): Promise<{
        isHealthy: boolean;
        issues: string[];
        capabilities: {
            hasApplet: boolean;
            hasEvalCommand: boolean;
            hasExportMethods: boolean;
            hasAnimationMethods: boolean;
        };
        exportAvailability: {
            png: boolean;
            svg: boolean;
            pdf: boolean;
        };
    }>;
    /**
     * GEB-17: Enhanced method to validate export readiness before attempting export
     */
    validateExportReadiness(exportType: 'png' | 'svg' | 'pdf' | 'animation'): Promise<{
        ready: boolean;
        issues: string[];
        recommendations: string[];
    }>;
    /**
     * GEB-17: Retry mechanism for failed operations
     */
    private retryOperation;
    /**
     * Execute code in the browser context for debugging
     */
    debugEvaluate<T>(code: string | Function): Promise<T>;
    /**
     * Update last activity timestamp
     */
    private updateActivity;
    /**
     * Ensure instance is initialized
     */
    private ensureInitialized;
    /**
     * Animation Methods
     */
    setAnimating(objName: string, animate: boolean): Promise<void>;
    setAnimationSpeed(objName: string, speed: number): Promise<void>;
    startAnimation(): Promise<void>;
    stopAnimation(): Promise<void>;
    isAnimationRunning(): Promise<boolean>;
    setTrace(objName: string, flag: boolean): Promise<void>;
    setValue(objName: string, value: number): Promise<void>;
}
//# sourceMappingURL=geogebra-instance.d.ts.map