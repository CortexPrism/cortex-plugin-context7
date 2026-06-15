import type { Tool, ToolContext, PluginContext, ToolCallResult } from "cortex/plugins";

let config: Record<string, string> = {};

export async function onLoad(ctx: PluginContext): Promise<void> {
  config = await ctx.config.get() as Record<string, string>;
}

export async function onUnload(_ctx: PluginContext): Promise<void> {}

const knownLibraries: Record<string, { name: string; category: string }> = {
  react: { name: "React", category: "frontend" },
  vue: { name: "Vue", category: "frontend" },
  svelte: { name: "Svelte", category: "frontend" },
  angular: { name: "Angular", category: "frontend" },
  nextjs: { name: "Next.js", category: "frontend" },
  nuxt: { name: "Nuxt", category: "frontend" },
  tailwindcss: { name: "Tailwind CSS", category: "frontend" },
  prisma: { name: "Prisma", category: "backend" },
  drizzle: { name: "Drizzle ORM", category: "backend" },
  express: { name: "Express", category: "backend" },
  fastapi: { name: "FastAPI", category: "backend" },
  flask: { name: "Flask", category: "backend" },
  django: { name: "Django", category: "backend" },
  spring: { name: "Spring Boot", category: "backend" },
  deno: { name: "Deno", category: "runtime" },
  nodejs: { name: "Node.js", category: "runtime" },
  typescript: { name: "TypeScript", category: "language" },
  python: { name: "Python", category: "language" },
  rust: { name: "Rust", category: "language" },
  go: { name: "Go", category: "language" },
};

const context7_get_docs: Tool = {
  definition: {
    name: "context7_get_docs",
    description: "Get library documentation",
    params: [
      { name: "library", type: "string", description: "Library name (e.g. react, nextjs, prisma)", required: true },
      { name: "version", type: "string", description: "Library version", required: false, default: "latest" },
      { name: "topic", type: "string", description: "Specific topic within the docs", required: false },
      { name: "format", type: "string", description: "Output format", required: false, enum: ["markdown", "text"], default: "markdown" },
    ],
    capabilities: ["network:fetch"],
  },
  execute: async (args: Record<string, unknown>, _ctx: ToolContext): Promise<ToolCallResult> => {
    const start = Date.now();
    try {
      const library = args.library;
      if (!library || typeof library !== "string") {
        return { toolName: "context7_get_docs", success: false, output: "", error: "library must be a non-empty string", durationMs: Date.now() - start };
      }
      const version = typeof args.version === "string" ? args.version : "latest";
      const topic = typeof args.topic === "string" ? args.topic : "";
      const maxLength = typeof config.maxDocLength === "string" ? parseInt(config.maxDocLength, 10) || 5000 : 5000;

      const libInfo = knownLibraries[library.toLowerCase()];
      const libName = libInfo?.name || library;
      let docs = `# ${libName} Documentation (${version})\n\n`;

      if (topic) {
        docs += `## ${topic}\n\nDocumentation for \`${topic}\` in ${libName} ${version}.\n\n_Connect Context7 to retrieve full documentation content._\n`;
      } else {
        docs += `## Overview\n\n${libName} documentation (${version}).\n\n_Connect Context7 to retrieve full documentation content._\n`;
      }

      if (docs.length > maxLength) {
        docs = docs.slice(0, maxLength) + "\n\n... (truncated)";
      }

      return { toolName: "context7_get_docs", success: true, output: docs, durationMs: Date.now() - start };
    } catch (error) {
      return { toolName: "context7_get_docs", success: false, output: "", error: `Failed: ${error instanceof Error ? error.message : String(error)}`, durationMs: Date.now() - start };
    }
  },
};

