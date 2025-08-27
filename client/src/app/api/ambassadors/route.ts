import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const dirPath = path.join(
      process.cwd(),
      "src/app/api/ambassadors/_list"
    );

    if (!fs.existsSync(dirPath)) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    const files = fs.readdirSync(dirPath).filter((f) => f.endsWith(".json"));

    // Read and parse each file
    const data = files.map((file) => {
      const filePath = path.join(dirPath, file);
      const content = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(content);
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to load JSON files" },
      { status: 500 }
    );
  }
}