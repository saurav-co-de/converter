import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  tier: z.enum(["premium", "business"])
});

export async function POST(request: Request) {
  const body = schema.parse(await request.json());

  return NextResponse.json({
    tier: body.tier,
    checkoutUrl: `/billing?checkout=${body.tier}`
  });
}
