import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const MEM_TOTAL_RE = /MemTotal:\s+(\d+)/;
const MEM_AVAILABLE_RE = /MemAvailable:\s+(\d+)/;
const DF_SPLIT_RE = /\s+/;
const PROCESSOR_RE = /^processor/gm;

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
  const loadavg = readProc('/proc/loadavg').split(' ');

  const meminfo = readProc('/proc/meminfo');
  const memTotal = Number.parseInt(meminfo.match(MEM_TOTAL_RE)?.[1] || '0') * 1024;
  const memAvailable = Number.parseInt(meminfo.match(MEM_AVAILABLE_RE)?.[1] || '0') * 1024;
  const memUsed = memTotal - memAvailable;

  const dfOutput = execCmd('df -B1 / | tail -1');
  const dfParts = dfOutput.split(DF_SPLIT_RE);
  const diskTotal = Number.parseInt(dfParts[1] || '0');
  const diskUsed = Number.parseInt(dfParts[2] || '0');

  const tempRaw = readProc('/sys/class/thermal/thermal_zone0/temp');
  const temperature = tempRaw ? Number.parseInt(tempRaw) / 1000 : null;

  const uptimeRaw = readProc('/proc/uptime').split(' ')[0];
  const uptimeSeconds = Number.parseFloat(uptimeRaw || '0');

  const cpuCount = (readProc('/proc/cpuinfo').match(PROCESSOR_RE) || []).length;

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
