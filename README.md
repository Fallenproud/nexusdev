# AetherCode
[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/Fallenproud/nexusdev)
AetherCode is a visually stunning, AI-powered 'vibe-coding' platform designed to streamline the entire development lifecycle through an elegant and intuitive chat-based interface. It reimagines the developer experience by focusing on creative flow and intelligent automation.
The application is built around a powerful AI agent that users interact with in natural language to plan, architect, and implement software projects. The core of the application is a multi-panel workspace: a sidebar for managing distinct projects, a central conversational UI for interacting with the AI, and a context-aware panel for viewing tool outputs, file structures, or workflow statuses. Each project is a persistent, stateful conversation, allowing developers to build complex applications iteratively.
## ✨ Key Features
*   **AI-Powered Workflow:** Interact with an intelligent AI agent using natural language to plan, build, and deploy software.
*   **Intuitive Chat Interface:** A beautiful, responsive chat UI serves as the central hub for all development tasks.
*   **Project Management:** Easily create, switch between, and manage multiple development projects, each with its own persistent conversation history.
*   **Stateful Conversations:** Each project maintains its context, allowing for iterative and complex application development over time.
*   **Integrated AI Tools:** The AI can leverage tools like web search and code analysis to provide comprehensive assistance.
*   **Visually Stunning UI:** Meticulously crafted with a focus on aesthetics and user experience, featuring smooth animations and a clean, modern design system.
## 🚀 Technology Stack
*   **Frontend:** React, Vite, TypeScript
*   **Styling:** Tailwind CSS, shadcn/ui
*   **Animation:** Framer Motion
*   **State Management:** Zustand
*   **Backend:** Cloudflare Workers, Hono
*   **Persistence:** Cloudflare Durable Objects via the Agents SDK
*   **AI Integration:** Cloudflare AI Gateway, OpenAI SDK
## 🏁 Getting Started
Follow these instructions to get a local copy up and running for development and testing purposes.
### Prerequisites
*   [Node.js](https://nodejs.org/) (v18 or later)
*   [Bun](https://bun.sh/)
*   A [Cloudflare account](https://dash.cloudflare.com/sign-up)
*   [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) installed and authenticated: `bunx wrangler login`
### Installation
1.  **Clone the repository:**
    ```sh
    git clone https://github.com/your-username/aether_code.git
    cd aether_code
    ```
2.  **Install dependencies:**
    ```sh
    bun install
    ```
### Configuration
The application requires Cloudflare AI Gateway credentials to function.
1.  **Create a `.dev.vars` file** in the root of the project for local development:
    ```
    touch .dev.vars
    ```
2.  **Add your credentials** to the `.dev.vars` file. You can get these from your Cloudflare AI Gateway dashboard.
    ```ini
    CF_AI_BASE_URL="https://gateway.ai.cloudflare.com/v1/YOUR_ACCOUNT_ID/YOUR_GATEWAY_ID/openai"
    CF_AI_API_KEY="YOUR_CLOUDFLARE_API_KEY"
    ```
    > **Note:** For production, you will need to set these as secrets in your Cloudflare Worker dashboard.
## 💻 Development
To run the application locally, use the following command. This will start the Vite development server for the frontend and a local Wrangler process for the backend worker.
```sh
bun dev
```
The application will be available at `http://localhost:3000`. Changes to both the frontend (`src`) and backend (`worker`) code will trigger automatic reloading.
> **AI Usage Limit:** Please be aware that there is a limit on the number of requests that can bemade to the AI servers across all user apps in a given time period.
## 🚀 Deployment
Deploying AetherCode is a straightforward process using the Wrangler CLI.
1.  **Build the application:**
    ```sh
    bun run build
    ```
2.  **Deploy to Cloudflare:**
    ```sh
    bun run deploy
    ```
    This command will build, bundle, and deploy your application and worker to the Cloudflare network.
3.  **Configure Production Secrets:**
    After the first deployment, you must configure your environment variables as secrets for the production environment.
    ```sh
    bunx wrangler secret put CF_AI_BASE_URL
    bunx wrangler secret put CF_AI_API_KEY
    ```
    Follow the prompts to securely add your credentials.
Alternatively, deploy with a single click:
[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/Fallenproud/nexusdev)
## 📂 Project Structure
*   `src/`: Contains all the frontend React application code, including pages, components, hooks, and utility functions.
*   `worker/`: Contains all the backend Cloudflare Worker code, including the Hono API routes, Durable Object classes (`ChatAgent`, `AppController`), and AI integration logic.
*   `wrangler.jsonc`: The configuration file for the Cloudflare Worker, including bindings to Durable Objects.
*   `tailwind.config.js`: Configuration for Tailwind CSS.
*   `vite.config.ts`: Configuration for the Vite development server and build process.
## 📄 License
This project is licensed under the MIT License. See the `LICENSE` file for details.