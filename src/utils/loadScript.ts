export function loadScript(
  id: string,
  src: string,
  attributes: Record<string, string> = {},
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const existing = document.getElementById(id);
    if (existing) {
      const isStale = Object.entries(attributes).some(
        ([key, val]) => existing.getAttribute(key) !== val,
      );
      if (!isStale) {
        resolve();
        return;
      }
      existing.remove();
    }
    const script = document.createElement('script');
    script.id = id;
    script.src = src;
    script.async = true;
    Object.entries(attributes).forEach(([key, val]) => {
      script.setAttribute(key, val);
    });
    script.onload = () => {
      resolve();
    };
    script.onerror = () => {
      reject(new Error(`Failed to load script: ${src}`));
    };
    document.body.appendChild(script);
  });
}
