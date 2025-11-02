import { Agent } from 'agents';
import type { Env } from './core-utils';
import type { CanvasContent, ChatState } from './types';
import { ChatHandler } from './chat';
import { API_RESPONSES } from './config';
import { createMessage, createStreamResponse, createEncoder } from './utils';
export class ChatAgent extends Agent<Env, ChatState> {
  private chatHandler?: ChatHandler;
  initialState: ChatState = {
    messages: [],
    sessionId: crypto.randomUUID(),
    isProcessing: false,
    model: 'google-ai-studio/gemini-2.5-flash',
    canvasContent: null,
    files: {},
  };
  async onStart(): Promise<void> {
    this.chatHandler = new ChatHandler(
      this.env.CF_AI_BASE_URL,
      this.env.CF_AI_API_KEY,
      this.state.model,
      this
    );
    console.log(`ChatAgent ${this.name} initialized with session ${this.state.sessionId}`);
  }
  async onRequest(request: Request): Promise<Response> {
    try {
      const url = new URL(request.url);
      const method = request.method;
      if (method === 'GET' && url.pathname === '/messages') {
        return this.handleGetMessages();
      }
      if (method === 'POST' && url.pathname === '/chat') {
        return this.handleChatMessage(await request.json());
      }
      if (method === 'DELETE' && url.pathname === '/clear') {
        return this.handleClearMessages();
      }
      if (method === 'POST' && url.pathname === '/model') {
        return this.handleModelUpdate(await request.json());
      }
      if (method === 'POST' && url.pathname === '/canvas') {
        return this.handleCanvasUpdate(await request.json());
      }
      if (method === 'GET' && url.pathname === '/files') {
        return this.handleGetFiles();
      }
      return Response.json({
        success: false,
        error: API_RESPONSES.NOT_FOUND
      }, { status: 404 });
    } catch (error) {
      console.error('Request handling error:', error);
      return Response.json({
        success: false,
        error: API_RESPONSES.INTERNAL_ERROR
      }, { status: 500 });
    }
  }
  private handleGetMessages(): Response {
    return Response.json({
      success: true,
      data: this.state
    });
  }
  private handleGetFiles(): Response {
    return Response.json({
      success: true,
      data: this.state.files || {}
    });
  }
  private async handleChatMessage(body: { message: string; model?: string; stream?: boolean }): Promise<Response> {
    const { message, model, stream } = body;
    if (!message?.trim()) {
      return Response.json({
        success: false,
        error: API_RESPONSES.MISSING_MESSAGE
      }, { status: 400 });
    }
    if (model && model !== this.state.model) {
      this.setState({ ...this.state, model });
      this.chatHandler?.updateModel(model);
    }
    const userMessage = createMessage('user', message.trim());
    this.setState({
      ...this.state,
      messages: [...this.state.messages, userMessage],
      isProcessing: true
    });
    try {
      if (!this.chatHandler) {
        throw new Error('Chat handler not initialized');
      }
      if (stream) {
        const { readable, writable } = new TransformStream();
        const writer = writable.getWriter();
        const encoder = createEncoder();
        (async () => {
          try {
            this.setState({ ...this.state, streamingMessage: '' });
            const response = await this.chatHandler!.processMessage(
              message,
              this.state.messages,
              (chunk: string) => {
                try {
                  this.setState({
                    ...this.state,
                    streamingMessage: (this.state.streamingMessage || '') + chunk
                  });
                  writer.write(encoder.encode(chunk));
                } catch (writeError) {
                  console.error('Write error:', writeError);
                }
              }
            );
            const assistantMessage = createMessage('assistant', response.content, response.toolCalls);
            const canvasToolCall = response.toolCalls
              ?.slice()
              .reverse()
              .find(tc =>
                (tc.name === 'display_on_canvas' || tc.name === 'generate_diagram') &&
                tc.result && typeof tc.result === 'object' && 'contentType' in tc.result && 'content' in tc.result
              );
            const newCanvasContent = canvasToolCall ? (canvasToolCall.result as CanvasContent) : this.state.canvasContent;
            this.setState({
              ...this.state,
              messages: [...this.state.messages, assistantMessage],
              isProcessing: false,
              streamingMessage: '',
              canvasContent: newCanvasContent,
            });
          } catch (error) {
            console.error('Streaming error:', error);
            try {
              const errorMessage = 'Sorry, I encountered an error processing your request.';
              writer.write(encoder.encode(errorMessage));
              const errorMsg = createMessage('assistant', errorMessage);
              this.setState({
                ...this.state,
                messages: [...this.state.messages, errorMsg],
                isProcessing: false,
                streamingMessage: ''
              });
            } catch (writeError) {
              console.error('Error writing error message:', writeError);
            }
          } finally {
            try {
              writer.close();
            } catch (closeError) {
              console.error('Error closing writer:', closeError);
            }
          }
        })();
        return createStreamResponse(readable);
      }
      const response = await this.chatHandler.processMessage(
        message,
        this.state.messages
      );
      const assistantMessage = createMessage('assistant', response.content, response.toolCalls);
      const canvasToolCall = response.toolCalls
        ?.slice()
        .reverse()
        .find(tc =>
          (tc.name === 'display_on_canvas' || tc.name === 'generate_diagram') &&
          tc.result && typeof tc.result === 'object' && 'contentType' in tc.result && 'content' in tc.result
        );
      const newCanvasContent = canvasToolCall ? (canvasToolCall.result as CanvasContent) : this.state.canvasContent;
      this.setState({
        ...this.state,
        messages: [...this.state.messages, assistantMessage],
        isProcessing: false,
        canvasContent: newCanvasContent,
      });
      return Response.json({
        success: true,
        data: this.state
      });
    } catch (error) {
      console.error('Chat processing error:', error);
      this.setState({ ...this.state, isProcessing: false });
      return Response.json({
        success: false,
        error: API_RESPONSES.PROCESSING_ERROR
      }, { status: 500 });
    }
  }
  private handleClearMessages(): Response {
    this.setState({
      ...this.state,
      messages: [],
      canvasContent: null,
      files: {},
    });
    return Response.json({
      success: true,
      data: this.state
    });
  }
  private handleModelUpdate(body: { model: string }): Response {
    const { model } = body;
    this.setState({ ...this.state, model });
    this.chatHandler?.updateModel(model);
    return Response.json({
      success: true,
      data: this.state
    });
  }
  private handleCanvasUpdate(body: { content: CanvasContent | null }): Response {
    this.setState({ ...this.state, canvasContent: body.content });
    return Response.json({ success: true, data: this.state });
  }
}