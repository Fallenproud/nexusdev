import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { toast } from 'sonner';
import { chatService } from '@/lib/chat';
import type { SessionInfo, Message } from '../../worker/types';
interface NexusState {
  sessions: SessionInfo[];
  activeSessionId: string | null;
  messages: Message[];
  streamingMessage: string;
  isLoading: boolean;
  isProcessing: boolean;
  model: string;
}
interface NexusActions {
  fetchSessions: () => Promise<void>;
  createSession: (firstMessage?: string) => Promise<void>;
  switchSession: (sessionId: string) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  fetchMessages: () => Promise<void>;
  sendMessage: (message: string) => Promise<void>;
  setModel: (model: string) => Promise<void>;
}
export const useNexusStore = create<NexusState & NexusActions>()(
  immer((set, get) => ({
    sessions: [],
    activeSessionId: null,
    messages: [],
    streamingMessage: '',
    isLoading: true,
    isProcessing: false,
    model: 'google-ai-studio/gemini-2.5-flash',
    fetchSessions: async () => {
      set({ isLoading: true });
      const res = await chatService.listSessions();
      if (res.success && res.data) {
        set((state) => {
          state.sessions = res.data ?? [];
          if (!state.activeSessionId && state.sessions.length > 0) {
            state.activeSessionId = state.sessions[0].id;
          }
        });
      } else {
        toast.error('Failed to fetch sessions.');
      }
      set({ isLoading: false });
    },
    createSession: async (firstMessage?: string) => {
      const res = await chatService.createSession(undefined, undefined, firstMessage);
      if (res.success && res.data) {
        toast.success('New Nexus created.');
        await get().fetchSessions();
        await get().switchSession(res.data.sessionId);
      } else {
        toast.error('Failed to create new Nexus.');
      }
    },
    switchSession: async (sessionId: string) => {
      if (get().activeSessionId === sessionId) return;
      chatService.switchSession(sessionId);
      set({ activeSessionId: sessionId, messages: [], streamingMessage: '' });
      await get().fetchMessages();
    },
    deleteSession: async (sessionId: string) => {
      const res = await chatService.deleteSession(sessionId);
      if (res.success) {
        toast.success('Nexus deleted.');
        const remainingSessions = get().sessions.filter((s) => s.id !== sessionId);
        set({ sessions: remainingSessions });
        if (get().activeSessionId === sessionId) {
          if (remainingSessions.length > 0) {
            await get().switchSession(remainingSessions[0].id);
          } else {
            await get().createSession();
          }
        }
      } else {
        toast.error('Failed to delete Nexus.');
      }
    },
    fetchMessages: async () => {
      set({ isLoading: true });
      const res = await chatService.getMessages();
      if (res.success && res.data) {
        set((state) => {
          state.messages = res.data?.messages ?? [];
          state.model = res.data?.model ?? 'google-ai-studio/gemini-2.5-flash';
        });
      } else {
        toast.error('Failed to load messages.');
      }
      set({ isLoading: false });
    },
    sendMessage: async (message: string) => {
      if (get().isProcessing) return;
      const isNewSession = get().messages.length === 0;
      if (isNewSession) {
        // This is a new, unsaved session. Create it first.
        const createRes = await chatService.createSession(undefined, chatService.getSessionId(), message);
        if (!createRes.success) {
          toast.error("Failed to start new session.");
          return;
        }
        await get().fetchSessions(); // Refresh session list
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
      await chatService.sendMessage(message, get().model, (chunk) => {
        set((state) => {
          state.streamingMessage += chunk;
        });
      });
      await get().fetchMessages();
      set({ isProcessing: false, streamingMessage: '' });
    },
    setModel: async (model: string) => {
      set({ model });
      const res = await chatService.updateModel(model);
      if (res.success) {
        toast.success(`Model updated to ${model}`);
      } else {
        toast.error('Failed to update model.');
      }
    },
  }))
);