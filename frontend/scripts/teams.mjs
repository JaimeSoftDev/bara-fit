import { chromium } from "playwright";

const SHOTS = "/tmp/claude-0/-home-user-bara-fit/1b5b586e-f812-5fd9-b6ce-5bef2dc22369/scratchpad/teams";
const BASE = "http://localhost:5173";

const browser = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
  args: ["--no-sandbox"],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
page.on("console", (msg) => { if (msg.type() === "error") errors.push(msg.text()); });
page.on("pageerror", (err) => errors.push(String(err)));

async function shot(name) {
  await page.screenshot({ path: `${SHOTS}/${name}.png` });
}

await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded" });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: "domcontentloaded" });
await page.fill("input[type=email]", "carlos@barafit.app");
await page.fill("input[type=password]", "password");
await page.click("button[type=submit]");
await page.waitForURL("**/trainer");

// Settings: team + branding
await page.goto(`${BASE}/trainer/settings`, { waitUntil: "domcontentloaded" });
await page.getByText("BaraFit Gym Central").first().waitFor();
await page.getByText("Cargando...").waitFor({ state: "hidden", timeout: 15000 }).catch(() => {});
await shot("01-settings-team");

// Change brand color (use the paired text input, color swatches aren't fill()-able)
const colorTextInput = page.locator('label:has-text("Color de marca") input:not([type="color"])');
await colorTextInput.waitFor({ timeout: 15000 });
await colorTextInput.fill("#16a34a");
await page.getByRole("button", { name: "Guardar color" }).click();
await page.waitForTimeout(1000);
await shot("02-settings-color-changed");

// Check the brand color actually applied to bg-brand-600 elements
const brandVar = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--color-brand-600").trim());
console.log("Applied --color-brand-600:", brandVar);

// Invite a trainer
await page.getByPlaceholder("Nombre").click();
await page.getByPlaceholder("Nombre").fill("Trainer Playwright");
await page.getByPlaceholder("Correo").fill(`pw-trainer-${Date.now()}@example.com`);
await page.getByRole("button", { name: "Invitar", exact: true }).click();
await page.getByText("Invitación creada").waitFor({ timeout: 10000 });
await shot("03-settings-invite-created");

// Team calendar
await page.goto(`${BASE}/trainer/team/calendar`, { waitUntil: "domcontentloaded" });
await page.getByText("Ana Torres").first().waitFor();
await shot("04-team-calendar");

// Payroll
await page.goto(`${BASE}/trainer/team/payroll`, { waitUntil: "domcontentloaded" });
await page.getByText("Agosto 2026").waitFor({ timeout: 10000 });
await shot("05-payroll");
// mark pending one as paid
const payBtn = page.getByRole("button", { name: "Marcar pagado" }).first();
if (await payBtn.count()) {
  await payBtn.click();
  await page.waitForTimeout(800);
}
await shot("06-payroll-paid");

// Check-in flow on calendar
await page.goto(`${BASE}/trainer/calendar`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(500);
await shot("07-calendar-before-checkin");
const sessionCheckin = page.locator("button[title='Marcar asistencia']").first();
if (await sessionCheckin.count()) {
  await sessionCheckin.click();
  await page.waitForTimeout(800);
}
await shot("08-calendar-after-checkin");

console.log("ERRORS:", JSON.stringify(errors, null, 2));
await browser.close();
