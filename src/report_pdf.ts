import { Database } from "bun:sqlite";
import * as fs from "fs";

export async function generateMatchReport(db: Database) {
  console.log("📄 Generating PDF Match Report...");
  const jobs = db.query("SELECT * FROM jobs WHERE category != 'Low Match' ORDER BY match_score DESC").all() as any[];

  if (jobs.length === 0) {
    console.log("⚠️ No high-match jobs found for PDF report.");
    return;
  }

  const rows = jobs.map(j => `
    <tr>
        <td>${j.company}</td>
        <td>${j.title}</td>
        <td>${j.category}</td>
        <td>${j.match_score}%</td>
        <td>${j.relevant_projects}</td>
    </tr>
  `).join("");

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: sans-serif; padding: 40px; background: #fff; color: #333; }
            h1 { color: #6366f1; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #f9fafb; font-weight: bold; }
            .good { color: #10b981; font-weight: bold; }
        </style>
    </head>
    <body>
        <h1>Claw Job Sniper: Match Report</h1>
        <p>Generated on: ${new Date().toLocaleString()}</p>
        <table>
            <thead>
                <tr>
                    <th>Company</th>
                    <th>Role</th>
                    <th>Tier</th>
                    <th>Score</th>
                    <th>Linked Projects</th>
                </tr>
            </thead>
            <tbody>
                ${rows}
            </tbody>
        </table>
    </body>
    </html>
  `;

  fs.writeFileSync("data/report_temp.html", html);
  console.log("✅ Match Report HTML generated at data/report_temp.html");
  
  // Instruction for OpenClaw to print this to PDF
  return "data/report_temp.html";
}
