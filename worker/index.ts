import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { Env, getAppController, registerSession, unregisterSession } from "./core-utils";
import { API_RESPONSES } from "./config";
import { ChatAgent } from "./agent";
import { AppController } from "./app-controller";
import { getAgentByName } from "agents";
import { getToolDefinitions } from "./tools";
export { ChatAgent, AppController };
export interface ClientErrorReport {
  message: string;
  url: string;
  userAgent: string;
  timestamp: string;
  stack?: string;
  componentStack?: string;
  errorBoundary?: boolean;
  errorBoundaryProps?: Record<string, unknown>;
  source?: string;
  lineno?: number;
  colno?: number;
  error?: unknown;
}
const app = new Hono<{ Bindings: Env }>();
app.use("*", logger());
app.use(
  "/api/*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  })
);
// Core agent routing
app.all('/api/chat/:sessionId/*', async (c) => {
  try {
    const sessionId = c.req.param('sessionId');
    const agent = await getAgentByName<Env, ChatAgent>(c.env.CHAT_AGENT, sessionId);
    const url = new URL(c.req.url);
    url.pathname = url.pathname.replace(`/api/chat/${sessionId}`, '');
    return agent.fetch(new Request(url.toString(), {
      method: c.req.method,
      headers: c.req.header(),
      body: c.req.method === 'GET' || c.req.method === 'DELETE' ? undefined : c.req.raw.body
    }));
  } catch (error) {
    console.error('Agent routing error:', error);
    return c.json({
      success: false,
      error: API_RESPONSES.AGENT_ROUTING_FAILED
    }, { status: 500 });
  }
});
// Session management routes
app.get('/api/sessions', async (c) => {
  try {
    const controller = getAppController(c.env);
    const sessions = await controller.listSessions();
    return c.json({ success: true, data: sessions });
  } catch (error) {
    console.error('Failed to list sessions:', error);
    return c.json({ success: false, error: 'Failed to retrieve sessions' }, { status: 500 });
  }
});
app.post('/api/sessions', async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const { title, sessionId: providedSessionId, firstMessage } = body;
    const sessionId = providedSessionId || crypto.randomUUID();
    let sessionTitle = title;
    if (!sessionTitle) {
      const now = new Date();
      const dateTime = now.toLocaleString([], { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
      if (firstMessage && firstMessage.trim()) {
        const cleanMessage = firstMessage.trim().replace(/\s+/g, ' ');
        const truncated = cleanMessage.length > 40 ? cleanMessage.slice(0, 37) + '...' : cleanMessage;
        sessionTitle = `${truncated} • ${dateTime}`;
      } else {
        sessionTitle = `Chat ${dateTime}`;
      }
    }
    await registerSession(c.env, sessionId, sessionTitle);
    return c.json({ success: true, data: { sessionId, title: sessionTitle } });
  } catch (error) {
    console.error('Failed to create session:', error);
    return c.json({ success: false, error: 'Failed to create session' }, { status: 500 });
  }
});
app.delete('/api/sessions/:sessionId', async (c) => {
  try {
    const sessionId = c.req.param('sessionId');
    const deleted = await unregisterSession(c.env, sessionId);
    if (!deleted) {
      return c.json({ success: false, error: 'Session not found' }, { status: 404 });
    }
    return c.json({ success: true, data: { deleted: true } });
  } catch (error) {
    console.error('Failed to delete session:', error);
    return c.json({ success: false, error: 'Failed to delete session' }, { status: 500 });
  }
});
app.put('/api/sessions/:sessionId/title', async (c) => {
  try {
    const sessionId = c.req.param('sessionId');
    const { title } = await c.req.json();
    if (!title || typeof title !== 'string') {
      return c.json({ success: false, error: 'Title is required' }, { status: 400 });
    }
    const controller = getAppController(c.env);
    const updated = await controller.updateSessionTitle(sessionId, title);
    if (!updated) {
      return c.json({ success: false, error: 'Session not found' }, { status: 404 });
    }
    return c.json({ success: true, data: { title } });
  } catch (error) {
    console.error('Failed to update session title:', error);
    return c.json({ success: false, error: 'Failed to update session title' }, { status: 500 });
  }
});
app.delete('/api/sessions', async (c) => {
  try {
    const controller = getAppController(c.env);
    const deletedCount = await controller.clearAllSessions();
    return c.json({ success: true, data: { deletedCount } });
  } catch (error) {
    console.error('Failed to clear all sessions:', error);
    return c.json({ success: false, error: 'Failed to clear all sessions' }, { status: 500 });
  }
});
// Tool definition route
app.get('/api/tools', async (c) => {
  try {
    const tools = await getToolDefinitions();
    return c.json({ success: true, data: tools });
  } catch (error) {
    console.error('Failed to get tool definitions:', error);
    return c.json({ success: false, error: 'Failed to retrieve tools' }, { status: 500 });
  }
});
// Health check and error reporting
app.get("/api/health", (c) =>
  c.json({
    success: true,
    data: {
      status: "healthy",
      timestamp: new Date().toISOString(),
    },
  })
);
app.post("/api/client-errors", async (c) => {
  try {
    const errorReport = await c.req.json<ClientErrorReport>();
    console.error("[CLIENT ERROR]", { ...errorReport });
    return c.json({ success: true });
  } catch (error) {
    console.error("[CLIENT ERROR HANDLER] Failed:", error);
    return c.json({ success: false, error: "Failed to process error report" }, { status: 500 });
  }
});
app.notFound((c) =>
  c.json({ success: false, error: API_RESPONSES.NOT_FOUND }, { status: 404 })
);
export default {
  fetch: app.fetch,
} satisfies ExportedHandler<Env>;