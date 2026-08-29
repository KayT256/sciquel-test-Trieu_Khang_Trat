import { z } from "zod";

/* ------- my code: limits shared by schemas, route, and (eventually) form ------- */

// A page is capped rather than caller-controlled
const MAX_COMMENTS_PER_PAGE = 50;

// Bounded strings
const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 254; // longest address RFC 5321 allows
const MAX_COMMENT_LENGTH = 5000;

// Number rather than parseInt: parseInt truncates "2.5" and "12abc".  
// Number("") is 0.
function fromQueryParam(value: unknown) {
    return value === "" ? NaN : Number(value);
}

/* ------- end my code ------- */

export const commentGetSchema = z.object({
    /* ------- my code: offset pagination params, both optional so a bare GET returns the newest page ------- */

    // Defaults run back through the coercion and checks, so a bad one fails loudly
    start_index: z
        .preprocess(
            fromQueryParam,
            z
                .number({ invalid_type_error: "start_index must be a number." })
                .int("start_index must be an integer.")
                .nonnegative("start_index cannot be negative."),
        )
        .default(0),

    page_size: z
        .preprocess(
            fromQueryParam,
            z
                .number({ invalid_type_error: "page_size must be a number." })
                .int("page_size must be an integer.")
                .min(1, "page_size must be at least 1.")
                .max(
                    MAX_COMMENTS_PER_PAGE,
                    `page_size cannot exceed ${MAX_COMMENTS_PER_PAGE}.`,
                ),
        )
        .default(MAX_COMMENTS_PER_PAGE),

    /* ------- end my code ------- */
})

export const commentPostSchema = z.object({
    /* ------- my code: the fields a user must supply to leave a comment ------- */

    // Everything is trimmed before validation so whitespace-only input is rejected
    name: z
        .string({
            required_error: "name is required.",
            invalid_type_error: "name must be a string.",
        })
        .trim()
        .min(1, "name cannot be empty.")
        .max(
            MAX_NAME_LENGTH,
            `name cannot exceed ${MAX_NAME_LENGTH} characters.`,
        ),

    // Lowercased so the same address always lands in the database identically
    email: z
        .string({
            required_error: "email is required.",
            invalid_type_error: "email must be a string.",
        })
        .trim()
        .toLowerCase()
        .email("email must be a valid email address.")
        .max(
            MAX_EMAIL_LENGTH,
            `email cannot exceed ${MAX_EMAIL_LENGTH} characters.`,
        ),

    comment: z
        .string({
            required_error: "comment is required.",
            invalid_type_error: "comment must be a string.",
        })
        .trim()
        .min(1, "comment cannot be empty.")
        .max(
            MAX_COMMENT_LENGTH,
            `comment cannot exceed ${MAX_COMMENT_LENGTH} characters.`,
        ),

    /* ------- end my code ------- */
})