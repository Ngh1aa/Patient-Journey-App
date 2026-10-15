# Browser preview performance boundaries

Rendered source and fonts: 629,249 bytes uncompressed over 11 files, measured from current runtime files (browser-source-hashes.json). No framework runtime, analytics, remote fonts, photo/video downloads or external API requests are required. Three self-hosted font weights keep Vietnamese glyph coverage; font-display swap avoids hiding text.

PROPOSED budget for this buildless preview: under850KB uncompressed first-load app+font assets, based on the measured complete47-screen payload with no media services. This is a local asset budget, not a claim about mobile network latency or production performance. No budget was imposed on historical hifi assets loaded separately.

Lab browser coverage: Chromium141/WebKit26, Windows, loopback server, normal local machine. No CPU/network throttling measurements, Lighthouse, CrUX, RUM or actual patient devices. LCP/INP/CLS and field Core Web Vitals remain NOT_RUN/UNKNOWN. Reduced-motion CSS present; motion only button feedback, no continuous animation.
