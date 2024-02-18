declare namespace NodeJS {
  export interface ProcessEnv {
    DB_URL: string;
    AUTH_GITHUB_ID: string;
    AUTH_GITHUB_SECRET: string;
    AUTH_SECRET: string;
    ENVRIONMENT: "development" | "production";
  }
}