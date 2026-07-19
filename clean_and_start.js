const { execSync, spawn } = require('child_process');
const fs = require('fs');

function killPort(port) {
  try {
    const output = execSync(`netstat -aon | findstr ":${port} " | findstr "LISTENING"`).toString();
    const lines = output.trim().split('\n');
    lines.forEach(line => {
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      if (pid) {
        console.log(`Killing PID ${pid} on port ${port}...`);
        execSync(`taskkill /F /PID ${pid}`);
      }
    });
  } catch (e) {
    console.log(`No active process found on port ${port}.`);
  }
}

killPort(3000);

console.log("Removing .next directory...");
try {
  fs.rmSync('.next', { recursive: true, force: true });
} catch (e) {
  console.log("Error removing .next:", e.message);
}
console.log("Cleanup finished. Starting Next.js dev server on port 3000...");

spawn('npm', ['run', 'dev'], { stdio: 'inherit', shell: true });

