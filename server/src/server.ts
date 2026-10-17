import { env } from "./config/env.js";
import app from "./app.js";
import {
    connectDatabase,
    disconnectDatabase,
} from "./config/db.js";

async function startServer(): Promise<void> {
    try {
        await connectDatabase();

        const server = app.listen(env.PORT, () => {
            console.log(
                `SmartStock API running at http://localhost:${env.PORT}`,
            );
        });

        let shuttingDown = false;

        const shutdown = () => {
            if (shuttingDown) return;
            shuttingDown = true;

            server.close(async (error) => {
                try {
                    await disconnectDatabase();
                } catch (dbError) {
                    console.error("Database shutdown failed:", dbError);
                    process.exitCode = 1;
                }

                if (error) {
                    console.error("HTTP server shutdown failed:", error);
                    process.exitCode = 1;
                }

                process.exit();
            });
        };

        process.on("SIGINT", shutdown);
        process.on("SIGTERM", shutdown);
    } catch (error) {
        console.error("Server startup failed:", error);
        process.exitCode = 1;
    }
}

void startServer();