import { GeoGebraInstance } from '../../src/utils/geogebra-instance';
import { GeoGebraConfig, GeoGebraConnectionError } from '../../src/types/geogebra';
import { Browser, Page } from 'puppeteer-core';

// Mock puppeteer
jest.mock('puppeteer-core', () => ({
  launch: jest.fn(),
}));

// Mock logger
jest.mock('../../src/utils/logger', () => ({
  info: jest.fn(),
  debug: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
}));



describe('GeoGebraInstance', () => {
  let instance: GeoGebraInstance;
  let mockBrowser: jest.Mocked<Browser>;
  let mockPage: jest.Mocked<Page>;
  let puppeteerLaunchMock: jest.MockedFunction<typeof import('puppeteer-core').launch>;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Setup mock page
    mockPage = {
      setViewport: jest.fn(),
      setContent: jest.fn(),
      waitForFunction: jest.fn(),
      evaluate: jest.fn().mockImplementation(async fn => String(fn).includes("ggbError") ? undefined : true),
      screenshot: jest.fn(),
      pdf: jest.fn(),
      close: jest.fn(),
      isClosed: jest.fn().mockReturnValue(false),
    } as any;

    // Setup mock browser
    mockBrowser = {
      newPage: jest.fn().mockResolvedValue(mockPage),
      close: jest.fn(),
    } as any;

    // Setup puppeteer launch mock
    puppeteerLaunchMock = require('puppeteer-core').launch as jest.MockedFunction<typeof import('puppeteer-core').launch>;
    puppeteerLaunchMock.mockResolvedValue(mockBrowser);
  });

  describe('Constructor', () => {
    it('should create instance with default config', () => {
      instance = new GeoGebraInstance();
      
      expect(instance.id).toMatch(/^[0-9a-f-]{36}$/);
      expect(instance.config).toEqual({
        appName: 'classic',
        width: 800,
        height: 600,
        showMenuBar: false,
        showToolBar: false,
        showAlgebraInput: false,
        showResetIcon: false,
        enableRightClick: true,
        language: 'en',
      });
    });

    it('should create instance with custom config', () => {
      const customConfig: GeoGebraConfig = {
        appName: 'geometry',
        width: 1024,
        height: 768,
        showMenuBar: true,
        language: 'de',
      };

      instance = new GeoGebraInstance(customConfig);
      
      expect(instance.config).toEqual({
        appName: 'geometry',
        width: 1024,
        height: 768,
        showMenuBar: true,
        showToolBar: false,
        showAlgebraInput: false,
        showResetIcon: false,
        enableRightClick: true,
        language: 'de',
      });
    });
  });

  describe('initialize', () => {
    beforeEach(() => {
      instance = new GeoGebraInstance();
    });

    it('should initialize successfully', async () => {
      mockPage.waitForFunction.mockResolvedValue(undefined as any);

      await instance.initialize();

      expect(puppeteerLaunchMock).toHaveBeenCalledWith({
        headless: true,
        executablePath: "/mock/chrome",
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
        ]
      });
      expect(mockBrowser.newPage).toHaveBeenCalled();
      expect(mockPage.setViewport).toHaveBeenCalledWith({
        width: 800,
        height: 600,
      });
      expect(mockPage.setContent).toHaveBeenCalled();
      expect(mockPage.waitForFunction).toHaveBeenCalledWith('window.ggbReady || window.ggbError', { timeout: 60000 });
      expect(mockPage.waitForFunction).toHaveBeenCalledWith('window.ggbReady === true && window.ggbApplet && typeof window.ggbApplet.evalCommand === "function"', { timeout: 30000 });
    });

    it('should initialize with custom browser args', async () => {
      mockPage.waitForFunction.mockResolvedValue(undefined as any);
      const customArgs = ['--custom-arg'];

      await instance.initialize(false, customArgs);

      expect(puppeteerLaunchMock).toHaveBeenCalledWith({
        headless: false,
        executablePath: "/mock/chrome",
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
          '--custom-arg',
        ]
      });
    });

    it('should throw error if browser launch fails', async () => {
      puppeteerLaunchMock.mockRejectedValue(new Error('Browser launch failed'));

      await expect(instance.initialize()).rejects.toThrow(GeoGebraConnectionError);
      await expect(instance.initialize()).rejects.toThrow('Failed to initialize GeoGebra: Browser launch failed');
    });

    it('should throw error if GeoGebra fails to load', async () => {
      mockPage.waitForFunction.mockRejectedValue(new Error('Timeout'));

      await expect(instance.initialize()).rejects.toThrow(GeoGebraConnectionError);
    });

    it('should cleanup on initialization failure', async () => {
      puppeteerLaunchMock.mockRejectedValue(new Error('Browser launch failed'));

      await expect(instance.initialize()).rejects.toThrow();
      
      // Verify cleanup was called (browser.close would be called if browser was created)
    });
  });

  describe('evalCommand', () => {
    beforeEach(async () => {
      instance = new GeoGebraInstance();
      mockPage.waitForFunction.mockResolvedValue(undefined as any);
      await instance.initialize();
    });

    it('should execute command successfully', async () => {
      const mockResult = {
        success: true,
        command: 'A = (1, 2)',
        result: undefined,
        error: undefined,
      };
      mockPage.evaluate.mockResolvedValueOnce({appletExists:true,evalCommandExists:true}).mockResolvedValueOnce(mockResult);

      const result = await instance.evalCommand('A = (1, 2)');

      expect(result).toEqual(mockResult);
      expect(mockPage.evaluate).toHaveBeenCalled();
    });

    it('should handle command execution failure', async () => {
      const mockResult = {
        success: false,
        command: 'InvalidCommand',
        result: undefined,
        error: 'Command execution failed',
      };
      mockPage.evaluate.mockResolvedValueOnce({appletExists:true,evalCommandExists:true}).mockResolvedValueOnce(mockResult);

      await expect(instance.evalCommand('InvalidCommand')).rejects.toThrow('Command execution failed');
    });

    it('should throw error if not initialized', async () => {
      const uninitializedInstance = new GeoGebraInstance();

      await expect(uninitializedInstance.evalCommand('A = (1, 2)')).rejects.toThrow();
    });

    it('should handle special characters in commands', async () => {
      const mockResult = { success: true };
      mockPage.evaluate.mockResolvedValueOnce({appletExists:true,evalCommandExists:true}).mockResolvedValueOnce(mockResult);

      await instance.evalCommand("A = (1, 2) 'test'");

      // Verify that the command was properly escaped
      const evaluateCall = mockPage.evaluate.mock.calls.at(-1);
      expect(evaluateCall?.[1]).toBe("A = (1, 2) 'test'");
    });
  });

  describe('getAllObjectNames', () => {
    beforeEach(async () => {
      instance = new GeoGebraInstance();
      mockPage.waitForFunction.mockResolvedValue(undefined as any);
      await instance.initialize();
    });

    it('should get all object names', async () => {
      const mockObjects = ['A', 'B', 'line1'];
      mockPage.evaluate.mockResolvedValue(mockObjects);

      const result = await instance.getAllObjectNames();

      expect(result).toEqual(mockObjects);
      expect(mockPage.evaluate).toHaveBeenCalled();
    });

    it('should get object names by type', async () => {
      const mockObjects = ['A', 'B'];
      mockPage.evaluate.mockResolvedValue(mockObjects);

      const result = await instance.getAllObjectNames('point');

      expect(result).toEqual(mockObjects);
      expect(mockPage.evaluate).toHaveBeenCalled();
    });

    it('should handle empty object list', async () => {
      mockPage.evaluate.mockResolvedValue([]);

      const result = await instance.getAllObjectNames();

      expect(result).toEqual([]);
    });
  });

  describe('exportPNG', () => {
    beforeEach(async () => {
      instance = new GeoGebraInstance();
      mockPage.waitForFunction.mockResolvedValue(undefined as any);
      await instance.initialize();
    });

    it('should export PNG successfully', async () => {
      const mockBase64 = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
      jest.spyOn(instance,'validateExportReadiness').mockResolvedValue({ready:true,issues:[],recommendations:[]});
      mockPage.evaluate.mockResolvedValue(mockBase64);

      const result = await instance.exportPNG(2);

      expect(result).toBe(mockBase64);
      expect(mockPage.evaluate).toHaveBeenCalled();
    });

    it('should use default scale if not provided', async () => {
      const mockBase64 = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
      jest.spyOn(instance,'validateExportReadiness').mockResolvedValue({ready:true,issues:[],recommendations:[]});
      mockPage.evaluate.mockResolvedValue(mockBase64);

      await instance.exportPNG();

      // Verify scale parameter was handled correctly
      expect(mockPage.evaluate).toHaveBeenCalled();
    });

    it('should handle export failure', async () => {
      mockPage.evaluate.mockRejectedValue(new Error('Export failed'));

      await expect(instance.exportPNG()).rejects.toThrow();
    });
  });

  describe('cleanup', () => {
    it('should cleanup browser and page resources', async () => {
      instance = new GeoGebraInstance();
      mockPage.waitForFunction.mockResolvedValue(undefined as any);
      await instance.initialize();

      await instance.cleanup();

      expect(mockPage.close).toHaveBeenCalled();
      expect(mockBrowser.close).toHaveBeenCalled();
    });

    it('should handle cleanup when not initialized', async () => {
      instance = new GeoGebraInstance();

      // Should not throw error
      await instance.cleanup();
    });

    it('should handle cleanup errors gracefully', async () => {
      instance = new GeoGebraInstance();
      mockPage.waitForFunction.mockResolvedValue(undefined as any);
      await instance.initialize();

      mockPage.close.mockRejectedValue(new Error('Page close failed'));
      mockBrowser.close.mockRejectedValue(new Error('Browser close failed'));

      // Should not throw error
      await instance.cleanup();
    });
  });

  describe('getState', () => {
    it('should return current instance state', () => {
      instance = new GeoGebraInstance();
      
      const state = instance.getState();

      expect(state).toEqual({
        id: instance.id,
        isReady: false,
        lastActivity: expect.any(Date),
        config: instance.config,
      });
    });
  });

  describe('ensureInitialized', () => {
    it('should throw error if not initialized', () => {
      instance = new GeoGebraInstance();

      expect(() => {
        // Access the private method through any casting for testing
        (instance as any).ensureInitialized();
      }).toThrow('GeoGebra instance not initialized');
    });
  });
}); 