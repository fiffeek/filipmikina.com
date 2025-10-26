// Place any global data in this file.
// You can import this data from anywhere in your site by using the `import` keyword.

export const SITE_TITLE = "Filip Mikina";
export const SITE_DESCRIPTION =
  "SRE and Software Engineer specializing in distributed systems, observability, and automation. Ex-Meta, Google, Amazon, Microsoft. Building tools for Hyprland, writing about DevOps, cloud architecture, and system design.";
export const TWITTER_HANDLE = "@fiffeek";
export const MY_NAME = "Filip Mikina";

export const GITHUB_URL = "https://github.com/fiffeek";
export const LINKEDIN_URL = "https://www.linkedin.com/in/filipmikina/";
export const KOFI_URL = "https://ko-fi.com/filipmikina";

// setup in astro.config.mjs
const BASE_URL = new URL(import.meta.env.SITE);
export const SITE_URL = BASE_URL.origin;
