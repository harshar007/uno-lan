import os from 'os';

export interface HostNetworkInfo {
  ipv4Addresses: string[];
  primaryIp: string;
  port: number;
}

export function getHostNetworkInfo(port: number): HostNetworkInfo {
  const interfaces = os.networkInterfaces();
  const addresses: string[] = [];

  for (const name of Object.keys(interfaces)) {
    const netList = interfaces[name];
    if (!netList) continue;

    for (const net of netList) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      if (net.family === 'IPv4' && !net.internal) {
        addresses.push(net.address);
      }
    }
  }

  // Fallback if no external LAN interface found
  const primaryIp = addresses[0] || '127.0.0.1';

  return {
    ipv4Addresses: addresses,
    primaryIp,
    port,
  };
}
