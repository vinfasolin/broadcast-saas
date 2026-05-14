export const okResponse = <T extends Record<string, unknown>>(data?: T) => ({
  ...(data ?? {}),
  ok: true,
});