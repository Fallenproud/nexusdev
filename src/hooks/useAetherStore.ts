import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { toast } from 'sonner';
import { chatService } from '@/lib/chat';
import type { Message, SessionInfo, ToolDefinition, CanvasContent } from '../../worker/types';
interface AetherState {
  sessions: SessionInfo[];
  activeSessionId: string | null;
  messages: Message[];
  streamingMessage: string;
  isProcessing: boolean;
  model: string;
  availableTools: ToolDefinition[];
  isFetchingTools: boolean;
  isFetchingSessions: boolean;
  canvasContent: CanvasContent | null;
  files: Record<string, string>;
  actions: {
    fetchSessions: () => Promise<void>;
    switchSession: (sessionId: string) => Promise<void>;
    createSession: (title?: string, firstMessage?: string) => Promise<void>;
    deleteSession: (sessionId: string) => Promise<void>;
    updateSessionTitle: (sessionId: string, title: string) => Promise<void>;
    sendMessage: (message: string) => Promise<boolean>;
    setModel: (model: string) => Promise<void>;
    fetchAvailableTools: () => Promise<void>;
    setCanvasContent: (content: CanvasContent | null) => Promise<void>;
    fetchFiles: () => Promise<void>;
  };
}
const useAetherStoreImpl = create<AetherState>()(
  immer((set, get) => ({
    sessions: [],
    activeSessionId: null,
    messages: [],
    streamingMessage: '',
    isProcessing: false,
    model: 'google-ai-studio/gemini-2.5-flash',
    availableTools: [],
    isFetchingTools: false,
    isFetchingSessions: false,
    canvasContent: null,
    files: {},
    actions: {
      fetchSessions: async () => {
        set({ isFetchingSessions: true });
        const response = await chatService.listSessions();
        if (response.success && response.data) {
          set((state) => {
            state.sessions = response.data!;
          });
        } else {
          toast.error('Failed to fetch sessions.', { description: response.error });
        }
        set({ isFetchingSessions: false });
      },
      switchSession: async (sessionId) => {
        if (get().activeSessionId === sessionId) return;
        set((state) => {
          state.activeSessionId = sessionId;
          state.messages = [];
          state.streamingMessage = '';
          state.isProcessing = true;
          state.isFetchingSessions = true;
          state.canvasContent = null;
          state.files = {};
        });
        chatService.switchSession(sessionId);
        const response = await chatService.getMessages();
        if (response.success && response.data) {
          set((state) => {
            state.messages = response.data!.messages;
            state.model = response.data!.model;
            state.canvasContent = response.data!.canvasContent || null;
            state.files = response.data!.files || {};
          });
        } else {
          toast.error('Failed to load session messages.', { description: response.error });
        }
        set((state) => {
          state.isProcessing = false;
          state.isFetchingSessions = false;
        });
      },
      createSession: async (title, firstMessage) => {
        const newSessionId = crypto.randomUUID();
        const response = await chatService.createSession(title, newSessionId, firstMessage);
        if (response.success && response.data) {
          await get().actions.fetchSessions();
          await get().actions.switchSession(response.data.sessionId);
        } else {
          toast.error('Failed to create a new session.', { description: response.error });
        }
      },
      deleteSession: async (sessionId) => {
        const response = await chatService.deleteSession(sessionId);
        if (response.success) {
          toast.success('Session deleted.');
          set((state) => {
            state.sessions = state.sessions.filter((s) => s.id !== sessionId);
            if (state.activeSessionId === sessionId) {
              state.activeSessionId = null;
              state.messages = [];
              if (state.sessions.length > 0) {
                get().actions.switchSession(state.sessions[0].id);
              }
            }
          });
        } else {
          toast.error('Failed to delete session.', { description: response.error });
        }
      },
      updateSessionTitle: async (sessionId, title) => {
        const response = await chatService.updateSessionTitle(sessionId, title);
        if (response.success) {
          toast.success('Session title updated.');
          set((state) => {
            const session = state.sessions.find((s) => s.id === sessionId);
            if (session) {
              session.title = title;
            }
          });
        } else {
          toast.error('Failed to update session title.', { description: response.error });
        }
      },
      sendMessage: async (message) => {
        try {
          if (!get().activeSessionId) {
            await get().actions.createSession(undefined, message);
          }
          set((state) => {
            state.isProcessing = true;
            state.streamingMessage = '';
            state.messages.push({
              id: crypto.randomUUID(),
              role: 'user',
              content: message,
              timestamp: Date.now(),
            });
          });
          const sendResponse = await chatService.sendMessage(message, get().model, (chunk) => {
            set((state) => {
              state.streamingMessage += chunk;
            });
          });
          if (!sendResponse.success) {
            throw new Error(sendResponse.error || 'Failed to send message');
          }
          const response = await chatService.getMessages();
          if (response.success && response.data) {
            set((state) => {
              state.messages = response.data!.messages;
              state.canvasContent = response.data!.canvasContent || null;
              state.files = response.data!.files || {};
            });
          } else {
            throw new Error(response.error || 'Failed to fetch updated messages');
          }
          set((state) => {
            state.isProcessing = false;
            state.streamingMessage = '';
          });
          return true;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
          toast.error('Message failed to send', {
            description: 'Please check your connection and try again.',
          });
          console.error('sendMessage failed:', errorMessage);
          set((state) => {
            state.isProcessing = false;
            state.streamingMessage = '';
          });
          return false;
        }
      },
      setModel: async (model) => {
        set((state) => {
          state.model = model;
        });
        const response = await chatService.updateModel(model);
        if (response.success) {
          toast.success(`Model switched to ${model}`);
        } else {
          toast.error('Failed to switch model.', { description: response.error });
        }
      },
      fetchAvailableTools: async () => {
        set({ isFetchingTools: true });
        const response = await chatService.getAvailableTools();
        if (response.success && response.data) {
          set({ availableTools: response.data });
        } else {
          toast.error('Failed to fetch available tools.', { description: response.error });
        }
        set({ isFetchingTools: false });
      },
      setCanvasContent: async (content) => {
        set({ canvasContent: content });
        const response = await chatService.updateCanvasContent(content);
        if (!response.success) {
          toast.error('Failed to save canvas content', { description: response.error });
        }
      },
      fetchFiles: async () => {
        const response = await chatService.getFiles();
        if (response.success && response.data) {
          set({ files: response.data });
        } else {
          toast.error('Failed to fetch files.', { description: response.error });
        }
      },
    },
  }))
);
export const useAetherStore = <T>(selector: (state: AetherState) => T) => useAetherStoreImpl(selector);