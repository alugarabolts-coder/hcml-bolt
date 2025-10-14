// Browser-compatible mock for Node.js timers module
// This resolves the "t._onTimeout is not a function" error

export const setTimeout = globalThis.setTimeout.bind(globalThis);
export const clearTimeout = globalThis.clearTimeout.bind(globalThis);
export const setInterval = globalThis.setInterval.bind(globalThis);
export const clearInterval = globalThis.clearInterval.bind(globalThis);
export const setImmediate = (callback: (...args: any[]) => void, ...args: any[]) => {
  return globalThis.setTimeout(callback, 0, ...args);
};
export const clearImmediate = (id: any) => {
  return globalThis.clearTimeout(id);
};

// Default export for compatibility
export default {
  setTimeout,
  clearTimeout,
  setInterval,
  clearInterval,
  setImmediate,
  clearImmediate
};