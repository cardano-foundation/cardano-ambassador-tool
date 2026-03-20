import DocsDisplay from "../../../components/atoms/DocsDisplay";
import Paragraph from "../../../components/atoms/Paragraph";
import fs from "fs";
import path from "path";

export default function AboutPage() {
  // Read the markdown file directly
  const markdownPath = path.join(
    process.cwd(),
    "docs/guides/getting-started.md",
  );
  const content = fs.readFileSync(markdownPath, "utf8");

  return (
    <div className="flex min-h-screen">
      {/* Main Content */}
      <div className="flex-1 p-6 md:p-12 max-w-5xl">
        <DocsDisplay content={content} />
      </div>

      {/* Sidebar Navigation */}
      <aside className="hidden lg:block w-56 border-l border-border p-6 sticky top-0 h-screen overflow-y-auto">
        <div className="space-y-6">
          <div>
            <Paragraph size="sm" className="font-medium text-foreground mb-3">
              Quick Start Guide
            </Paragraph>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="#membership-guide"
                  className="text-primary-base hover:underline"
                >
                  Becoming a Member
                </a>
              </li>
              <li>
                <a
                  href="#proposal-guide"
                  className="text-primary-base hover:underline"
                >
                  Submitting Proposals
                </a>
              </li>
            </ul>
          </div>
        </div>
      </aside>
    </div>
  );
}
