import * as readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

export function prompt(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

export async function promptMultiline(question: string): Promise<string[]> {
  console.log(question);
  console.log("(Enter one value per line, empty line to finish)");
  const lines: string[] = [];
  while (true) {
    const line = await prompt("> ");
    if (line === "") break;
    lines.push(line);
  }
  return lines;
}

export function closePrompts() {
  rl.close();
}
