declare module "dotenv" {
  namespace NodeJS {
    interface ProcessEnv {
      MONGO_URL: string;
    }
  }
}
