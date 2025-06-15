import { test, expect, describe, beforeEach, vi } from 'vitest';
import { Tooltip } from './Tooltip';

// Mock DOM elements
class MockElement {
  listeners: Record<string, Function[]> = {};
  dataset: Record<string, string> = {};
  style: Record<string, string> = {};
  classList = {
    add: vi.fn(),
    remove: vi.fn(),
  };

  // Add index signature to allow string indexing
  [key: string]: any;

  addEventListener(event: string, callback: Function) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  removeEventListener() {
    // Mock implementation
  }

  setAttribute(name: string, value: string) {
    this[name] = value;
  }

  removeAttribute(name: string) {
    delete this[name];
  }

  getBoundingClientRect() {
    return {
      top: 100,
      bottom: 150,
      left: 100,
      right: 200,
      width: 100,
      height: 50,
    };
  }
}

// Mock document and window
global.document = {
  body: {
    appendChild: vi.fn(),
  },
  createElement: vi.fn().mockImplementation((tag) => new MockElement()),
  createTextNode: vi.fn().mockReturnValue({}),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
} as any;

global.window = {
  scrollX: 0,
  scrollY: 0,
  setTimeout: vi.fn().mockImplementation((cb) => 1),
  clearTimeout: vi.fn(),
  innerWidth: 1024,
  innerHeight: 768,
} as any;

describe('Tooltip', () => {
  let tooltip: Tooltip;
  let element: MockElement;

  beforeEach(() => {
    tooltip = new Tooltip();
    element = new MockElement();
    vi.clearAllMocks();
  });

  test('should be defined', () => {
    expect(Tooltip).toBeDefined();
  });

  test('should initialize with hover trigger', () => {
    tooltip.onHover(element as any, 'Test tooltip', { placement: 'top' });
    expect(element.dataset.tooltipInitialized).toBe('true');
  });

  test('should initialize with click trigger', () => {
    tooltip.onClick(element as any, 'Test tooltip', { placement: 'bottom' });
    expect(element.dataset.tooltipInitialized).toBe('true');
  });

  test('should support different placements', () => {
    tooltip.init(element as any, 'Test tooltip', { placement: 'top' });
    tooltip.init(element as any, 'Test tooltip', { placement: 'bottom' });
    tooltip.init(element as any, 'Test tooltip', { placement: 'left' });
    tooltip.init(element as any, 'Test tooltip', { placement: 'right' });
    expect(element.dataset.tooltipInitialized).toBe('true');
  });

  test('should support themes', () => {
    tooltip.init(element as any, 'Test tooltip', { theme: 'light' });
    tooltip.init(element as any, 'Test tooltip', { theme: 'dark' });
    tooltip.init(element as any, 'Test tooltip', { theme: 'custom' });
    expect(element.dataset.tooltipInitialized).toBe('true');
  });

  test('should support custom class', () => {
    tooltip.init(element as any, 'Test tooltip', {
      className: 'custom-tooltip',
    });
    expect(element.dataset.tooltipInitialized).toBe('true');
  });

  test('should support animations', () => {
    tooltip.init(element as any, 'Test tooltip', {
      animation: true,
      animationDuration: 200,
    });
    expect(element.dataset.tooltipInitialized).toBe('true');
  });

  test('should support follow cursor', () => {
    tooltip.init(element as any, 'Test tooltip', { followCursor: true });
    expect(element.dataset.tooltipInitialized).toBe('true');
    expect(element.dataset.tooltipMousemoveHandler).toBeDefined();
  });

  test('should destroy tooltip', () => {
    tooltip.init(element as any, 'Test tooltip');
    tooltip.destroy(element as any);
    expect(element.dataset.tooltipInitialized).toBeUndefined();
  });
});
