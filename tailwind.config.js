import { nextui } from "@nextui-org/theme";

/** @type {import('tailwindcss').Config} */
export const content = [
  "./src/app/**/*.{js,ts,jsx,tsx}",
  "./src/components/**/*.{js,ts,jsx,tsx}",
  "./node_modules/@nextui-org/theme/dist/components/(button|ripple|spinner).js",
];
export const theme = {
  extend: {},
};
export const darkMode = "class";
export const plugins = [nextui()];
