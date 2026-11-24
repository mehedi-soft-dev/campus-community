import 'dotenv/config';

function parseDurationMs(value, fallbackMs) {
  const match = /^(\d+)\s*(s|m|h|d)?$/.exec(String(value ?? '').trim());
  if (!match) return fallbackMs;
  const amount = Number(match[1]);
  const unit = match[2] ?? 's';
  const factor = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }[unit];
  return amount * factor;
}

const missing = ['JWT_SECRET'].filter((key) => !process.env[key]);
if (missing.length) {
  throw new Error(
    `Missing required environment variable(s): ${missing.join(', ')}. ` +
      'Copy src/backend/.env.example to src/backend/.env and fill them in.'
  );
}

const nodeEnv = process.env.NODE_ENV ?? 'development';
const jwtExpiresIn = process.env.JWT_EXPIRES_IN ?? '7d';

export const env = {
  nodeEnv,
  isProd: nodeEnv === 'production',
  port: Number(process.env.PORT ?? 8800),
  clientOrigin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',

  db: {
    host: process.env.DB_HOST ?? '127.0.0.1',
    port: Number(process.env.DB_PORT ?? 3307),
    user: process.env.DB_USER ?? 'root',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_NAME ?? 'campus-community',
  },

  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: jwtExpiresIn,
  },

  cookieName: process.env.COOKIE_NAME ?? 'access_token',
  cookieMaxAgeMs: parseDurationMs(jwtExpiresIn, 7 * 86_400_000),
  // Secure cookies need HTTPS. Production deployments should leave this unset
  // (it defaults to on in production); the Docker stack runs production mode
  // over plain HTTP on localhost, so it sets COOKIE_SECURE=false explicitly.
  cookieSecure:
    process.env.COOKIE_SECURE === undefined
      ? nodeEnv === 'production'
      : process.env.COOKIE_SECURE !== 'false',
  uploadMaxBytes: Number(process.env.UPLOAD_MAX_MB ?? 5) * 1024 * 1024,
  // Documents (routines, past papers) are legitimately larger than a cover image.
  documentMaxBytes: Number(process.env.DOCUMENT_MAX_MB ?? 15) * 1024 * 1024,

  // Applying migrations on boot is convenient in dev; production should run
  // `npm run db:migrate` as an explicit deploy step.
  dbAutoMigrate: process.env.DB_AUTO_MIGRATE !== 'false',

  authRateLimit: {
    windowMs: Number(process.env.AUTH_RATE_WINDOW_MINUTES ?? 15) * 60_000,
    max: Number(process.env.AUTH_RATE_LIMIT ?? 100),
  },
};
