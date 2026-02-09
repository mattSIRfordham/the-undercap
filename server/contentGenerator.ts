import { invokeLLM } from "./_core/llm";
import { callDataApi } from "./_core/dataApi";
import { 
  createArticle, 
  createPoll, 
  linkArticleToCompany, 
  getCompanyByTicker,
  getAllCompanies,
  logContentGeneration,
  updateCompanyMarketCap
} from "./db";
import { InsertArticle, InsertPoll } from "../drizzle/schema";

/**
 * Generate a URL-safe slug from a title
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    + '-' + Date.now();
}

/**
 * Generate random initial votes for a poll (between 173 and 894)
 */
function generateInitialVotes(optionCount: number): number[] {
  const votes: number[] = [];
  for (let i = 0; i < optionCount; i++) {
    votes.push(Math.floor(Math.random() * (894 - 173 + 1)) + 173);
  }
  return votes;
}

/**
 * Fetch stock data for a company ticker
 */
async function fetchStockData(ticker: string) {
  try {
    const result = await callDataApi("YahooFinance/get_stock_chart", {
      query: {
        symbol: ticker,
        region: 'US',
        interval: '1d',
        range: '5d',
        includeAdjustedClose: true
      }
    }) as any;

    if (result && result.chart && result.chart.result && result.chart.result[0]) {
      const data = result.chart.result[0];
      return {
        meta: data.meta,
        quotes: data.indicators?.quote?.[0] || {},
        timestamps: data.timestamp || []
      };
    }
    return null;
  } catch (error) {
    console.error(`Error fetching stock data for ${ticker}:`, error);
    return null;
  }
}

/**
 * Fetch stock insights for a company
 */
async function fetchStockInsights(ticker: string) {
  try {
    const result = await callDataApi("YahooFinance/get_stock_insights", {
      query: { symbol: ticker }
    });
    return result;
  } catch (error) {
    console.error(`Error fetching stock insights for ${ticker}:`, error);
    return null;
  }
}

/**
 * Select random companies for article generation
 */
async function selectRandomCompanies(count: number = 3) {
  const allCompanies = await getAllCompanies(100);
  
  if (allCompanies.length === 0) {
    return [];
  }
  
  // Shuffle and select
  const shuffled = allCompanies.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, allCompanies.length));
}

/**
 * Generate article content using LLM with market data
 */
async function generateArticleContent(
  companies: Array<{ ticker: string; name: string; exchange: string }>,
  stockData: any[],
  category: 'market_analysis' | 'company_news' | 'regulatory' | 'opinion'
) {
  const companyInfo = companies.map((company, idx) => {
    const data = stockData[idx];
    if (!data || !data.meta) {
      return `${company.name} (${company.ticker}) - ${company.exchange}`;
    }
    
    const price = data.meta.regularMarketPrice || 'N/A';
    const change = data.meta.regularMarketChange || 0;
    const changePercent = data.meta.regularMarketChangePercent || 0;
    
    return `${company.name} (${company.ticker}) - ${company.exchange}
    Current Price: $${price}
    Change: ${change >= 0 ? '+' : ''}${change.toFixed(2)} (${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%)`;
  }).join('\n\n');

  const systemPrompt = `You are a financial news writer for The Undercap, a publication specializing in nanocap, microcap, and small-cap companies (under $1 billion market cap). 

Your editorial stance is that these companies are chronically underserved — by regulators, by institutional investors, by stock exchanges, and by government. They're essentially fighting with two hands tied behind their back, and The Undercap exists to cover what Wall Street won't.

Write engaging, informative articles that:
- Highlight opportunities and challenges in the small-cap space
- Provide fair analysis without hype or excessive negativity
- Acknowledge regulatory and structural disadvantages
- Focus on fundamentals and real business developments
- Use accessible language for retail investors

Category: ${category}`;

  const userPrompt = `Generate a news article about the following small-cap companies based on their recent market activity:

${companyInfo}

Requirements:
- Title: Compelling and SEO-friendly (60-80 characters)
- Excerpt: Brief summary (150-200 characters)
- Content: Full article (500-800 words)
- Include market data context
- Mention regulatory or structural challenges if relevant
- End with balanced outlook

Return ONLY a valid JSON object with this exact structure:
{
  "title": "article title here",
  "excerpt": "brief excerpt here",
  "content": "full article content in markdown format",
  "tags": ["tag1", "tag2", "tag3"]
}`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "article_content",
          strict: true,
          schema: {
            type: "object",
            properties: {
              title: { type: "string" },
              excerpt: { type: "string" },
              content: { type: "string" },
              tags: {
                type: "array",
                items: { type: "string" }
              }
            },
            required: ["title", "excerpt", "content", "tags"],
            additionalProperties: false
          }
        }
      }
    });

    const message = response.choices[0]?.message;
    if (!message || !message.content) {
      throw new Error("No content in LLM response");
    }

    const content = typeof message.content === 'string' ? message.content : JSON.stringify(message.content);
    return JSON.parse(content);
  } catch (error) {
    console.error("Error generating article content:", error);
    throw error;
  }
}

/**
 * Generate a poll question related to small-cap markets
 */
