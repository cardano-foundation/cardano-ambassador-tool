import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(
  req: Request,
  context: { params: { slug: string[] } }
) {
  try {
    const { slug } = await context.params;

    const filePath = path.join(
      process.cwd(),
      "src/app/api/ambassadors/_list",
      ...slug
    ) + ".json";

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const fileContents = fs.readFileSync(filePath, "utf-8");
    const jsonData = JSON.parse(fileContents);

    return NextResponse.json(jsonData);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to load JSON" },
      { status: 500 }
    );
  }
}