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

I'm not crazy about talking patterns, but just a heads up that you're going to be using the **Functional Reactive Pattern (FRP)** to extend any features of your own from the tools given by the Pieces interfaces.

Just to briefly recap the benefits of getting used to building this way:

**1. Streaming:** We typically want our AI chats to stream like someone human is responding to us from across the void; thankfully streaming props are baked into the Pieces endpoints.

**2. The Iterable Property**: This is how you dunk your hand into the stream and shape it into the chat shapes you need to return to your client. Get used to seeing and accessing the `iterable` property a lot - it's brimming with data and it saves on lines of code.

## Optional: Opportunities for Pieces OSS Contribution

There are A LOT of Pieces endpoints, properties and methods to choose from and it can easily be overwhelming.

Turn that overwhelm into early contribution opportunities, where you can really make an impact on the Pieces for Developers OSS community:

1. Creating issues to help the [Pieces API documentation](https://github.com/pieces-app/documentation) get as intuitive as possible.
2. Testing API endpoints and properties to suggest where the API schema can be optimised.

If you get lost or need help please feel free to get in touch and/or clone this project or look at the [Pieces CLI repo linked here](https://github.com/pieces-app/cli-agent) for working examples.

# Preview, Build and Deploy

To create a production version of your Svelte app, you can preview the production build

```bash

(p)npm run preview


```

If and when you're ready to deploy your app to the web:

```bash

(p)npm run build

```