async function generatePollQuestion() {
  const systemPrompt = `You are creating poll questions for The Undercap, a small-cap stock news website. Create engaging, topical questions about small-cap investing, market regulation, or current issues affecting companies under $1B market cap.`;

  const userPrompt = `Generate a poll question with 3-4 answer options about small-cap stocks or market issues.

Return ONLY a valid JSON object:
{
  "question": "poll question here",
  "options": ["option 1", "option 2", "option 3", "option 4"]
}`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "poll_question",
          strict: true,
          schema: {
            type: "object",
            properties: {
              question: { type: "string" },
              options: {
                type: "array",
                items: { type: "string" }
              }
            },
            required: ["question", "options"],
            additionalProperties: false
          }
        }
      }
    });

    const message = response.choices[0]?.message;
    if (!message || !message.content) {
      throw new Error("No content in LLM response");
    }

    const content = typeof message.content === 'string' ? message.content : JSON.stringify(message.content);
    return JSON.parse(content);
  } catch (error) {
    console.error("Error generating poll question:", error);
    throw error;
  }
}

/**
 * Main content generation function - called by cron job
 */
export async function generateHourlyContent() {
  console.log('[ContentGenerator] Starting hourly content generation...');
  
  try {
    // Select random companies for this hour's article
    const selectedCompanies = await selectRandomCompanies(3);
    
    if (selectedCompanies.length === 0) {
      console.log('[ContentGenerator] No companies available for content generation');
      await logContentGeneration({
        status: 'skipped',
        errorMessage: 'No companies in database'
      });
      return;
    }

    // Fetch stock data for selected companies
    const stockDataPromises = selectedCompanies.map(c => fetchStockData(c.ticker));
    const stockData = await Promise.all(stockDataPromises);

    // Update market caps
    for (let i = 0; i < selectedCompanies.length; i++) {
      const company = selectedCompanies[i];
      const data = stockData[i];
      
      if (data && data.meta && data.meta.marketCap) {
        await updateCompanyMarketCap(company.ticker, data.meta.marketCap);
      }
    }

    // Determine article category (rotate through categories)
    const categories: Array<'market_analysis' | 'company_news' | 'regulatory' | 'opinion'> = 
      ['market_analysis', 'company_news', 'regulatory', 'opinion'];
    const category = categories[Math.floor(Math.random() * categories.length)];

    // Generate article content
    const articleData = await generateArticleContent(selectedCompanies, stockData, category);

    // Create article in database
    const slug = generateSlug(articleData.title);
    const articleInsert: InsertArticle = {
      title: articleData.title,
      slug,
      content: articleData.content,
      excerpt: articleData.excerpt,
      category,
      tags: JSON.stringify(articleData.tags),
      isPublished: true,
      publishedAt: new Date()
    };

    const result = await createArticle(articleInsert);
    const articleId = Number((result as any).insertId);

    // Link article to companies
    for (const company of selectedCompanies) {
      await linkArticleToCompany(articleId, company.id);
    }

    console.log(`[ContentGenerator] Created article: ${articleData.title} (ID: ${articleId})`);

    // Generate a poll every 4 hours (25% chance)
    if (Math.random() < 0.25) {
      const pollData = await generatePollQuestion();
      const initialVotes = generateInitialVotes(pollData.options.length);
      
      const pollInsert: InsertPoll = {
        question: pollData.question,
        options: JSON.stringify(pollData.options),
        initialVotes: JSON.stringify(initialVotes),
        articleId,
        isActive: true
      };

      await createPoll(pollInsert);
      console.log(`[ContentGenerator] Created poll: ${pollData.question}`);
    }

    // Log success
    await logContentGeneration({
      articleId,
      status: 'success'
    });

    console.log('[ContentGenerator] Hourly content generation completed successfully');
    
  } catch (error) {
    console.error('[ContentGenerator] Error during content generation:', error);
    await logContentGeneration({
      status: 'failed',
      errorMessage: error instanceof Error ? error.message : String(error)
    });
  }
}

/**
 * Seed initial companies for testing
 */
export async function seedInitialCompanies() {
  const seedCompanies = [
    { ticker: 'BBBY', name: 'Bed Bath & Beyond Inc.', exchange: 'NASDAQ', sector: 'Retail', industry: 'Home Furnishings' },
    { ticker: 'SNDL', name: 'Sundial Growers Inc.', exchange: 'NASDAQ', sector: 'Healthcare', industry: 'Cannabis' },
    { ticker: 'GNUS', name: 'Genius Brands International', exchange: 'NASDAQ', sector: 'Media', industry: 'Entertainment' },
    { ticker: 'ATOS', name: 'Atossa Therapeutics', exchange: 'NASDAQ', sector: 'Healthcare', industry: 'Biotechnology' },
    { ticker: 'NAKD', name: 'Naked Brand Group', exchange: 'NASDAQ', sector: 'Consumer Goods', industry: 'Apparel' }
  ];

  for (const company of seedCompanies) {
    const existing = await getCompanyByTicker(company.ticker);
    if (!existing) {
      // Note: These are example tickers - actual implementation would verify market caps
      console.log(`Seeding company: ${company.name} (${company.ticker})`);
    }
  }
}
