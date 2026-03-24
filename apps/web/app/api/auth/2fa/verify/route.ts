import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  code: z.string().min(6)
});

export async function POST(request: Request) {
  const body = schema.parse(await request.json());

  return NextResponse.json({
    verified: body.code.length >= 6
  });
}
