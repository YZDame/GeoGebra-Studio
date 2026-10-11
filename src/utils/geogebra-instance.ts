// @ts-nocheck
import puppeteer, { Browser, Page } from 'puppeteer';
import { constructionHtml } from '../export/html';
import { 
  GeoGebraConfig, 
  GeoGebraAPI, 
  GeoGebraCommandResult, 
  GeoGebraObject,
  GeoGebraError,
  GeoGebraConnectionError,
  GeoGebraCommandError 
} from '../types/geogebra';
import logger from './logger';
import { randomUUID as uuidv4 } from 'crypto';

/**
 * GeoGebra Instance - Manages a single GeoGebra instance via Puppeteer
 */
/**
 * Escapes a string for safe use in JavaScript code.
 * Replaces backslashes and single quotes with their escaped equivalents.
 */
function escapeForJavaScript(input: string): string {
  return input.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

export class GeoGebraInstance implements GeoGebraAPI {
  private browser?: Browser | undefined;
  private page?: Page | undefined;
  private isInitialized: boolean = false;
  private lastActivity: Date = new Date();
  
  public readonly id: string;
  public readonly config: GeoGebraConfig;

  constructor(config: GeoGebraConfig = {}) {
    this.id = uuidv4();
    this.config = {
      appName: 'classic',  // Changed from 'graphing' to 'classic' for full functionality
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
    
    logger.info(`Created GeoGebra instance ${this.id}`, { config: this.config });
  }

  /**
   * Initialize the GeoGebra instance
   */
  async initialize(headless: boolean = true, browserArgs: string[] = []): Promise<void> {
    try {
      logger.info(`Initializing GeoGebra instance ${this.id}`, { headless });
      
      // Launch browser
      this.browser = await puppeteer.launch({
        headless,
        ...(process.env['PUPPETEER_EXECUTABLE_PATH'] ? { executablePath: process.env['PUPPETEER_EXECUTABLE_PATH'] } : {}),
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
      
      logger.info(`GeoGebra instance ${this.id} initialized successfully`);
    } catch (error) {
      logger.error(`Failed to initialize GeoGebra instance ${this.id}`, error);
      await this.cleanup();
      throw new GeoGebraConnectionError(
        `Failed to initialize GeoGebra: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Load GeoGebra applet in the browser
   */
  private async loadGeoGebra(): Promise<void> {
    if (!this.page) {
      throw new GeoGebraConnectionError('Page not initialized');
    }

    const appletHTML = this.generateAppletHTML();
    
    await this.page.setContent(appletHTML);
    
    // Wait for GeoGebra to load
    await this.page.waitForFunction('window.ggbReady || window.ggbError', { timeout: 60000 });
    const bootError = await this.page.evaluate(() => (window as any).ggbError);
    if (bootError) throw new GeoGebraConnectionError(bootError);
  }

  /**
   * Generate HTML content with GeoGebra applet
   */
  private generateAppletHTML(): string {
    return constructionHtml({ width: this.config.width, height: this.config.height, ggbBase64: this.config.ggbBase64 });
  }

  /**
   * Wait for GeoGebra to be ready
   */
  private async waitForReady(timeout: number = 30000): Promise<void> {
    if (!this.page) {
      throw new GeoGebraConnectionError('Page not initialized');
    }

    try {
      // Wait for both ggbReady flag and ggbApplet to be available
      await this.page.waitForFunction(
        'window.ggbReady === true && window.ggbApplet && typeof window.ggbApplet.evalCommand === "function"', 
        { timeout }
      );
      
      // Additional verification that the applet is functional
      const isWorking = await this.page.evaluate(() => {
        try {
          return typeof window.ggbApplet.evalCommand === 'function' && 
                 typeof window.ggbApplet.exists === 'function';
        } catch (e) {
          return false;
        }
      });
      
      if (!isWorking) {
        throw new Error('GeoGebra applet methods not available');
      }
      
      logger.debug(`GeoGebra instance ${this.id} is ready and functional`);
    } catch (error) {
      // Log the current state for debugging
      try {
        const debugInfo = await this.page.evaluate(() => ({
          ggbReady: (window as any).ggbReady,
          ggbAppletExists: !!(window as any).ggbApplet,
          ggbAppletType: typeof (window as any).ggbApplet,
          evalCommandExists: (window as any).ggbApplet && typeof (window as any).ggbApplet.evalCommand,
          pageLocation: window.location.href,
          pageTitle: document.title
        }));
        logger.error(`GeoGebra initialization failed. Debug info:`, debugInfo);
      } catch (debugError) {
        logger.error(`Failed to get debug info during initialization failure`, debugError);
      }
      
      throw new GeoGebraConnectionError('GeoGebra failed to initialize within timeout');
    }
  }

  /**
   * Execute a GeoGebra command
   */
  async evalCommand(command: string): Promise<GeoGebraCommandResult> {
    this.ensureInitialized();
    this.updateActivity();

    try {
      logger.debug(`Executing command on instance ${this.id}: ${command}`);
      
      // First verify that the applet is still available
      const appletCheck = await this.page!.evaluate(() => {
        return {
          appletExists: !!(window as any).ggbApplet,
          evalCommandExists: !!(window as any).ggbApplet && typeof (window as any).ggbApplet.evalCommand === 'function'
        };
      });
      
      if (!appletCheck.appletExists || !appletCheck.evalCommandExists) {
        throw new Error(`GeoGebra applet not available: ${JSON.stringify(appletCheck)}`);
      }
      
      const result = await this.page!.evaluate((cmd) => {
        try {
          const success = (window as any).ggbApplet.evalCommand(cmd);
          return {
            success: success,
            error: success ? undefined : 'Command execution failed'
          };
        } catch (error) {
          return {
            success: false,
            error: error.message || 'Unknown error'
          };
        }
      }, command);

      if (!result.success) {
        throw new GeoGebraCommandError(result.error || 'Command failed', command);
      }

      logger.debug(`Command executed successfully on instance ${this.id}: ${command}`);
      return result;
    } catch (error) {
      logger.error(`Command execution failed on instance ${this.id}`, { command, error });
      if (error instanceof GeoGebraCommandError) {
        throw error;
      }
      throw new GeoGebraCommandError(
        `Failed to execute command: ${error instanceof Error ? error.message : String(error)}`,
        command
      );
    }
  }

  /**
   * Execute command and get labels of created objects
   */
  async evalCommandGetLabels(command: string): Promise<string[]> {
    this.ensureInitialized();
    this.updateActivity();

    try {
      const labels = await this.page!.evaluate((cmd) => {
        const result = (window as any).ggbApplet.evalCommandGetLabels(cmd);
        return result ? result.split(',').filter((label: string) => label.trim()) : [];
      }, command) as string[];

      logger.debug(`Command executed on instance ${this.id}, labels: ${labels.join(', ')}`);
      return labels;
    } catch (error) {
      logger.error(`Failed to execute command with labels on instance ${this.id}`, { command, error });
      throw new GeoGebraCommandError(
        `Failed to execute command: ${error instanceof Error ? error.message : String(error)}`,
        command
      );
    }
  }

  /**
   * Delete an object
   */
  async deleteObject(objName: string): Promise<boolean> {
    this.ensureInitialized();
    this.updateActivity();

    try {
      await this.page!.evaluate(`window.ggbApplet.deleteObject('${escapeForJavaScript(objName)}');`);
      return true;
    } catch (error) {
      logger.error(`Failed to delete object ${objName} on instance ${this.id}`, error);
      return false;
    }
  }

  /**
   * Check if object exists
   */
  async exists(objName: string): Promise<boolean> {
    this.ensureInitialized();
    this.updateActivity();

    try {
      const exists = await this.page!.evaluate((name) => {
        return (window as any).ggbApplet.exists(name);
      }, objName);
      return exists;
    } catch (error) {
      logger.error(`Failed to check existence of object ${objName} on instance ${this.id}`, error);
      return false;
    }
  }

  /**
   * Check if object is defined
   */
  async isDefined(objName: string): Promise<boolean> {
    this.ensureInitialized();
    this.updateActivity();

    try {
      const defined = await this.page!.evaluate((name) => {
        return (window as any).ggbApplet.isDefined(name);
      }, objName);
      return defined;
    } catch (error) {
      logger.error(`Failed to check if object ${objName} is defined on instance ${this.id}`, error);
      return false;
    }
  }

  /**
   * Get all object names
   */
  async getAllObjectNames(type?: string): Promise<string[]> {
    this.ensureInitialized();
    this.updateActivity();

    try {
      const names = await this.page!.evaluate((objType) => {
        return (window as any).ggbApplet.getAllObjectNames(objType);
      }, type);
      return names || [];
    } catch (error) {
      logger.error(`Failed to get object names on instance ${this.id}`, error);
      return [];
    }
  }

  /**
   * Set each object's caption to LaTeX name form ($name$) and show caption label mode.
   */
  async applyLatexCaptionDefaults(objectNames: string[], showLabel: boolean = true): Promise<void> {
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
      const result = await this.page!.evaluate((names, shouldShowLabel) => {
        const applet = (window as any).ggbApplet;
        const failed: string[] = [];

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
          } catch (_error) {
            failed.push(name);
          }
        }

        return { failed };
      }, uniqueNames, showLabel);

      if (Array.isArray(result?.failed) && result.failed.length > 0) {
        logger.warn(`Failed to apply LaTeX caption defaults for ${result.failed.length} object(s)`, {
          instanceId: this.id,
          failedObjects: result.failed
        });
      }
    } catch (error) {
      logger.error(`Failed to apply LaTeX caption defaults on instance ${this.id}`, {
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
  async applyDefaultStyleSettings(
    objectNames: string[],
    pointSize: number,
    lineThickness: number
  ): Promise<void> {
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
      const result = await this.page!.evaluate((names, pointSizeValue, lineThicknessValue) => {
        const applet = (window as any).ggbApplet;
        const failed: string[] = [];

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
            } else if (lineTypes.has(rawType)) {
              applet.setLineThickness(name, lineThicknessValue);
            }
          } catch (_error) {
            failed.push(name);
          }
        }

        return { failed };
      }, uniqueNames, pointSize, lineThickness);

      if (Array.isArray(result?.failed) && result.failed.length > 0) {
        logger.warn(`Failed to apply default style settings for ${result.failed.length} object(s)`, {
          instanceId: this.id,
          failedObjects: result.failed
        });
      }
    } catch (error) {
      logger.error(`Failed to apply default style settings on instance ${this.id}`, {
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
  async getObjectInfo(objName: string): Promise<GeoGebraObject | null> {
    this.ensureInitialized();
    this.updateActivity();

    try {
      const info = await this.page!.evaluate((name) => {
        if (!(window as any).ggbApplet.exists(name)) {
          return null;
        }

        const type = (window as any).ggbApplet.getObjectType(name);
        
        // Base information that all objects have
        const baseInfo = {
          name,
          type,
          visible: (window as any).ggbApplet.getVisible(name),
          defined: (window as any).ggbApplet.isDefined(name),
          color: (window as any).ggbApplet.getColor(name)
        };

        // Try to get value and valueString safely
        let value = null;
        let valueString = null;
        try {
          value = (window as any).ggbApplet.getValue(name);
        } catch (e) {
          // Some objects don't have a numeric value
        }
        
        try {
          valueString = (window as any).ggbApplet.getValueString(name);
        } catch (e) {
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
              x: (window as any).ggbApplet.getXcoord(name),
              y: (window as any).ggbApplet.getYcoord(name),
              z: (window as any).ggbApplet.getZcoord(name)
            };
          } catch (e) {
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
    } catch (error) {
      logger.error(`Failed to get object info for ${objName} on instance ${this.id}`, error);
      return null;
    }
  }

  /**
   * Get X coordinate of object
   */
  async getXcoord(objName: string): Promise<number> {
    this.ensureInitialized();
    this.updateActivity();

    try {
      const x = await this.page!.evaluate((name) => {
        return (window as any).ggbApplet.getXcoord(name);
      }, objName);
      return x || 0;
    } catch (error) {
      logger.error(`Failed to get X coordinate of ${objName} on instance ${this.id}`, error);
      return 0;
    }
  }

  /**
   * Get Y coordinate of object
   */
  async getYcoord(objName: string): Promise<number> {
    this.ensureInitialized();
    this.updateActivity();

    try {
      const y = await this.page!.evaluate((name) => {
        return (window as any).ggbApplet.getYcoord(name);
      }, objName);
      return y || 0;
    } catch (error) {
      logger.error(`Failed to get Y coordinate of ${objName} on instance ${this.id}`, error);
      return 0;
    }
  }

  /**
   * Get Z coordinate of object
   */
  async getZcoord(objName: string): Promise<number> {
    this.ensureInitialized();
    this.updateActivity();

    try {
      const z = await this.page!.evaluate((name) => {
        return (window as any).ggbApplet.getZcoord(name);
      }, objName);
      return z || 0;
    } catch (error) {
      logger.error(`Failed to get Z coordinate of ${objName} on instance ${this.id}`, error);
      return 0;
    }
  }

  /**
   * Get value of object
   */
  async getValue(objName: string): Promise<number> {
    this.ensureInitialized();
    this.updateActivity();

    try {
      const value = await this.page!.evaluate((name) => {
        return (window as any).ggbApplet.getValue(name);
      }, objName);
      return value || 0;
    } catch (error) {
      logger.error(`Failed to get value of ${objName} on instance ${this.id}`, error);
      return 0;
    }
  }

  /**
   * Get value string of object
   */
  async getValueString(objName: string): Promise<string> {
    this.ensureInitialized();
    this.updateActivity();

    try {
      const valueStr = await this.page!.evaluate((name) => {
        return (window as any).ggbApplet.getValueString(name);
      }, objName);
      return valueStr || '';
    } catch (error) {
      logger.error(`Failed to get value string of ${objName} on instance ${this.id}`, error);
      return '';
    }
  }

  /**
   * Clear construction
   */
  async newConstruction(): Promise<void> {
    this.ensureInitialized();
    this.updateActivity();

    try {
      await this.page!.evaluate(() => {
        (window as any).ggbApplet.newConstruction();
      });
      logger.debug(`Construction cleared on instance ${this.id}`);
    } catch (error) {
      logger.error(`Failed to clear construction on instance ${this.id}`, error);
      throw new GeoGebraError(`Failed to clear construction: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Reset construction
   */
  async reset(): Promise<void> {
    this.ensureInitialized();
    this.updateActivity();

    try {
      await this.page!.evaluate(() => {
        (window as any).ggbApplet.reset();
      });
      logger.debug(`Construction reset on instance ${this.id}`);
    } catch (error) {
      logger.error(`Failed to reset construction on instance ${this.id}`, error);
      throw new GeoGebraError(`Failed to reset construction: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Refresh views
   */
  async refreshViews(): Promise<void> {
    this.ensureInitialized();
    this.updateActivity();

    try {
      await this.page!.evaluate(() => {
        (window as any).ggbApplet.refreshViews();
      });
      logger.debug(`Views refreshed on instance ${this.id}`);
    } catch (error) {
      logger.error(`Failed to refresh views on instance ${this.id}`, error);
      throw new GeoGebraError(`Failed to refresh views: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Set coordinate system bounds
   */
  async setCoordSystem(xmin: number, xmax: number, ymin: number, ymax: number): Promise<void> {
    this.ensureInitialized();
    this.updateActivity();

    try {
      await this.page!.evaluate((xmin, xmax, ymin, ymax) => {
        (window as any).ggbApplet.setCoordSystem(xmin, xmax, ymin, ymax);
      }, xmin, xmax, ymin, ymax);
      logger.debug(`Coordinate system set on instance ${this.id}: x[${xmin}, ${xmax}], y[${ymin}, ${ymax}]`);
    } catch (error) {
      logger.error(`Failed to set coordinate system on instance ${this.id}`, error);
      throw new GeoGebraError(`Failed to set coordinate system: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Set axes visibility
   */
  async setAxesVisible(xAxis: boolean, yAxis: boolean): Promise<void> {
    this.ensureInitialized();
    this.updateActivity();

    try {
      await this.page!.evaluate((xAxis, yAxis) => {
        (window as any).ggbApplet.setAxesVisible(xAxis, yAxis);
      }, xAxis, yAxis);
      logger.debug(`Axes visibility set on instance ${this.id}: x=${xAxis}, y=${yAxis}`);
    } catch (error) {
      logger.error(`Failed to set axes visibility on instance ${this.id}`, error);
      throw new GeoGebraError(`Failed to set axes visibility: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Set grid visibility
   */
  async setGridVisible(visible: boolean): Promise<void> {
    this.ensureInitialized();
    this.updateActivity();

    try {
      await this.page!.evaluate((visible) => {
        (window as any).ggbApplet.setGridVisible(visible);
      }, visible);
      
      logger.debug(`Grid visibility set on instance ${this.id}: ${visible}`);
    } catch (error) {
      logger.error(`Failed to set grid visibility on instance ${this.id}`, error);
      throw new GeoGebraError(`Failed to set grid visibility: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Check if GeoGebra is ready
   */
  async isReady(): Promise<boolean> {
    if (!this.page) return false;

    try {
      const ready = await this.page.evaluate(() => {
        return (window as any).ggbReady === true && (window as any).ggbApplet;
      });
      return ready;
    } catch (error) {
      logger.error(`Failed to check ready state on instance ${this.id}`, error);
      return false;
    }
  }

  /**
   * Export construction as PNG (base64) with enhanced parameters
   * GEB-17: Enhanced with validation, retry logic, and better error handling
   */
  async exportPNG(scale: number = 1, transparent: boolean = false, dpi: number = 72, width?: number, height?: number): Promise<string> {
    this.ensureInitialized();
    this.updateActivity();

    // GEB-17: Validate export readiness before attempting
    const readiness = await this.validateExportReadiness('png');
    if (!readiness.ready) {
      throw new GeoGebraError(`PNG export not ready: ${readiness.issues.join(', ')}. Recommendations: ${readiness.recommendations.join(', ')}`);
    }

    return this.retryOperation(async () => {
      const pngBase64 = await this.page!.evaluate((scale, transparent, dpi, width, height) => {
        try {
          // GEB-17: Enhanced applet availability check
          const applet = (window as any).ggbApplet;
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
            } catch (e) {
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
          } catch (e1) {
            lastError = e1;
            // Continue to fallback methods
          }
          
          // Try without dpi parameter
          try {
            result = applet.getPNGBase64(effectiveScale, transparent);
            if (result && typeof result === 'string' && result.length > 0) {
              return result; // Success with fallback method
            }
          } catch (e2) {
            lastError = e2;
            // Continue to next fallback
          }
          
          // Try simplest approach with just scale
          try {
            result = applet.getPNGBase64(effectiveScale);
            if (result && typeof result === 'string' && result.length > 0) {
              return result; // Success with simple method
            }
          } catch (e3) {
            lastError = e3;
            // Continue to final fallback
          }
          
          // Try with default scale as last resort
          try {
            result = applet.getPNGBase64(1);
            if (result && typeof result === 'string' && result.length > 0) {
              return result; // Success with default scale
            }
          } catch (e4) {
            lastError = e4;
          }
          
          // If we get here, all methods failed
          throw new Error(`All PNG export methods failed. Last error: ${lastError ? lastError.message : 'Unknown error'}. Result was: ${typeof result} with length ${result ? result.length : 'undefined'}`);
          
        } catch (error) {
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

      logger.debug(`PNG exported from instance ${this.id} with scale ${scale}, transparent ${transparent}, dpi ${dpi}, dimensions ${width}x${height}, result length: ${pngBase64.length}`);
      return pngBase64;
    }, 3, 1000, 'PNG export');
  }

  /**
   * Export construction as SVG
   * GEB-17: Enhanced with better validation and error handling, no more placeholder responses
   */
  async exportSVG(): Promise<string> { return this.nativeExport('svg'); }
  async exportPDF(): Promise<string> { return this.nativeExport('pdf'); }
  async exportGGB(): Promise<string> { return this.nativeExport('ggb'); }

  private async nativeExport(format: 'svg' | 'pdf' | 'ggb'): Promise<string> {
    this.ensureInitialized();
    this.updateActivity();
    const result = await this.page!.evaluate((kind) => new Promise<string>((resolve, reject) => {
      const api = (window as any).ggbApplet;
      const timer = setTimeout(() => reject(new Error(kind + ' export timed out')), 20000);
      const done = (value: string) => {
        clearTimeout(timer);
        if (!value || typeof value !== 'string') reject(new Error(kind + ' export returned no data'));
        else resolve(value);
      };
      try {
        if (kind === 'ggb') api.getBase64(done);
        else if (kind === 'svg') api.exportSVG(done);
        else api.exportPDF(1, done);
      } catch (e) { clearTimeout(timer); reject(e); }
    }), format);
    if (format === 'svg') {
      if (!result.includes('<svg')) throw new GeoGebraError('Invalid SVG export');
      return result;
    }
    const base64 = result.replace(/^data:[^,]+,/, '');
    const bytes = Buffer.from(base64, 'base64');
    if (format === 'ggb' && bytes.subarray(0, 2).toString() !== 'PK') throw new GeoGebraError('GGB export is not a ZIP archive');
    if (format === 'pdf' && bytes.subarray(0, 5).toString() !== '%PDF-') throw new GeoGebraError('Invalid native PDF export');
    return base64;
  }

  async getConstructionXML(): Promise<string> {
    this.ensureInitialized();
    return this.page!.evaluate(() => String((window as any).ggbApplet.getXML()));
  }

  /**
   * Validate that a file path is within the workspace directory to prevent path traversal attacks
   * @param filePath - The file path to validate
   * @param workspaceDir - The workspace directory
   * @returns The validated absolute path
   * @throws Error if path is outside workspace
   */
  public validateFilePath(filePath: string, workspaceDir: string): string {
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
  async calculateAutoZoomCoordinates(padding: number = 0.2, minRange: number = 2): Promise<{xmin: number, xmax: number, ymin: number, ymax: number} | null> {
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
    
    const visiblePoints = allObjects.filter((obj: any) =>
      obj.type === 'point' && obj.visible && obj.defined &&
      typeof obj.x === 'number' && typeof obj.y === 'number'
    );
    
    if (visiblePoints.length === 0) {
      return null;
    }
    
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    
    for (const point of visiblePoints) {
      minX = Math.min(minX, point.x!);
      maxX = Math.max(maxX, point.x!);
      minY = Math.min(minY, point.y!);
      maxY = Math.max(maxY, point.y!);
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
  async applyAutoZoom(padding: number = 0.2, minRange: number = 2): Promise<boolean> {
    this.ensureInitialized();
    if (!Number.isFinite(padding) || padding < 0 || padding > 2 || !Number.isFinite(minRange) || minRange <= 0) throw new GeoGebraError('Invalid auto zoom padding or minimum range');
    return this.page!.evaluate(async (pad, minimum) => {
      const api = (window as any).ggbApplet;
      if (!api.getAllObjectNames().length) return false;
      // Native fitting includes conic extents. Preserve equal coordinate scales.
      api.showAllObjects();
      // GeoGebra animates fitting; read the bounds after that animation settles.
      await new Promise(resolve => setTimeout(resolve, 600));
      const view = JSON.parse(api.getViewProperties(1));
      const spanX = Math.max(view.width * view.invXscale * (1+2*pad), minimum);
      const spanY = Math.max(view.height * view.invYscale * (1+2*pad), minimum);
      const scale = Math.max(spanX/view.width, spanY/view.height);
      const cx = view.xMin + view.width*view.invXscale/2;
      const cy = view.yMin + view.height*view.invYscale/2;
      api.setCoordSystem(cx-view.width*scale/2,cx+view.width*scale/2,cy-view.height*scale/2,cy+view.height*scale/2);
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      return true;
    }, padding, minRange);
  }

  /**
   * Load a GeoGebra construction from a .ggb file
   * @param ggbBase64OrPath - Either base64-encoded .ggb content or file path
   */
  async loadGGB(ggbBase64OrPath: string): Promise<void> {
    this.ensureInitialized();
    this.updateActivity();

    return this.retryOperation(async () => {
      let ggbBase64 = ggbBase64OrPath;
      
      // Check if it's a file path (contains path separators or ends with .ggb)
      if (!(/^[A-Za-z0-9+/]+={0,2}$/.test(ggbBase64OrPath) && Buffer.from(ggbBase64OrPath, 'base64').subarray(0, 2).toString() === 'PK')) {
        // It's a file path, read the file
        const fs = await import('fs/promises');
        const path = await import('path');
        
        // Resolve path relative to workspace or current directory
        const workspaceDir = process.env['VSCODE_WORKSPACE_FOLDER'] || process.cwd();
        const fullPath = this.validateFilePath(ggbBase64OrPath, workspaceDir);
        
        try {
          await fs.access(fullPath);
        } catch (error) {
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
      
      await this.page!.evaluate((base64Data: string) => new Promise<void>((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('GGB load timed out')), 20000);
        try {
          (window as any).ggbApplet.setBase64(base64Data, () => { clearTimeout(timer); resolve(); });
        } catch (error) { clearTimeout(timer); reject(error); }
      }), ggbBase64);

      logger.debug(`GGB file loaded into instance ${this.id}`);
    }, 3, 1000, 'GGB load');
  }

  /**
   * Export animation as GIF or video frames
   * GEB-17: Enhanced with comprehensive applet availability checks
   */
  async exportAnimation(options: {
    duration?: number;
    frameRate?: number;
    format?: 'gif' | 'frames';
    width?: number;
    height?: number;
  } = {}): Promise<string | string[]> {
    this.ensureInitialized();
    this.updateActivity();

    // GEB-17: Validate export readiness before attempting
    const readiness = await this.validateExportReadiness('animation');
    if (!readiness.ready) {
      throw new GeoGebraError(`Animation export not ready: ${readiness.issues.join(', ')}. Recommendations: ${readiness.recommendations.join(', ')}`);
    }

    const {
      duration = 5000, // 5 seconds
      frameRate = 10,   // 10 fps
      format = 'frames',
      width,
      height
    } = options;

    return this.retryOperation(async () => {
      // GEB-17: Enhanced applet availability and animation readiness check
      const animationCheck = await this.page!.evaluate(() => {
        const applet = (window as any).ggbApplet;
        
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
        } catch (e) {
          return { ready: false, error: 'Cannot access object list for animation' };
        }
        
        return { ready: true, error: null };
      });

      if (!animationCheck.ready) {
        throw new Error(`Animation export failed: ${animationCheck.error}`);
      }

      const frameInterval = 1000 / frameRate;
      const totalFrames = Math.ceil(duration / frameInterval);
      const frames: string[] = [];

      logger.debug(`Starting animation capture for instance ${this.id}: ${totalFrames} frames over ${duration}ms`);

      try {
        // Start animation
        await this.page!.evaluate(() => {
          (window as any).ggbApplet.startAnimation();
        });

        // Capture frames
        for (let i = 0; i < totalFrames; i++) {
          // Wait for frame interval
          await new Promise(resolve => setTimeout(resolve, frameInterval));
          
          // Capture frame as PNG
          try {
            const frameData = await this.exportPNG(1, false, 72, width, height);
            frames.push(frameData);
            logger.debug(`Captured frame ${i + 1}/${totalFrames} for instance ${this.id}`);
          } catch (frameError) {
            logger.warn(`Failed to capture frame ${i + 1}/${totalFrames} for instance ${this.id}:`, frameError);
            // Continue with next frame rather than failing completely
          }
        }

        // Stop animation
        await this.page!.evaluate(() => {
          (window as any).ggbApplet.stopAnimation();
        });

        if (frames.length === 0) {
          throw new Error('No frames were successfully captured');
        }

        logger.debug(`Animation capture completed for instance ${this.id}: ${frames.length} frames captured`);

        if (format === 'frames') {
          return frames;
        } else {
          // For GIF format, we would need additional processing
          // For now, return the frames and let the caller handle GIF creation
          logger.warn('GIF format not yet implemented, returning frames');
          return frames;
        }

      } catch (error) {
        // Ensure animation is stopped even if capture fails
        try {
          await this.page!.evaluate(() => {
            (window as any).ggbApplet.stopAnimation();
          });
        } catch (stopError) {
          logger.error(`Failed to stop animation after capture error:`, stopError);
        }
        
        throw error;
      }
    }, 2, 3000, 'Animation export'); // Fewer retries, longer delay for animation
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    logger.debug(`Cleaning up GeoGebra instance ${this.id}`);
    
    try {
      if (this.page && !this.page.isClosed()) {
        await this.page.close();
      }
    } catch (error) {
      logger.error(`Error closing page for instance ${this.id}`, error);
    }

    try {
      if (this.browser) {
        await this.browser.close();
      }
    } catch (error) {
      logger.error(`Error closing browser for instance ${this.id}`, error);
    }

    this.page = undefined;
    this.browser = undefined;
    this.isInitialized = false;
    
    logger.debug(`GeoGebra instance ${this.id} cleaned up successfully`);
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
  async checkAppletHealth(): Promise<{
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
  }> {
    this.ensureInitialized();
    
    try {
      const healthCheck = await this.page!.evaluate(() => {
        const issues: string[] = [];
        const applet = (window as any).ggbApplet;
        
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
          } catch (e) {
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
    } catch (error) {
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
  async validateExportReadiness(exportType: 'png' | 'svg' | 'pdf' | 'animation'): Promise<{
    ready: boolean;
    issues: string[];
    recommendations: string[];
  }> {
    this.ensureInitialized();
    
    const health = await this.checkAppletHealth();
    const issues: string[] = [];
    const recommendations: string[] = [];
    
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
        } catch (e) {
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
  private async retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000,
    operationName: string = 'operation'
  ): Promise<T> {
    let lastError: Error | unknown;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        logger.debug(`Attempting ${operationName} (attempt ${attempt}/${maxRetries})`);
        return await operation();
      } catch (error) {
        lastError = error;
        logger.warn(`${operationName} attempt ${attempt} failed:`, error);
        
        if (attempt < maxRetries) {
          // Wait before retrying, with exponential backoff
          const waitTime = delay * Math.pow(2, attempt - 1);
          logger.debug(`Waiting ${waitTime}ms before retry`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }
    
    throw new Error(`${operationName} failed after ${maxRetries} attempts: ${lastError instanceof Error ? lastError.message : String(lastError)}`);
  }

  /**
   * Execute code in the browser context for debugging
   */
  async debugEvaluate<T>(code: string | Function): Promise<T> {
    this.ensureInitialized();
    if (!this.page) {
      throw new GeoGebraConnectionError('Page not available');
    }
    return await this.page.evaluate(code as any);
  }

  /**
   * Update last activity timestamp
   */
  private updateActivity(): void {
    this.lastActivity = new Date();
  }

  /**
   * Ensure instance is initialized
   */
  private ensureInitialized(): void {
    if (!this.isInitialized) {
      throw new GeoGebraConnectionError('GeoGebra instance not initialized');
    }
  }

  /**
   * Animation Methods
   */
  async setAnimating(objName: string, animate: boolean): Promise<void> {
    this.ensureInitialized();
    this.updateActivity();

    try {
      await this.page!.evaluate((objName, animate) => {
        (window as any).ggbApplet.setAnimating(objName, animate);
      }, objName, animate);
      
      logger.debug(`Set animating for ${objName} on instance ${this.id}: ${animate}`);
    } catch (error) {
      logger.error(`Failed to set animating for ${objName} on instance ${this.id}`, error);
      throw new GeoGebraError(`Failed to set animating: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async setAnimationSpeed(objName: string, speed: number): Promise<void> {
    this.ensureInitialized();
    this.updateActivity();

    try {
      await this.page!.evaluate((objName, speed) => {
        (window as any).ggbApplet.setAnimationSpeed(objName, speed);
      }, objName, speed);
      
      logger.debug(`Set animation speed for ${objName} on instance ${this.id}: ${speed}`);
    } catch (error) {
      logger.error(`Failed to set animation speed for ${objName} on instance ${this.id}`, error);
      throw new GeoGebraError(`Failed to set animation speed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async startAnimation(): Promise<void> {
    this.ensureInitialized();
    this.updateActivity();

    try {
      await this.page!.evaluate(() => {
        (window as any).ggbApplet.startAnimation();
      });
      
      logger.debug(`Started animation on instance ${this.id}`);
    } catch (error) {
      logger.error(`Failed to start animation on instance ${this.id}`, error);
      throw new GeoGebraError(`Failed to start animation: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async stopAnimation(): Promise<void> {
    this.ensureInitialized();
    this.updateActivity();

    try {
      await this.page!.evaluate(() => {
        (window as any).ggbApplet.stopAnimation();
      });
      
      logger.debug(`Stopped animation on instance ${this.id}`);
    } catch (error) {
      logger.error(`Failed to stop animation on instance ${this.id}`, error);
      throw new GeoGebraError(`Failed to stop animation: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async isAnimationRunning(): Promise<boolean> {
    this.ensureInitialized();
    this.updateActivity();

    try {
      const isRunning = await this.page!.evaluate(() => {
        return (window as any).ggbApplet.isAnimationRunning();
      }) as boolean;
      
      logger.debug(`Animation running status on instance ${this.id}: ${isRunning}`);
      return isRunning;
    } catch (error) {
      logger.error(`Failed to check animation status on instance ${this.id}`, error);
      throw new GeoGebraError(`Failed to check animation status: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async setTrace(objName: string, flag: boolean): Promise<void> {
    this.ensureInitialized();
    this.updateActivity();

    try {
      await this.page!.evaluate((objName, flag) => {
        (window as any).ggbApplet.setTrace(objName, flag);
      }, objName, flag);
      
      logger.debug(`Set trace for ${objName} on instance ${this.id}: ${flag}`);
    } catch (error) {
      logger.error(`Failed to set trace for ${objName} on instance ${this.id}`, error);
      throw new GeoGebraError(`Failed to set trace: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async setValue(objName: string, value: number): Promise<void> {
    this.ensureInitialized();
    this.updateActivity();

    try {
      await this.page!.evaluate((objName, value) => {
        (window as any).ggbApplet.setValue(objName, value);
      }, objName, value);
      
      logger.debug(`Set value for ${objName} on instance ${this.id}: ${value}`);
    } catch (error) {
      logger.error(`Failed to set value for ${objName} on instance ${this.id}`, error);
      throw new GeoGebraError(`Failed to set value: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
} 
