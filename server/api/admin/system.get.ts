import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

function readProc(path: string): string {
  try {
    return readFileSync(path, 'utf-8').trim();
  }
  catch {
    return '';
  }
}

function execCmd(cmd: string): string {
  try {
    return execSync(cmd, { timeout: 3000 }).toString().trim();
  }
  catch {
    return '';
  }
}

export default defineEventHandler(() => {
  // CPU usage from /proc/loadavg
  const loadavg = readProc('/proc/loadavg').split(' ');

  // Memory from /proc/meminfo
  const meminfo = readProc('/proc/meminfo');
  const memTotal = Number.parseInt(meminfo.match(/MemTotal:\s+(\d+)/)?.[1] || '0') * 1024;
  const memAvailable = Number.parseInt(meminfo.match(/MemAvailable:\s+(\d+)/)?.[1] || '0') * 1024;
  const memUsed = memTotal - memAvailable;

  // Disk usage
  const dfOutput = execCmd('df -B1 / | tail -1');
  const dfParts = dfOutput.split(/\s+/);
  const diskTotal = Number.parseInt(dfParts[1] || '0');
  const diskUsed = Number.parseInt(dfParts[2] || '0');

  // Temperature (Raspberry Pi)
  const tempRaw = readProc('/sys/class/thermal/thermal_zone0/temp');
  const temperature = tempRaw ? Number.parseInt(tempRaw) / 1000 : null;

  // Uptime
  const uptimeRaw = readProc('/proc/uptime').split(' ')[0];
  const uptimeSeconds = Number.parseFloat(uptimeRaw || '0');

  // CPU cores
  const cpuCount = (readProc('/proc/cpuinfo').match(/^processor/gm) || []).length;

  return {
    cpu: {
      cores: cpuCount,
      load1m: Number.parseFloat(loadavg[0] || '0'),
      load5m: Number.parseFloat(loadavg[1] || '0'),
      load15m: Number.parseFloat(loadavg[2] || '0'),
    },
    disk: {
      total: diskTotal,
      used: diskUsed,
      usedPercent: diskTotal > 0 ? Math.round((diskUsed / diskTotal) * 100) : 0,
    },
    memory: {
      total: memTotal,
      used: memUsed,
      usedPercent: memTotal > 0 ? Math.round((memUsed / memTotal) * 100) : 0,
    },
    temperature,
    uptime: uptimeSeconds,
  };
});
