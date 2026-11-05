export function isPublicDemo(value: string | undefined): boolean {
  return value === 'true';
}

export const PUBLIC_DEMO = isPublicDemo(import.meta.env.VITE_PUBLIC_DEMO);
export const PUBLIC_DEMO_MESSAGE =
  'Modo público: integrações, autenticação, banco, grounding e execução de modelos estão indisponíveis.';
