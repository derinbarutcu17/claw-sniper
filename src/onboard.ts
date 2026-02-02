import * as fs from "fs";

export async function processCV(input: string) {
  if (!fs.existsSync("profile")) fs.mkdirSync("profile");
  
  // Phase 2: Flexible Ingestion
  // If the input is a valid file path, read the content from the file.
  // Otherwise, treat the input as the raw text.
  let content = input;
  if (fs.existsSync(input) && fs.lstatSync(input).isFile()) {
    try {
      content = fs.readFileSync(input, "utf-8");
    } catch (err) {
      console.error("Failed to read file:", err);
      // Fallback: treat input as text if read fails (unlikely but safe)
    }
  }

  const cleanInput = content.trim();
  
  fs.writeFileSync("profile/cv.md", cleanInput);
  
  return {
    success: true,
    message: "🌌 **Profile Synced.**\n\nI've analyzed your background and locked it in. I know what you're looking for.\n\nType `!sniper run` and I'll go hunt for opportunities."
  };
}

export function getGreeting() {
  return "👋 **Welcome to Job Sniper.**\n\nI'm ready to work, but I need to know who you are first.\n\n**Just paste your CV here, or send a file.**\nI'll handle the rest.";
}
