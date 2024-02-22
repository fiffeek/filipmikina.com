// Place any global data in this file.
// You can import this data from anywhere in your site by using the `import` keyword.

export const SITE_TITLE = "Filip Mikina";
export const SITE_DESCRIPTION = "Automation enthusiast";
export const TWITTER_HANDLE = "@fiffeek";
export const MY_NAME = "Filip Mikina";

// setup in astro.config.mjs
const BASE_URL = new URL(import.meta.env.SITE);
export const SITE_URL = BASE_URL.origin;
