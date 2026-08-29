import { NextRequest, NextResponse } from "next/server";

/* ------- my code: shared dependencies, response contracts, and caching behaviour for both handlers ------- */

import prisma from "@/lib/prisma";
import { type Comment } from "@prisma/client";
import { commentGetSchema, commentPostSchema } from "./schema";

// Force SSR for fresh uncached data.
export const dynamic = "force-dynamic";

// Addresses are never served back out. (well, we collect it but isn't displaying personal 
// email on comments a security flaw?)
// Both handlers use this select
const publicCommentSelect = {
    id: true,
    name: true,
    comment: true,
    createdAt: true,
} as const;

type PublicComment = Pick<Comment, "id" | "name" | "comment"> & {
    // Prisma returns a Date, but NextResponse.json puts an ISO 8601 string
    createdAt: string;
};

type GetCommentsResult = {
    comments: PublicComment[];
    total_count: number;
    start_index: number;
    page_size: number;
    // start_index for the following page, or null once the client has reached the end of the feed.
    next_index: number | null;
};

type PostCommentResult = {
    comment: PublicComment;
};

function toPublicComment(
    comment: Pick<Comment, "id" | "name" | "comment" | "createdAt">,
): PublicComment {
    return { ...comment, createdAt: comment.createdAt.toISOString() };
}

/* ------- end my code ------- */


export async function GET(req: NextRequest){
    /* ------- my code: serve one page of the newest comments ------- */

    // fromEntries omits params the caller left off, which is what lets the schema fall back to 
    // "first page, 50 comments" for a bare GET.
    // i.e. undefined instead of null (cuz zod default (in commentGetSchema) catch undefined, not null)
    const params = commentGetSchema.safeParse(
        Object.fromEntries(req.nextUrl.searchParams),
    );

    if (!params.success) {
        return NextResponse.json(
            {
                error: "Invalid query parameters.",
                fields: params.error.flatten().fieldErrors,
            },
            { status: 400 },
        );
    }

    const { start_index, page_size } = params.data;

    try {
        // The page and the total are read together so a paginated view needs one round trip.  
        // Promise.all rather than $transaction because Mongo only
        // supports transactions on a replica set, and a count that is a moment
        // stale is harmless for a comment feed.
        const [comments, total_count] = await Promise.all([
            prisma.comment.findMany({
                select: publicCommentSelect,
                orderBy: { createdAt: "desc" },
                skip: start_index,
                take: page_size,
            }),
            prisma.comment.count(),
        ]);

        const next_index = start_index + comments.length;

        return NextResponse.json({
            comments: comments.map(toPublicComment),
            total_count,
            start_index,
            page_size,
            next_index: next_index < total_count ? next_index : null,
        } satisfies GetCommentsResult);
    } catch (err) {
        // The caller gets nothing internal (security best practice)
        // but the failure still has to land somewhere I can read 
        console.error("GET /api/comments failed:", err);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 },
        );
    }

    /* ------- end my code ------- */
}

export async function POST(req: NextRequest){
    /* ------- my code: store one submitted comment ------- */

    let body: unknown;
    try {
        body = await req.json();
    } catch {
        // A malformed or missing body is 400, not 500
        return NextResponse.json(
            { error: "Request body must be valid JSON." },
            { status: 400 },
        );
    }

    const submission = commentPostSchema.safeParse(body);

    if (!submission.success) {
        return NextResponse.json(
            {
                error: "Invalid comment.",
                fields: submission.error.flatten().fieldErrors,
            },
            { status: 400 },
        );
    }

    try {
        const comment = await prisma.comment.create({
            data: submission.data,
            select: publicCommentSelect,
        });

        return NextResponse.json(
            { comment: toPublicComment(comment) } satisfies PostCommentResult,
            { status: 201 },
        );
    } catch (err) {
        console.error("POST /api/comments failed:", err);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 },
        );
    }

    /* ------- end my code ------- */
}