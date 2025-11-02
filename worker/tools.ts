import type { WeatherResult, ErrorResult, CanvasContent } from './types';
import { mcpManager } from './mcp-client';
import type { ChatHandler } from './chat';
import type { ChatAgent } from './agent';
export type ToolResult = WeatherResult | { content: string } | ErrorResult | CanvasContent;
interface SerpApiResponse {
  knowledge_graph?: { title?: string; description?: string; source?: { link?: string } };
  answer_box?: { answer?: string; snippet?: string; title?: string; link?: string };
  organic_results?: Array<{ title?: string; link?: string; snippet?: string }>;
  local_results?: Array<{ title?: string; address?: string; phone?: string; rating?: number }>;
  error?: string;
}
const customTools = [
  {
    type: 'function' as const,
    function: {
      name: 'get_weather',
      description: 'Get current weather information for a location',
      parameters: {
        type: 'object',
        properties: { location: { type: 'string', description: 'The city or location name' } },
        required: ['location']
      }
    }
  },
  {
    type: 'function' as const,
    function: {
      name: 'web_search',
      description: 'Search the web using Google or fetch content from a specific URL',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search query for Google search' },
          url: { type: 'string', description: 'Specific URL to fetch content from (alternative to search)' },
          num_results: { type: 'number', description: 'Number of search results to return (default: 5, max: 10)', default: 5 }
        },
        required: []
      }
    }
  },
  {
    type: 'function' as const,
    function: {
      name: 'display_on_canvas',
      description: 'Display rich content like markdown or code snippets on a dedicated canvas panel in the UI.',
      parameters: {
        type: 'object',
        properties: {
          contentType: { type: 'string', description: 'The type of content to display. e.g., "markdown", "code", "mermaid".' },
          content: { type: 'string', description: 'The actual content to display.' }
        },
        required: ['contentType', 'content']
      }
    }
  },
  {
    type: 'function' as const,
    function: {
      name: 'generate_diagram',
      description: 'Generate a Mermaid syntax diagram (e.g., flowchart, sequence diagram) based on a description and display it on the canvas.',
      parameters: {
        type: 'object',
        properties: {
          description: { type: 'string', description: 'A detailed description of the diagram to generate.' },
        },
        required: ['description']
      }
    }
  },
  {
    type: 'function' as const,
    function: {
      name: 'list_files',
      description: 'List all files in the current project workspace.',
      parameters: { type: 'object', properties: {} }
    }
  },
  {
    type: 'function' as const,
    function: {
      name: 'read_file',
      description: 'Read the content of a specific file from the workspace.',
      parameters: {
        type: 'object',
        properties: {
          filename: { type: 'string', description: 'The full path of the file to read.' }
        },
        required: ['filename']
      }
    }
  },
  {
    type: 'function' as const,
    function: {
      name: 'write_file',
      description: 'Write or overwrite a file in the workspace with new content.',
      parameters: {
        type: 'object',
        properties: {
          filename: { type: 'string', description: 'The full path of the file to write.' },
          content: { type: 'string', description: 'The new content for the file.' }
        },
        required: ['filename', 'content']
      }
    }
  }
];
export async function getToolDefinitions() {
  const mcpTools = await mcpManager.getToolDefinitions();
  return [...customTools, ...mcpTools];
}
const createSearchUrl = (query: string, apiKey: string, numResults: number) => {
  const url = new URL('https://serpapi.com/search');
  url.searchParams.set('engine', 'google');
  url.searchParams.set('q', query);
  url.searchParams.set('api_key', apiKey);
  url.searchParams.set('num', Math.min(numResults, 10).toString());
  return url.toString();
};
const formatSearchResults = (data: SerpApiResponse, query: string, numResults: number): string => {
  const results: string[] = [];
  if (data.knowledge_graph?.title && data.knowledge_graph.description) {
    results.push(`**${data.knowledge_graph.title}**\n${data.knowledge_graph.description}`);
    if (data.knowledge_graph.source?.link) results.push(`Source: ${data.knowledge_graph.source.link}`);
  }
  if (data.answer_box) {
    const { answer, snippet, title, link } = data.answer_box;
    if (answer) results.push(`**Answer**: ${answer}`);
    else if (snippet) results.push(`**${title || 'Answer'}**: ${snippet}`);
    if (link) results.push(`Source: ${link}`);
  }
  if (data.organic_results?.length) {
    results.push('\n**Search Results:**');
    data.organic_results.slice(0, numResults).forEach((result, index) => {
      if (result.title && result.link) {
        const text = [`${index + 1}. **${result.title}**`];
        if (result.snippet) text.push(`   ${result.snippet}`);
        text.push(`   Link: ${result.link}`);
        results.push(text.join('\n'));
      }
    });
  }
  if (data.local_results?.length) {
    results.push('\n**Local Results:**');
    data.local_results.slice(0, 3).forEach((result, index) => {
      if (result.title) {
        const text = [`${index + 1}. **${result.title}**`];
        if (result.address) text.push(`   Address: ${result.address}`);
        if (result.phone) text.push(`   Phone: ${result.phone}`);
        if (result.rating) text.push(`   Rating: ${result.rating} stars`);
        results.push(text.join('\n'));
      }
    });
  }
  return results.length ? `🔍 Search results for "${query}":\n\n${results.join('\n\n')}`
    : `No results found for "${query}". Try: https://www.google.com/search?q=${encodeURIComponent(query)}`;
};
async function performWebSearch(query: string, numResults = 5): Promise<string> {
  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) {
    return `🔍 Web search requires SerpAPI key. Get one at https://serpapi.com/\nFallback: https://www.google.com/search?q=${encodeURIComponent(query)}`;
  }
  try {
    const response = await fetch(createSearchUrl(query, apiKey, numResults), {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; WebBot/1.0)', 'Accept': 'application/json' },
      signal: AbortSignal.timeout(15000)
    });
    if (!response.ok) throw new Error(`SerpAPI returned ${response.status}`);
    const data: SerpApiResponse = await response.json();
    if (data.error) throw new Error(`SerpAPI error: ${data.error}`);
    return formatSearchResults(data, query, numResults);
  } catch (error) {
    const isTimeout = error instanceof Error && error.message.includes('timeout');
    const fallback = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    return `Search failed: ${isTimeout ? 'timeout' : 'API error'}. Try: ${fallback}`;
  }
}
const extractTextFromHtml = (html: string): string => html
  .replace(/<(script|style|noscript)[^>]*>[\s\S]*?<\/\1>/gi, '')
  .replace(/<[^>]*>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();
async function fetchWebContent(url: string): Promise<string> {
  try {
    new URL(url);
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; WebBot/1.0)' },
      signal: AbortSignal.timeout(10000)
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/')) throw new Error('Unsupported content type');
    const html = await response.text();
    const text = extractTextFromHtml(html);
    return text.length ? `Content from ${url}:\n\n${text.slice(0, 4000)}${text.length > 4000 ? '...' : ''}`
      : `No readable content found at ${url}`;
  } catch (error) {
    throw new Error(`Failed to fetch: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
export async function executeTool(name: string, args: Record<string, unknown>, agent: ChatAgent, chatHandler: ChatHandler): Promise<ToolResult> {
  try {
    switch (name) {
      case 'get_weather':
        return {
          location: args.location as string,
          temperature: Math.floor(Math.random() * 40) - 10,
          condition: ['Sunny', 'Cloudy', 'Rainy', 'Snowy'][Math.floor(Math.random() * 4)],
          humidity: Math.floor(Math.random() * 100)
        };
      case 'web_search': {
        const { query, url, num_results = 5 } = args;
        if (typeof url === 'string') {
          const content = await fetchWebContent(url);
          return { content };
        }
        if (typeof query === 'string') {
          const content = await performWebSearch(query, num_results as number);
          return { content };
        }
        return { error: 'Either query or url parameter is required' };
      }
      case 'display_on_canvas':
        return {
          contentType: args.contentType as string,
          content: args.content as string
        };
      case 'generate_diagram': {
        const description = args.description as string;
        if (!description) {
          return { error: 'Diagram description is required.' };
        }
        const completion = await chatHandler.client.chat.completions.create({
          model: chatHandler.model,
          messages: [
            {
              role: 'system',
              content: 'You are a Mermaid syntax expert. Generate only the Mermaid code for the given description. Do not include any explanations or markdown fences like ```mermaid.',
            },
            { role: 'user', content: `Generate a Mermaid diagram for: ${description}` },
          ],
          max_tokens: 2000,
        });
        const mermaidSyntax = completion.choices[0]?.message?.content?.trim();
        if (!mermaidSyntax) {
          return { error: 'Failed to generate diagram syntax.' };
        }
        return {
          contentType: 'mermaid',
          content: mermaidSyntax,
        };
      }
      case 'list_files': {
        const files = agent.state.files || {};
        const fileList = Object.keys(files);
        return { content: fileList.length > 0 ? `Files in workspace:\n- ${fileList.join('\n- ')}` : 'The workspace is empty.' };
      }
      case 'read_file': {
        const filename = args.filename as string;
        const files = agent.state.files || {};
        if (filename in files) {
          return { content: files[filename] };
        }
        return { error: `File not found: ${filename}` };
      }
      case 'write_file': {
        const filename = args.filename as string;
        const content = args.content as string;
        const currentFiles = agent.state.files || {};
        agent.setState({ ...agent.state, files: { ...currentFiles, [filename]: content } });
        return { content: `File "${filename}" has been written successfully.` };
      }
      default: {
        const content = await mcpManager.executeTool(name, args);
        return { content };
      }
    }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}