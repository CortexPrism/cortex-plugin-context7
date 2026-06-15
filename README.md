# cortex-plugin-context7

Inject up-to-date library documentation into agent context.

## Installation

```bash
cortex plugin install marketplace:cortex-plugin-context7
cortex plugin install github:CortexPrism/cortex-plugin-context7
cortex plugin install ./manifest.json
```

## Tools

### context7_get_docs
Get library documentation.
- `library` (string, required) — Library name (e.g. react, nextjs, prisma)
- `version` (string, default: "latest") — Library version
- `topic` (string, optional) — Specific topic in docs
- `format` (string, default: "markdown") — markdown or text

### context7_search
Search across library documentation.
- `query` (string, required) — Search query
- `libraries` (string, optional) — Comma-separated library names
- `max_results` (number, default: 5) — Maximum results

### context7_list_libraries
List supported libraries.
- `category` (string, optional) — Filter by category

### context7_inject
Inject documentation into agent context.
- `libraries` (string, required) — Comma-separated library names
- `topic` (string, optional) — Specific topic

## Configuration

Set max doc length and auto-inject behavior under the "General" section in plugin settings.

## Development

```bash
deno cache mod.ts
deno task test
deno fmt
deno lint
```

## License

MIT
