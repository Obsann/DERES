import { useCallback, useState } from 'react';

export type InstallPlatform = 'ios' | 'android' | 'desktop';

function detectPlatform(): InstallPlatform {
  if (typeof navigator === 'undefined') return 'desktop';
  const ua = navigator.userAgent;
  const iPadOs = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
  if (/iPhone|iPad|iPod/i.test(ua) || iPadOs) return 'ios';
  if (/Android/i.test(ua)) return 'android';
  return 'desktop';
}

function isStandaloneDisplay(): boolean {
  if (typeof window === 'undefined') return false;
  const media = window.matchMedia('(display-mode: standalone)').matches;
  const ios = 'standalone' in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
  return media || ios;
}

function downloadBlob(filename: string, mime: string, body: string): void {
  const blob = new Blob([body], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
}

function xml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Apple web clip. Opening the file is the install; the page does not list steps. */
function iosWebClip(origin: string): string {
  const id = () => crypto.randomUUID().toUpperCase();
  const url = xml(origin);
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>PayloadContent</key>
  <array>
    <dict>
      <key>FullScreen</key>
      <true/>
      <key>IsRemovable</key>
      <true/>
      <key>Label</key>
      <string>DERES</string>
      <key>PayloadDisplayName</key>
      <string>DERES</string>
      <key>PayloadIdentifier</key>
      <string>et.deres.webclip</string>
      <key>PayloadType</key>
      <string>com.apple.webClip.managed</string>
      <key>PayloadUUID</key>
      <string>${id()}</string>
      <key>PayloadVersion</key>
      <integer>1</integer>
      <key>URL</key>
      <string>${url}</string>
    </dict>
  </array>
  <key>PayloadDisplayName</key>
  <string>DERES</string>
  <key>PayloadIdentifier</key>
  <string>et.deres.profile</string>
  <key>PayloadType</key>
  <string>Configuration</string>
  <key>PayloadUUID</key>
  <string>${id()}</string>
  <key>PayloadVersion</key>
  <integer>1</integer>
</dict>
</plist>
`;
}

function androidLauncher(origin: string): string {
  const url = xml(origin);
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta http-equiv="refresh" content="0; url=${url}/" />
  <title>DERES</title>
</head>
<body>
  <p><a href="${url}/">DERES</a></p>
</body>
</html>
`;
}

/**
 * The landing buttons download DERES directly.
 * Android saves a launcher file. iPhone saves the Apple web-clip profile.
 * Neither button opens an instruction sheet.
 */
export function useAppInstall() {
  const [platform] = useState(detectPlatform);
  const [installed] = useState(isStandaloneDisplay);

  const installAndroid = useCallback(() => {
    downloadBlob('DERES-Android.html', 'text/html;charset=utf-8', androidLauncher(window.location.origin));
  }, []);

  const installIos = useCallback(() => {
    downloadBlob('DERES.mobileconfig', 'application/x-apple-aspen-config', iosWebClip(window.location.origin));
  }, []);

  return {
    platform,
    installed,
    installAndroid,
    installIos,
  };
}
