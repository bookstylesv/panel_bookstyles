/** notify.ts — Wrapper simple de alertas para el panel central. */
export const notify = {
  success: (msg: string, detail?: string) => console.log('[OK]', msg, detail ?? ''),
  error:   (msg: string, detail?: string) => console.error('[ERR]', msg, detail ?? ''),
  info:    (msg: string, detail?: string) => console.info('[INFO]', msg, detail ?? ''),
};
