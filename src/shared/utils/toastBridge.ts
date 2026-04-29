type ToastFn = (message: string) => void;

interface ToastBridge {
  error: ToastFn;
  success: ToastFn;
  warning: ToastFn;
}

const noop: ToastFn = () => {};

export const toastBridge: ToastBridge = {
  error: noop,
  success: noop,
  warning: noop,
};

export function registerToastBridge(bridge: ToastBridge) {
  toastBridge.error = bridge.error;
  toastBridge.success = bridge.success;
  toastBridge.warning = bridge.warning;
}
