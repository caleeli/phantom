import translation from "./translation";
// load from env api_base
const env = process.env;

export const translations = translation(env.language || "es");