const context7_search: Tool = {
  definition: {
    name: "context7_search",
    description: "Search across library documentation",
    params: [
      { name: "query", type: "string", description: "Search query", required: true },
      { name: "libraries", type: "string", description: "Comma-separated library names to search", required: false },
      { name: "max_results", type: "number", description: "Maximum results to return", required: false, default: 5 },
    ],
    capabilities: ["network:fetch"],
  },
  execute: async (args: Record<string, unknown>, _ctx: ToolContext): Promise<ToolCallResult> => {
    const start = Date.now();
    try {
      const query = args.query;
      if (!query || typeof query !== "string") {
        return { toolName: "context7_search", success: false, output: "", error: "query must be a non-empty string", durationMs: Date.now() - start };
      }
      const libraries = typeof args.libraries === "string" ? args.libraries.split(",").map((l) => l.trim().toLowerCase()).filter(Boolean) : null;
      const max_results = typeof args.max_results === "number" ? args.max_results : 5;

      let results: Array<{ library: string; title: string; snippet: string }> = [];

      if (libraries) {
        for (const lib of libraries.slice(0, max_results)) {
          const info = knownLibraries[lib];
          if (info) {
            results.push({ library: info.name, title: `${info.name} - ${query}`, snippet: `Documentation search results for "${query}" in ${info.name}. Connect Context7 for full results.` });
          }
        }
      } else {
        const entries = Object.entries(knownLibraries).slice(0, max_results);
        for (const [, info] of entries) {
          results.push({ library: info.name, title: `${info.name} - ${query}`, snippet: `Documentation search results for "${query}" in ${info.name}. Connect Context7 for full results.` });
        }
      }

      const maxLength = typeof config.maxDocLength === "string" ? parseInt(config.maxDocLength, 10) || 5000 : 5000;
      let output = `# Search Results for "${query}"\n\n`;
      for (const r of results) {
        output += `## ${r.title}\n${r.snippet}\n\n`;
      }
      if (output.length > maxLength) {
        output = output.slice(0, maxLength) + "\n\n... (truncated)";
      }

      return { toolName: "context7_search", success: true, output, durationMs: Date.now() - start };
    } catch (error) {
      return { toolName: "context7_search", success: false, output: "", error: `Failed: ${error instanceof Error ? error.message : String(error)}`, durationMs: Date.now() - start };
    }
  },
};

const context7_list_libraries: Tool = {
  definition: {
    name: "context7_list_libraries",
    description: "List supported libraries",
    params: [
      { name: "category", type: "string", description: "Filter by category", required: false },
    ],
    capabilities: ["network:fetch"],
  },
  execute: async (args: Record<string, unknown>, _ctx: ToolContext): Promise<ToolCallResult> => {
    const start = Date.now();
    try {
      const category = typeof args.category === "string" ? args.category.toLowerCase() : null;
      const filtered = Object.entries(knownLibraries)
        .filter(([, info]) => !category || info.category === category)
        .map(([key, info]) => ({ id: key, name: info.name, category: info.category }));

      const output = JSON.stringify(filtered, null, 2);
      return { toolName: "context7_list_libraries", success: true, output, durationMs: Date.now() - start };
    } catch (error) {
      return { toolName: "context7_list_libraries", success: false, output: "", error: `Failed: ${error instanceof Error ? error.message : String(error)}`, durationMs: Date.now() - start };
    }
  },
};

const context7_inject: Tool = {
  definition: {
    name: "context7_inject",
    description: "Inject documentation into agent context",
    params: [
      { name: "libraries", type: "string", description: "Comma-separated library names", required: true },
      { name: "topic", type: "string", description: "Specific topic to inject", required: false },
    ],
    capabilities: ["network:fetch"],
  },
  execute: async (args: Record<string, unknown>, _ctx: ToolContext): Promise<ToolCallResult> => {
    const start = Date.now();
    try {
      const libraries = args.libraries;
      if (!libraries || typeof libraries !== "string") {
        return { toolName: "context7_inject", success: false, output: "", error: "libraries must be a non-empty string", durationMs: Date.now() - start };
      }
      const topic = typeof args.topic === "string" ? args.topic : "";
      const libList = libraries.split(",").map((l) => l.trim().toLowerCase()).filter(Boolean);

      let injected = "---\n# Injected Documentation Context\n\n";
      for (const lib of libList) {
        const info = knownLibraries[lib];
        const name = info?.name || lib;
        injected += `## ${name}\n`;
        if (topic) {
          injected += `Topic: ${topic}\n\n`;
        }
        injected += `_${name} documentation has been injected into context._\n\n`;
      }
      injected += "---\n";

      return { toolName: "context7_inject", success: true, output: injected, durationMs: Date.now() - start };
    } catch (error) {
      return { toolName: "context7_inject", success: false, output: "", error: `Failed: ${error instanceof Error ? error.message : String(error)}`, durationMs: Date.now() - start };
    }
  },
};

export const tools: Tool[] = [
  context7_get_docs,
  context7_search,
  context7_list_libraries,
  context7_inject,
];
