import rateLimit from "express-rate-limit";
import Redis from "ioredis";
import { RedisStore } from "rate-limit-redis";

const DEFAULTS = {
	standardHeaders: true,
	legacyHeaders: false,
};

// Redis store for multi-instance deployment (Vercel/serverless)
// Falls back to memory store if REDIS_URL not configured
let redisStore = null;

function getStore() {
	if (redisStore !== null) return redisStore;

	const redisUrl = process.env.REDIS_URL || process.env.UPSTASH_REDIS_URL;
	if (redisUrl) {
		try {
			const client = new Redis(redisUrl, {
				tls: redisUrl.startsWith("rediss://") ? {} : undefined,
				maxRetriesPerRequest: 3,
				lazyConnect: true,
			});
			redisStore = new RedisStore({
				client,
				prefix: "rl:",
			});
			// ensure connection attempt (non-blocking)
			client.connect().catch(() => undefined);
		} catch (e) {
			console.warn("Redis store init failed, using memory:", e?.message || e);
			redisStore = undefined;
		}
	} else {
		redisStore = undefined;
	}
	return redisStore;
}

const messages = {
	tooManyInteractions: {
		status: 429,
		error: "Za dużo interakcji w krótkim czasie. Spróbuj ponownie później.",
	},
	tooManyComments: {
		status: 429,
		error: "Za dużo komentarzy. Odczekaj 15 minut.",
	},
	tooManyPublishes: {
		status: 429,
		error: "Za dużo publikacji treści. Odczekaj 15 minut.",
	},
	tooManyAuth: {
		status: 429,
		error: "Zbyt wiele prób akcji bezpieczeństwa. Spróbuj ponownie za 10 minut.",
	},
};

export const RATE_LIMITS = {
	interactions: { windowMs: 10 * 60 * 1000, max: 60, message: messages.tooManyInteractions },
	comments: { windowMs: 15 * 60 * 1000, max: 10, message: messages.tooManyComments },
	publish: { windowMs: 15 * 60 * 1000, max: 10, message: messages.tooManyPublishes },
	auth: { windowMs: 10 * 60 * 1000, max: 5, message: messages.tooManyAuth },
	generalGet: { windowMs: 15 * 60 * 1000, max: 1000 },
};

function createLimiter(options) {
	const store = getStore();
	return rateLimit({
		...DEFAULTS,
		...(store && { store }),
		...options,
	});
}

export function applyRateLimits(app) {
	// Interactions: like & vote
	const interactionLimiter = createLimiter(RATE_LIMITS.interactions);
	app.use("/api/like/", interactionLimiter);
	app.use("/api/vote/", interactionLimiter);

	// Comments
	const commentLimiter = createLimiter(RATE_LIMITS.comments);
	app.use("/api/comment", commentLimiter);

	// Publishing: posts & issues
	const publishLimiter = createLimiter(RATE_LIMITS.publish);
	app.use("/api/post/create", publishLimiter);
	app.use("/api/issue/create", publishLimiter);

	// Auth & verification
	const authLimiter = createLimiter(RATE_LIMITS.auth);
	app.use("/api/users/verify", authLimiter);
	app.use("/api/verify.email", authLimiter);
	app.use("/api/users/email.verify", authLimiter);

	// Global GET limiter
	const generalGetLimiter = createLimiter({
		...RATE_LIMITS.generalGet,
		skip: (req) => req.method !== "GET",
	});
	app.use(generalGetLimiter);
}
