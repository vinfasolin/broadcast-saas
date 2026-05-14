export const logInfo = (message: string, data?: Record<string, unknown>) => {
  console.log(JSON.stringify({ level: "info", message, data: data ?? {}, at: new Date().toISOString() }));
};

export const logError = (message: string, error: unknown, data?: Record<string, unknown>) => {
  console.error(JSON.stringify({
    level: "error",
    message,
    error: error instanceof Error ? error.message : String(error),
    data: data ?? {},
    at: new Date().toISOString(),
  }));
};
