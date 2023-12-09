import { Express, Request, Response } from "express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import log from "./logger";
import { exec } from "child_process";
import options from "./Options";

const swaggerSpec = swaggerJsdoc(options);

function swaggerDocs(app: Express, port: number) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  const command = `start http://localhost:${process.env.PORT}/api-docs`;
  try {
    exec(command);
    console.log(`Command executed successfully: ${command}`);
  } catch (error) {
    console.error(`Error executing command: ${command}`, error);
  }

  app.get("/docs.json", (req: Request, res: Response) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });

  log.info(`Docs available at http://localhost:${port}/docs`);
}

export default swaggerDocs;
