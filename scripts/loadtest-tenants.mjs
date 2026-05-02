import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const DEFAULT_MANIFEST_DIR = path.join(ROOT, "tmp", "loadtest-tenants");

function loadDotenv(file) {
  if (!existsSync(file)) return;
  const text = readFileSync(file, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const index = trimmed.indexOf("=");
    const key = trimmed.slice(0, index).trim();
    const rawValue = trimmed.slice(index + 1).trim();
    if (!process.env[key]) {
      process.env[key] = rawValue.replace(/^["']|["']$/g, "");
    }
  }
}

loadDotenv(path.join(ROOT, ".env.local"));
loadDotenv(path.join(ROOT, ".env"));

const args = process.argv.slice(2);
const command = args[0] || "help";

function arg(name, fallback) {
  const prefix = `--${name}=`;
  const found = args.find(item => item.startsWith(prefix));
  if (!found) return fallback;
  return found.slice(prefix.length);
}

const baseUrl = (arg("baseUrl", process.env.BARBER_PANEL_URL) || "").replace(/\/$/, "");
const apiKey = arg("apiKey", process.env.BARBER_SUPERADMIN_API_KEY);

function requireConfig() {
  if (!baseUrl) throw new Error("Falta BARBER_PANEL_URL o --baseUrl=https://...");
  if (!apiKey) throw new Error("Falta BARBER_SUPERADMIN_API_KEY o --apiKey=...");
}

async function api(pathname, options = {}) {
  requireConfig();
  const response = await fetch(`${baseUrl}/api/superadmin${pathname}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = payload?.error?.message || payload?.error || payload?.message || `HTTP ${response.status}`;
    throw new Error(message);
  }

  return payload;
}

function runId() {
  const now = new Date();
  const stamp = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
    String(now.getHours()).padStart(2, "0"),
    String(now.getMinutes()).padStart(2, "0"),
  ].join("");
  return `loadtest-${stamp}`;
}

function passwordFor(index) {
  return `LoadTest#${String(index).padStart(3, "0")}!2026`;
}

const BARBER_NAMES = [
  "Urban Fade Studio",
  "Navaja Real",
  "Corte Noble",
  "Distrito Barber",
  "La Silla Clasica",
  "Barberia Central",
  "Fade Republic",
  "El Buen Corte",
  "Black Comb Barber",
  "Tijera Norte",
  "Golden Razor",
  "Caballeros Club",
  "Studio 503 Barber",
  "La Barberia Premium",
  "Corte Fino",
  "Master Fade",
  "Barber House SV",
  "Navajas y Estilo",
  "Prime Cuts",
  "Punto Barber",
  "Royal Beard",
  "Classic Fade",
  "El Sillon Barber",
  "Next Cut Studio",
  "Barberia Avenida",
];

const SALON_NAMES = [
  "Luna Beauty Salon",
  "Studio Bella",
  "Rosa Glam",
  "Esencia Salon",
  "Mia Beauty House",
  "Salon Ambar",
  "Glamour Studio",
  "Dalia Beauty",
  "Amapola Salon",
  "Brillo Natural",
  "Aura Beauty Lab",
  "Salon Mariposa",
  "Belleza Central",
  "Studio Elegance",
  "Nacar Beauty",
  "Garden Salon",
  "Blush Studio",
  "Salon Magnolia",
  "Violeta Beauty",
  "Casa Belleza",
  "Salon Serena",
  "Golden Beauty",
  "Studio Perla",
  "Beauty Room SV",
  "Salon Aurora",
];

function slugify(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function tenantTemplate(index) {
  const isSalon = index % 3 === 0 || index % 5 === 0;
  const names = isSalon ? SALON_NAMES : BARBER_NAMES;
  const name = names[(index - 1) % names.length];
  const planCycle = ["BASIC", "PRO", "ENTERPRISE"];
  const plan = planCycle[(index - 1) % planCycle.length];

  return {
    name,
    businessType: isSalon ? "SALON" : "BARBERIA",
    plan,
  };
}

async function createTenants() {
  const count = Number(arg("count", "50"));
  const prefix = arg("prefix", runId());
  const forcedPlan = arg("plan", "");
  const forcedBusinessType = arg("businessType", "");

  await mkdir(DEFAULT_MANIFEST_DIR, { recursive: true });

  const created = [];
  for (let index = 1; index <= count; index += 1) {
    const suffix = String(index).padStart(3, "0");
    const template = tenantTemplate(index);
    const plan = forcedPlan || template.plan;
    const businessType = forcedBusinessType || template.businessType;
    const displayName = `${template.name} ${suffix}`;
    const slug = `${prefix}-${slugify(template.name)}-${suffix}`.toLowerCase();
    const body = {
      name: `LOADTEST ${displayName}`,
      slug,
      email: `loadtest-tenant-${suffix}@example.com`,
      phone: `7000-${suffix}`,
      city: "Load Test",
      plan,
      businessType,
      maxBarbers: 10,
      owner: {
        fullName: `LOADTEST Owner ${displayName}`,
        email: `loadtest-owner-${suffix}@example.com`,
        password: passwordFor(index),
      },
    };

    const tenant = await api("/tenants", { method: "POST", body });
    const superAdminPassword = `LoadSuper#${suffix}!2026`;
    const superAdmin = await api(`/tenants/${tenant.id}/users`, {
      method: "POST",
      body: {
        role: "SUPERADMIN",
        fullName: `LOADTEST SuperAdmin ${displayName}`,
        email: `loadtest-superadmin-${suffix}@example.com`,
        password: superAdminPassword,
      },
    });

    created.push({
      id: tenant.id,
      slug,
      name: body.name,
      ownerEmail: body.owner.email,
      ownerPassword: body.owner.password,
      superAdminId: superAdmin.id,
      superAdminEmail: superAdmin.email,
      superAdminPassword,
      plan,
      businessType,
    });
    console.log(`created ${index}/${count}: ${slug} (tenant ${tenant.id}, superadmin ${superAdmin.id})`);
  }

  const manifest = {
    createdAt: new Date().toISOString(),
    baseUrl,
    prefix,
    count: created.length,
    tenants: created,
  };
  const manifestPath = path.join(DEFAULT_MANIFEST_DIR, `${prefix}.json`);
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2));

  console.log(`\nmanifest=${manifestPath}`);
  console.log(`prefix=${prefix}`);
}

async function listTenants() {
  const prefix = arg("prefix", "loadtest");
  const result = await api(`/tenants?search=${encodeURIComponent(prefix)}&limit=100`);
  const items = result.items || [];
  console.log(`found=${items.length}`);
  for (const item of items) {
    console.log(`${item.id}\t${item.slug}\t${item.name}\t${item.status}\t${item.plan}`);
  }
}

async function deleteByManifest() {
  const manifestPath = arg("manifest", "");
  if (!manifestPath) throw new Error("Falta --manifest=archivo.json");

  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  const tenants = manifest.tenants || [];
  for (const tenant of tenants) {
    await api(`/tenants/${tenant.id}`, { method: "DELETE" });
    console.log(`deleted: ${tenant.slug} (id ${tenant.id})`);
  }
}

async function deleteByPrefix() {
  const prefix = arg("prefix", "");
  if (!prefix || !prefix.startsWith("loadtest")) {
    throw new Error("Por seguridad, --prefix debe comenzar con loadtest");
  }

  const result = await api(`/tenants?search=${encodeURIComponent(prefix)}&limit=100`);
  const items = (result.items || []).filter(item => item.slug.startsWith(prefix));
  for (const item of items) {
    await api(`/tenants/${item.id}`, { method: "DELETE" });
    console.log(`deleted: ${item.slug} (id ${item.id})`);
  }
  console.log(`deleted_count=${items.length}`);
}

function help() {
  console.log(`
Usage:
  node scripts/loadtest-tenants.mjs create --count=50 --prefix=loadtest-20260501 --plan=ENTERPRISE
  node scripts/loadtest-tenants.mjs list --prefix=loadtest-20260501
  node scripts/loadtest-tenants.mjs delete --manifest=tmp/loadtest-tenants/loadtest-20260501.json
  node scripts/loadtest-tenants.mjs delete-prefix --prefix=loadtest-20260501
`);
}

try {
  if (command === "create") await createTenants();
  else if (command === "list") await listTenants();
  else if (command === "delete") await deleteByManifest();
  else if (command === "delete-prefix") await deleteByPrefix();
  else help();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
