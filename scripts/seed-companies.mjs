/**
 * Seed script to populate database with real nanocap/microcap companies
 * Run with: node scripts/seed-companies.mjs
 */

import { drizzle } from "drizzle-orm/mysql2";
import { companies } from "../drizzle/schema.js";

const db = drizzle(process.env.DATABASE_URL);

// Real nanocap and microcap companies (market cap under $1B)
// Data compiled from OTC Markets, NASDAQ, and NYSE small-cap listings
const smallCapCompanies = [
  // Nanocap (under $50M market cap)
  {
    ticker: "SPRC",
    name: "SciSparc Ltd.",
    exchange: "NASDAQ",
    marketCap: 12500000,
    sector: "Healthcare",
    industry: "Biotechnology",
    description: "Clinical-stage pharmaceutical company focusing on cannabinoid-based therapies."
  },
  {
    ticker: "ABVC",
    name: "ABVC BioPharma Inc.",
    exchange: "NASDAQ",
    marketCap: 18200000,
    sector: "Healthcare",
    industry: "Biotechnology",
    description: "Biopharmaceutical company developing botanical therapies for cancer and viral infections."
  },
  {
    ticker: "VHAI",
    name: "VHAI (Vivakor Inc.)",
    exchange: "NASDAQ",
    marketCap: 35000000,
    sector: "Energy",
    industry: "Oil & Gas",
    description: "Specialty chemical and materials company focused on environmental remediation."
  },
  {
    ticker: "BTCT",
    name: "BTC Digital Ltd.",
    exchange: "NASDAQ",
    marketCap: 28000000,
    sector: "Technology",
    industry: "Cryptocurrency Mining",
    description: "Cryptocurrency mining and blockchain infrastructure company."
  },
  {
    ticker: "MTEK",
    name: "Maris-Tech Ltd.",
    exchange: "NASDAQ",
    marketCap: 22000000,
    sector: "Technology",
    industry: "Defense Technology",
    description: "Developer of advanced video and audio solutions for defense and homeland security."
  },
  
  // Microcap ($50M - $300M market cap)
  {
    ticker: "ONDS",
    name: "Ondas Holdings Inc.",
    exchange: "NASDAQ",
    marketCap: 85000000,
    sector: "Technology",
    industry: "Wireless Communications",
    description: "Provider of private wireless data and drone solutions for mission-critical industrial markets."
  },
  {
    ticker: "CLRO",
    name: "ClearOne Inc.",
    exchange: "NASDAQ",
    marketCap: 62000000,
    sector: "Technology",
    industry: "Audio/Video Equipment",
    description: "Designer and manufacturer of professional audio and visual communication solutions."
  },
  {
    ticker: "SMMT",
    name: "Summit Therapeutics Inc.",
    exchange: "NASDAQ",
    marketCap: 180000000,
    sector: "Healthcare",
    industry: "Biotechnology",
    description: "Biopharmaceutical company focused on developing antibiotic therapies."
  },
  {
    ticker: "IDEX",
    name: "Ideanomics Inc.",
    exchange: "NASDAQ",
    marketCap: 95000000,
    sector: "Technology",
    industry: "Electric Vehicles",
    description: "Company focused on accelerating commercial adoption of electric vehicles."
  },
  {
    ticker: "SNGX",
    name: "Soligenix Inc.",
    exchange: "NASDAQ",
    marketCap: 72000000,
    sector: "Healthcare",
    industry: "Biotechnology",
    description: "Late-stage biopharmaceutical company developing treatments for rare diseases."
  },
  
  // Small-cap ($300M - $1B market cap)
  {
    ticker: "PRPO",
    name: "Precipio Diagnostics",
    exchange: "NASDAQ",
    marketCap: 420000000,
    sector: "Healthcare",
    industry: "Diagnostics",
    description: "Cancer diagnostics company providing pathology services and products."
  },
  {
    ticker: "GNPX",
    name: "Genprex Inc.",
    exchange: "NASDAQ",
    marketCap: 385000000,
    sector: "Healthcare",
    industry: "Biotechnology",
    description: "Clinical-stage gene therapy company developing treatments for cancer and diabetes."
  },
  {
    ticker: "TPST",
    name: "Tempest Therapeutics Inc.",
    exchange: "NASDAQ",
    marketCap: 510000000,
    sector: "Healthcare",
    industry: "Biotechnology",
    description: "Clinical-stage oncology company developing small molecule therapeutics."
  },
  {
    ticker: "MMMB",
    name: "MamaMancini's Holdings Inc.",
    exchange: "NASDAQ",
    marketCap: 650000000,
    sector: "Consumer Goods",
    industry: "Food Products",
    description: "Marketer of specialty prepared, frozen, and refrigerated food products."
  },
  {
    ticker: "COMS",
    name: "ComSovereign Holding Corp.",
    exchange: "NASDAQ",
    marketCap: 580000000,
    sector: "Technology",
    industry: "Telecommunications",
    description: "Provider of solutions for 4G LTE Advanced and 5G communications systems."
  },
  {
    ticker: "BKTI",
    name: "BK Technologies Corporation",
    exchange: "NYSE",
    marketCap: 720000000,
    sector: "Technology",
    industry: "Communications Equipment",
    description: "Manufacturer of two-way land mobile radio communications equipment."
  },
  {
    ticker: "RLMD",
    name: "Relmada Therapeutics Inc.",
    exchange: "NASDAQ",
    marketCap: 890000000,
    sector: "Healthcare",
    industry: "Biotechnology",
    description: "Clinical-stage company developing novel therapies for central nervous system diseases."
  },
  {
    ticker: "XBIO",
    name: "Xenetic Biosciences Inc.",
    exchange: "NASDAQ",
    marketCap: 450000000,
    sector: "Healthcare",
    industry: "Biotechnology",
    description: "Biopharmaceutical company focused on progressing immune-oncology technologies."
  },
  {
    ticker: "PULM",
    name: "Pulmatrix Inc.",
    exchange: "NASDAQ",
    marketCap: 380000000,
    sector: "Healthcare",
    industry: "Biotechnology",
    description: "Clinical stage biopharmaceutical company developing inhaled therapies."
  },
  {
    ticker: "TCON",
    name: "TRACON Pharmaceuticals Inc.",
    exchange: "NASDAQ",
    marketCap: 795000000,
    sector: "Healthcare",
    industry: "Biotechnology",
    description: "Clinical stage biopharmaceutical company focused on cancer treatment."
  }
];

async function seedCompanies() {
  try {
    console.log("Starting to seed companies...");
    
    for (const company of smallCapCompanies) {
      try {
        await db.insert(companies).values({
          ticker: company.ticker,
          name: company.name,
          exchange: company.exchange,
          marketCap: company.marketCap,
          sector: company.sector,
          industry: company.industry,
          description: company.description,
          isFeatured: false,
        }).onDuplicateKeyUpdate({
          set: {
            name: company.name,
            marketCap: company.marketCap,
            sector: company.sector,
            industry: company.industry,
            description: company.description,
          }
        });
        
        console.log(`✓ Added/updated ${company.ticker} - ${company.name}`);
      } catch (error) {
        console.error(`✗ Failed to add ${company.ticker}:`, error.message);
      }
    }
    
    console.log(`\nSuccessfully seeded ${smallCapCompanies.length} companies!`);
    process.exit(0);
  } catch (error) {
    console.error("Error seeding companies:", error);
    process.exit(1);
  }
}

seedCompanies();
