import { NextResponse } from "next/server";
import { createItem, getAllItems } from "@/lib/data/items-store";
import type { CreateItemInput } from "@/lib/types/item";

export async function GET() {
  return NextResponse.json(getAllItems());
}

export async function POST(request: Request) {
  const body = (await request.json()) as CreateItemInput;

  if (!body.title?.trim()) {
    return NextResponse.json({ error: "Title is required." }, { status: 400 });
  }

  const item = createItem({
    title: body.title,
    description: body.description ?? "",
  });

  return NextResponse.json(item, { status: 201 });
}
