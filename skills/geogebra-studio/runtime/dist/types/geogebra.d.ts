/**
 * GeoGebra Integration Types
 * Type definitions for GeoGebra Apps API integration
 */
export interface GeoGebraConfig {
    appName?: 'graphing' | 'geometry' | '3d' | 'classic' | 'suite' | 'evaluator' | 'scientific' | 'notes';
    width?: number;
    height?: number;
    showMenuBar?: boolean;
    showToolBar?: boolean;
    showAlgebraInput?: boolean;
    showResetIcon?: boolean;
    enableRightClick?: boolean;
    enableLabelDrags?: boolean;
    enableShiftDragZoom?: boolean;
    language?: string;
    material_id?: string;
    filename?: string;
    ggbBase64?: string;
}
export interface GeoGebraCommandResult {
    success: boolean;
    result?: string | number | boolean;
    labels?: string[];
    error?: string;
    objects?: string[];
}
export interface GeoGebraObject {
    name: string;
    type: string;
    value?: string | number;
    visible: boolean;
    defined: boolean;
    x?: number;
    y?: number;
    z?: number;
    color?: string;
}
export interface GeoGebraInstanceState {
    id: string;
    isReady: boolean;
    objectCount: number;
    lastActivity: Date;
    config: GeoGebraConfig;
}
export interface GeoGebraPoolConfig {
    maxInstances: number;
    instanceTimeout: number;
    maxIdleTime: number;
    headless: boolean;
    browserArgs?: string[];
}
export interface GeoGebraAPI {
    evalCommand(command: string): Promise<GeoGebraCommandResult>;
    evalCommandGetLabels(command: string): Promise<string[]>;
    deleteObject(objName: string): Promise<boolean>;
    exists(objName: string): Promise<boolean>;
    isDefined(objName: string): Promise<boolean>;
    getAllObjectNames(type?: string): Promise<string[]>;
    getObjectInfo(objName: string): Promise<GeoGebraObject | null>;
    getXcoord(objName: string): Promise<number>;
    getYcoord(objName: string): Promise<number>;
    getZcoord(objName: string): Promise<number>;
    getValue(objName: string): Promise<number>;
    getValueString(objName: string): Promise<string>;
    newConstruction(): Promise<void>;
    reset(): Promise<void>;
    refreshViews(): Promise<void>;
    setCoordSystem(xmin: number, xmax: number, ymin: number, ymax: number): Promise<void>;
    setAxesVisible(xAxis: boolean, yAxis: boolean): Promise<void>;
    setGridVisible(visible: boolean): Promise<void>;
    setAnimating(objName: string, animate: boolean): Promise<void>;
    setAnimationSpeed(objName: string, speed: number): Promise<void>;
    startAnimation(): Promise<void>;
    stopAnimation(): Promise<void>;
    isAnimationRunning(): Promise<boolean>;
    setTrace(objName: string, flag: boolean): Promise<void>;
    setValue(objName: string, value: number): Promise<void>;
    isReady(): Promise<boolean>;
    cleanup(): Promise<void>;
    exportPNG(scale?: number, transparent?: boolean, dpi?: number, width?: number, height?: number): Promise<string>;
    exportSVG(): Promise<string>;
    exportPDF(): Promise<string>;
    exportAnimation(options?: {
        duration?: number;
        frameRate?: number;
        format?: 'gif' | 'frames';
        width?: number;
        height?: number;
    }): Promise<string | string[]>;
}
export declare class GeoGebraError extends Error {
    code?: string | undefined;
    constructor(message: string, code?: string | undefined);
}
export declare class GeoGebraConnectionError extends GeoGebraError {
    constructor(message: string);
}
export declare class GeoGebraCommandError extends GeoGebraError {
    command?: string | undefined;
    constructor(message: string, command?: string | undefined);
}
//# sourceMappingURL=geogebra.d.ts.map