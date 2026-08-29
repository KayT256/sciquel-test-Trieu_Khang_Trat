import { NextRequest, NextResponse } from "next/server";


export async function GET(req: NextRequest){
    // fill here in

    return NextResponse.json({ test: "success", }, { status: 200 })
}

export async function POST(req: NextRequest){
    // fill here in
    return NextResponse.json({ test: "success", }, { status: 200 })
}