import { NextResponse } from "next/server";
import { deleteItem, getItemById, updateItem } from "@/lib/data/items-store";
import type { UpdateItemInput } from "@/lib/types/item";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const item = getItemById(id);

  if (!item) {
    return NextResponse.json({ error: "Item not found." }, { status: 404 });
  }

  return NextResponse.json(item);
}

export async function PUT(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const body = (await request.json()) as UpdateItemInput;

  if (body.title !== undefined && !body.title.trim()) {
    return NextResponse.json({ error: "Title cannot be empty." }, { status: 400 });
  }

  const item = updateItem(id, body);

  if (!item) {
    return NextResponse.json({ error: "Item not found." }, { status: 404 });
  }

  return NextResponse.json(item);
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const removed = deleteItem(id);

  if (!removed) {
    return NextResponse.json({ error: "Item not found." }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
