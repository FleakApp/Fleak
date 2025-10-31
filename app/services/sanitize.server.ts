import createDOMPurify from "isomorphic-dompurify";

// Sanitization profiles for different content types
// Each profile defines what HTML tags and attributes are allowed
export const SANITIZE_PROFILES = {
	// Strict profile for titles (no HTML allowed, only plain text)
	title: {
		ALLOWED_TAGS: [],
		ALLOWED_ATTR: [],
		KEEP_CONTENT: true, // Keep text content but strip all tags
	},

	// Moderate profile for comments (allows markdown-style HTML)
	comment: {
		ALLOWED_TAGS: [
			"p",
			"br",
			"strong",
			"em",
			"u",
			"s",
			"code",
			"pre",
			"blockquote",
			"ul",
			"ol",
			"li",
			"a",
			"h1",
			"h2",
			"h3",
			"h4",
			"h5",
			"h6",
			"img",
		],
		ALLOWED_ATTR: ["href", "title", "alt", "src"],
		ALLOW_DATA_ATTR: false,
		ALLOW_ARIA_ATTR: false,
	},

	// Rich profile for post content (allows more formatting)
	postContent: {
		ALLOWED_TAGS: [
			"p",
			"br",
			"strong",
			"em",
			"u",
			"s",
			"code",
			"pre",
			"blockquote",
			"ul",
			"ol",
			"li",
			"a",
			"h1",
			"h2",
			"h3",
			"h4",
			"h5",
			"h6",
			"img",
			"hr",
			"table",
			"thead",
			"tbody",
			"tr",
			"th",
			"td",
		],
		ALLOWED_ATTR: ["href", "title", "alt", "src", "class"],
		ALLOW_DATA_ATTR: false,
		ALLOW_ARIA_ATTR: false,
	},

	// Basic profile for issue descriptions (minimal HTML)
	issue: {
		ALLOWED_TAGS: ["p", "br", "strong", "em", "ul", "ol", "li"],
		ALLOWED_ATTR: [],
		ALLOW_DATA_ATTR: false,
		ALLOW_ARIA_ATTR: false,
	},
} as const;

type SanitizeProfile = keyof typeof SANITIZE_PROFILES;

/**
 * Sanitizes user-generated content based on a specified profile
 * @param content - The content to sanitize
 * @param profile - The sanitization profile to use
 * @returns Sanitized content safe for database storage and rendering
 */
export function sanitizeContent(
	content: string,
	profile: SanitizeProfile = "comment",
): string {
	if (!content || typeof content !== "string") {
		return "";
	}

	const config = SANITIZE_PROFILES[profile];
	const window = typeof global !== "undefined" ? global : undefined;

	// Create DOMPurify instance (works in Node.js via isomorphic-dompurify)
	const DOMPurify = createDOMPurify(window as any);

	// Configure DOMPurify with profile settings
	const sanitized = DOMPurify.sanitize(content, {
		ALLOWED_TAGS: config.ALLOWED_TAGS,
		ALLOWED_ATTR: config.ALLOWED_ATTR,
		ALLOW_DATA_ATTR: config.ALLOW_DATA_ATTR ?? false,
		ALLOW_ARIA_ATTR: config.ALLOW_ARIA_ATTR ?? false,
		RETURN_DOM: false,
		RETURN_DOM_FRAGMENT: false,
		RETURN_TRUSTED_TYPE: false,
	});

	return sanitized.trim();
}

/**
 * Sanitizes a title (strips all HTML, keeps only text)
 */
export function sanitizeTitle(title: string): string {
	return sanitizeContent(title, "title");
}

/**
 * Sanitizes comment content (allows markdown-style HTML)
 */
export function sanitizeComment(content: string): string {
	return sanitizeContent(content, "comment");
}

/**
 * Sanitizes post content (allows rich formatting)
 */
export function sanitizePostContent(content: string): string {
	return sanitizeContent(content, "postContent");
}

/**
 * Sanitizes issue description (minimal HTML)
 */
export function sanitizeIssue(content: string): string {
	return sanitizeContent(content, "issue");
}

