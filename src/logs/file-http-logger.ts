import { appendFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const logsDir = join(process.cwd(), "logs");
const logFile = join(logsDir, "errors.log");

if (!existsSync(logsDir)) {
  mkdirSync(logsDir, { recursive: true });
}

export const fileHttpLogger = (req: any, res: any, next: any) => {
  const start = Date.now();

  res.on("finish", () => {
    if (res.statusCode >= 400) {
      const responseTime = Date.now() - start;

      const log = {
        date: new Date().toISOString(),
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        responseTime: `${responseTime}ms`,
      };

      appendFileSync(logFile, JSON.stringify(log) + "\n", "utf8");
    }
  });

  next();
};