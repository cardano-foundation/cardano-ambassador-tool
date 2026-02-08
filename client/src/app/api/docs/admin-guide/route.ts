import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const markdownPath = path.join(process.cwd(), "docs/guides/admin-guide.md");
    const content = fs.readFileSync(markdownPath, "utf8");

    return new NextResponse(content, {
      headers: {
        "Content-Type": "text/plain",
      },
    });
  } catch (error) {
    return new NextResponse("Documentation not found", { status: 404 });
  }
}
