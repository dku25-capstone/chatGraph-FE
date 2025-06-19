// src/app/api/graph/[topicId]/route.ts
import { NextResponse } from "next/server";
import { graphDataMap } from "@/data";

export async function GET(
  request: Request,
  { params }: { params: { topicId: string } }
) {
  const data = graphDataMap[params.topicId];

  if (!data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}
