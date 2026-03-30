import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json(
    {
      message: "API structure placeholder",
    },
    { status: 501 },
  );
}
