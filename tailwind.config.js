export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  // hover styles apply only on devices that really hover (mouse), so phones and tablets never get "stuck" hover states.
  future: { hoverOnlyWhenSupported: true },
  theme: { extend: { fontFamily: { head: ["Nunito", "system-ui", "sans-serif"] } } },
  plugins: [],
};
