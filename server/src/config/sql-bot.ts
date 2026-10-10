import { spawn, ChildProcess } from 'child_process';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

let sqlBotProcess: ChildProcess | null = null;

/**
 * Health check to verify if the SQL Chatbot service on port 8001 is responding.
 */
export function checkSqlBotHealth(): Promise<boolean> {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:8001/health', (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(1500, () => {
      req.destroy();
      resolve(false);
    });
  });
}

/**
 * Automatically start the Python SQL Chatbot service if it is not already running.
 */
export async function initSqlBotServer(): Promise<void> {
  const isRunning = await checkSqlBotHealth();
  if (isRunning) {
    console.log('🤖 [SQL Chatbot] Service is already active on http://localhost:8001');
    return;
  }

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const sqlBotDir = path.resolve(__dirname, '../sql_chat_bot');

  console.log(`🤖 [SQL Chatbot] Starting Python FastAPI server on port 8001 from: ${sqlBotDir}`);

  sqlBotProcess = spawn('uv', ['run', 'uvicorn', 'main:app', '--port', '8001', '--host', '0.0.0.0'], {
    cwd: sqlBotDir,
    stdio: 'inherit',
    shell: true,
  });

  sqlBotProcess.on('error', (err) => {
    console.error('❌ [SQL Chatbot] Failed to launch server process:', err.message);
  });

  sqlBotProcess.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      console.warn(`⚠️ [SQL Chatbot] Process terminated with exit code: ${code}`);
    }
  });

  // Poll for up to 10 seconds for the server to become healthy
  for (let i = 0; i < 20; i++) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const healthy = await checkSqlBotHealth();
    if (healthy) {
      console.log('✅ [SQL Chatbot] Python service online & healthy on http://localhost:8001');
      break;
    }
  }
}

/**
 * Gracefully stop the SQL Chatbot process when the Node server shuts down.
 */
export function stopSqlBotServer(): void {
  if (sqlBotProcess) {
    try {
      console.log('🛑 [SQL Chatbot] Stopping background server process...');
      sqlBotProcess.kill('SIGTERM');
    } catch {
      // Ignore cleanup error
    }
  }
}
