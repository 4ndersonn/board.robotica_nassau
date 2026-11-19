export async function copyCodeToClipboard(code: string): Promise<boolean> {
  try {
    await window.navigator.clipboard.writeText(code);
    return true;
  } catch {
    return false;
  }
}

export function downloadCppHeaderFile(
  code: string,
  robotName: string,
): void {
  const slug =
    robotName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-_]+/g, '_')
      .replace(/^_+|_+$/g, '') || 'roboboard';

  const blob = new Blob([code + '\n'], { type: 'text/plain;charset=utf-8' });
  const objectUrl = URL.createObjectURL(blob);
  const anchor = window.document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = `${slug}_pins.h`;
  window.document.body.appendChild(anchor);
  anchor.click();
  window.document.body.removeChild(anchor);
  URL.revokeObjectURL(objectUrl);
}
