[![Pieces x Sveltekit](/static/hero.png)](https://docs.pieces.app/build)

Don't want to clone the repo? Here's a guide for setting up from scratch.

## Create Sveltekit App

Use the Svelte CLI to create a Sveltekit app from scratch


```bash
# create a new project in yourappname directory
npx sv create youappname
cd yourappname
```
## Create Svelte App (No Kit)

You can always setup a pure Svelte 5 app if you don't want the bulk of Sveltekit routing thrown in. Use Vite's CLI installer and select "Svelte" from the options list.

```bash
(p)npm vite create@latest
```

# Install Dependencies

Your project will definitely need:

1. The Pieces OS Typescript SDK library
2. Websocket types

These are pretty non-negotiable for carrying queries and other messages to your locally-installed Pieces OS server; the server will act as the proxy between your Svelte app and the LLMs your app sends messages to in each session.

Half the battle is setting up your Websocket so that it behaves in a well-defined way, so definitely import the types needed.

```bash

(p)npm install -D @pieces.app/pieces-os-client && @types/ws

```

Then run `(p)npm install` a second time to make sure all your transitive dependencies (from setting up the app) are correctly installed. After that, you can run your development server straight away and just get straight to coding.

```bash

(p)npm run dev

```

# But What About UI? Install ShadCN (Optional Steps)

Upon running your app's dev environment, you'll be faced with a very bare default `+page.svelte` route. When I first built Svelte x Pieces, I decided to go with installing ShadCNSvelte components for some quick UI.

ShadCNSvelte is well maintained and was one of the first component libraries to be updated to work with Svelte 5. You can [find the ShadCN installation documentation at this link](https://www.shadcn-svelte.com/docs/installation) if you choose to go ahead with this step.

## Install Textarea and Button Component (Optional)

Follow this step if you've chosen to install ShadCN. We'll install the Textarea and Button UI components, so we can use them later in our Svelte `page` component for our copilot chat interface.

```bash

npx shadcn-svelte@latest add button

```

# Setting your Pieces API layers (QGPT, Models, etc.)

You can always clone the repo and use it as a reference for implementing these steps (or check out the Pieces CLI written in Python) because there are A LOT of Pieces API properties and methods to choose from and it can easily be overwhelming.

## Optional: Opportunities for Pieces OSS Contribution

Don't take my word for it - [visit the Pieces OpenAPI schema spec here](https://github.com/pieces-app/pieces-os-client-openapi-spec/tree/main/spec) and (just for fun!) use a CLI tool like [OpenAPI Typescript generator linked here](https://github.com/openapi-ts/openapi-typescript) to generate your TS types from that spec.

You'll see that you'll end up with a surreal amount of auto-generated types just to interact with the Pieces APIs, and realistically you may end up using less than 10% of what's available.

I mention all of this just to point out two early contribution opportunities where you can really make an impact on the Pieces for Developers OSS community:

1. Creating issues to help the [Pieces API documentation](https://github.com/pieces-app/documentation) get as intuitive as possible.
2. Testing API endpoints and properties to suggest where the API schema can be optimised.

## In the Meantime (API Quickstart)

Don't keep all the auto-generated types from the previous step (if you went through with it) in your own app. Just start with the well-travelled API routes for now:

1. `QGPTApi` interface - for modelling your chat client class' properties and methods as a singleton instance
2. `QGPTStreamInput` type - very useful type for structuring queries sent to your local Pieces server through the websocket.
3. `ModelsApi` and `ModelApi` - you can implement both of these interfaces through a `modelsController` class (clone/fork this repo for a working example) that'll turn your chat app into a true multi-modal LLM where you can switch from speaking to Gemini, Claude or ChatGPT through the cloud; o even switch to Ollama models or other locally-downloaded LLMs on your machine.

Again, if you get lost or need help please feel free to get in touch and/or clone this project or look at the [Pieces CLI repo linked here](https://github.com/pieces-app/cli-agent) for working examples.

# Preview, Build and Deploy

To create a production version of your Svelte app, you can preview the production build

```bash

(p)npm run preview


```

If and when you're ready to deploy your app to the web:

```bash

(p)npm run build

```

## Which Svelte(kit) Adapter Should I Use?

Svelte and Vite may need you to install a specific adapter for your production server's environment if you choose to deploy to an edge environment e.g. Vercel.

But if you're NOT deploying anywhere on the edge, or just want to keep your app local to your machine, then `adapter-auto` or `adapter-static` should do for the majority of cases. You're likely building a chat app with long user sessions and highly-dynamic primary data, so we're essentially talking about an single-page application.

See the [official Svelte documentation here](https://kit.svelte.dev/docs/adapters) for a guide on installing adapters to your project.
