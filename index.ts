import { initDB } from "./src/db";
import { runScout } from "./src/scout";
import { calculateMatches } from "./src/matcher";
import { draftOutreach } from "./src/writer";
import { startServer } from "./src/server";
import { processCV, getGreeting } from "./src/onboard";
import * as fs from "fs";

if (!fs.existsSync("data")) fs.mkdirSync("data");

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const db = initDB();

  // Phase 1: Greeting Engine
  // If no profile exists and no command is specifically trying to onboard/help, intercept.
  const profileExists = fs.existsSync("profile/cv.md");

  if (!command) {
    if (!profileExists) {
      console.log(getGreeting());
    } else {
      printHelp();
    }
    return;
  }

  if (command === "onboard") {
    const input = args.slice(1).join(" ");
    if (!input) {
      console.log(getGreeting());
    } else {
      const result = await processCV(input);
      console.log(result.message);
    }
  } else if (command === "run") {
    if (!profileExists) {
      console.log("⚠️ I don't know who you are yet. Please send me your CV first (use `!sniper onboard`).");
      return;
    }
    console.log("🚀 **Heading out.** I'm scanning the job markets for you...");
    const { totalFound, totalNew } = await runScout();
    await calculateMatches(db);
    console.log(`\n🌌 **Back.** I found ${totalFound} total jobs. ${totalNew} are new since my last run.`);
  } else if (command === "serve") {
    startServer();
  } else if (command === "draft") {
    const jobId = parseInt(args[1]);
    if (isNaN(jobId)) {
      console.log("Just tell me which Job ID you want the pitch for (e.g., `!sniper draft 42`).");
      return;
    }
    console.log("✍️ **On it.** Writing your pitch now...");
    const draft = await draftOutreach(db, jobId);
    console.log("\n--- YOUR APPLICATION PITCH ---\n");
    console.log(draft);
  } else if (command === "digest") {
    const limit = parseInt(args[1]) || 5;
    const jobs = db.query("SELECT id, title, company, match_score FROM jobs WHERE status = 'analyzed' AND match_score > 0 ORDER BY match_score DESC LIMIT ?").all(limit) as any[];
    
    if (jobs.length === 0) {
      console.log("Nothing strong yet. Send me to hunt (`!sniper run`) and I'll look again.");
      return;
    }

    console.log(`\n📬 **Top ${jobs.length} Matches:**\n`);
    jobs.forEach((j, i) => {
      console.log(`${i+1}. [ID: ${j.id}] **${j.title}** @ ${j.company} (${j.match_score}%)`);
    });
    console.log("\nSee one you like? Type `!sniper draft [ID]` and I'll write the email.");
  } else if (command === "blacklist") {
    const company = args.slice(1).join(" ");
    if (!company) {
      console.log("Who should I ignore? (e.g., `!sniper blacklist EvilCorp`)");
      return;
    }
    const config = JSON.parse(fs.readFileSync("config.json", "utf8"));
    if (!config.blacklist.companies.includes(company)) {
      config.blacklist.companies.push(company);
      fs.writeFileSync("config.json", JSON.stringify(config, null, 2));
      console.log(`✅ Done. I won't bother you with **${company}** again.`);
    }
  } else {
    // If unknown command or 'help', show menu
    printHelp();
  }
}

function printHelp() {
  console.log("🌌 **Job Sniper Interface**");
  console.log("----------------------------");
  console.log("`!sniper onboard`    - Update your profile (paste text or attach CV).");
  console.log("`!sniper run`        - I'll go hunt for jobs.");
  console.log("`!sniper digest`     - Show me the best matches.");
  console.log("`!sniper draft [ID]` - Write an application email for a job.");
  console.log("`!sniper blacklist`  - Block a company.");
}

main().catch(console.error);
