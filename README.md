[![Pieces x Sveltekit](/static/hero.png)](https://docs.pieces.app/build)

# Setup Your Pieces Copilot SDK with SvelteKit

The readme below assumes you're running a bash terminal on MacOS or Linux, but the steps shouldn't differ too much if you're using shell commands on Windows or another operating system.

## Create Svelte App

You can get straight up to speed by spinning up a new Svelte app using the [`create-svelte`](https://github.com/sveltejs/kit/tree/main/packages/create-svelte) CLI tool from your terminal.

Below are example terminal commands to get started:



```bash

# create a new project in the current directory

npm create svelte@latest

  

# create a new project in my-app

npm create svelte@latest my-app

```



## Install Dependencies


Once you've created your new Svelte project, make sure to install the dependencies with `npm install` (or `pnpm install` or `yarn`).

There's also one more dependency we need to install in our Sveltekit project: the Pieces OS client SDK.

```bash

npm install && npm install @pieces.app/pieces-os-client

```

Your Svelte app uses Vite in the compile phase. Anytime you make changes to your Svelte project files, save your changes and Vite will immediately update your development server to reflect those changes in your browser.

That means you can run your development server straight away and just get straight to coding. (Note: Svelte's default configuration will log A LOT of "unused css" callbacks at compile time, as your project gets bigger with more styling, so it can be handy to keep the `--open` parameter in mind)

```bash

npm run dev

  

# or start the server and open the app in a new browser tab

npm run dev -- --open

```


The general pattern of developing in Svelte starts in the `src/routes` directory of your project. Your parent-level Svelte components that you can immediately see in your development server are `Header.svelte` and `page.svelte` in your `routes` directory.

We'll be making the bulk of our changes to the `page.svelte`, building the Pieces Copilot chat in this Svelte component. We may (optionally) need to bring in some UI components for that purpose:

## Install ShadCN (Optional Steps)

You don't have to use ShadCN UI components if you're very familiar with Svelte but, in all other cases, using ShadCN (and Tailwind CSS) could save you time building the front end. If you choose to do so, follow these steps in order:

1. First, add Tailwind CSS to your project
2. Run another `npm install` command to install Tailwind's dependencies.

```bash

npx svelte-add@latest tailwindcss && npm install


```

3. Modify your `svelte.config.js` configuration file in your project's root directory, adding the "alias" script to make your imports go smoother

```
const config = { 
// ... other config 

kit: { // ... other config 

alias: { "@/*": "./path/to/lib/*", 

		}, 
	},
};
```

4.  Install "ShadCN for Svelte" with the shadcn-svelte CLI installer (this is a port thanks to hunterbyte and the [repo is here](https://github.com/huntabyte/shadcn-svelte); the official ShadCN tools do not entirely support Svelte as of yet so we're using hunterbyte's ported version)

```bash

npx shadcn-svelte@latest init

```

5. The shadcn-svelte installer will ask you configuration questions, in your terminal while installing. Here are the recommended settings below:

```
Would you like to use TypeScript (recommended)? › Yes
Which style would you like to use? › Default
Which color would you like to use as base color? › Slate
Where is your global CSS file? › src/app.pcss
Where is your tailwind.config.[cjs|js|ts] located? › tailwind.config.js
Configure the import alias for components: › $lib/components
Configure the import alias for utils: › $lib/utils
```

You're now free to install and import any ShadCN UI components you'd like, first installing them with the CLI tool from your terminal so that they appear in your project's `src/lib/components/ui` directory.

## Install Textarea and Button Component (Optional)

Follow this step if you've chosen to install ShadCN. We'll install the Textarea and Button UI components, so we can use them later in our Svelte `page` component for our copilot chat interface.

```bash

npx shadcn-svelte@latest add button

```

## Import CopilotStreamController to page.svelte

(thanks to Jordan for providing the original Typescript version of CopilotStreamController!)

We also need a singleton class to talk to the Pieces OS client and parse the messages for handling into our copilot chat.

Create a new Typescript file for your singleton class in the `routes` directory named `CopilotStreamController.ts` (or name your class how you choose, but make sure the file extension is a `.ts` Typescript file.

You can copy/paste a working version of the CopilotStreamController adapted for Svelte [here](https://github.com/seantiz/piecesvelte/blob/main/src/routes/CopilotStreamController.ts) and save your CopilotStreamController file.

Then import your CopilotStreamController class as a module in your `page.svelte` component. Your new CopilotStreamController is saved in the same `routes` directory as your `page.svelte` component, so the import statement below should work.

```Javascript

+page.svelte

import CopilotStreamController from './CopilotStreamController'

```

## Link CopilotStreamController to Svelte page's chat history and build conversation UI

We'll make sure we're using the shared instance of CopilotStreamController thanks the `getInstance` method that we already defined in the CopilotStreamController class. We can use that method to mount CopilotStreamController into the `page.svelte` component, assigning it as a value to a `controller` instance that we define within the `<script></script>` tags of `page.svelte`.

We'll also use Sveltekit's `onMount` call to initiate our shared CopilotStreamController instance within the mounted lifecycle of our app:


```Typescript

<script>

import { onMount } from 'svelte';

let controller;

onMount(() => {

	controller = CopilotStreamController.getInstance();

});

</script>



```

We want to break our stream into different UI blocks, so that we can read back on our chat history as a conversation between us as the user and Pieces OS client as the copilot.

(Note: the ideas behind the chat_history UI elements and typing indicator component are entirely credit to [semicognitive's sveltekit-chat repo](https://github.com/semicognitive/sveltekit-chat)).

To do that, we declare:

1. A `chat_history` array that also holds reactive binding roles "user" and "assistant" (this is the beauty of using Svelte; we can mix patterns and assign responsibilities from those design patterns all within one object)
2. A `sendChat` method for our `page.svelte` component that updates the `chat_history` array conditionally. If it's the last message parsed CopilotStreamController received from Pieces OS client, `sendChat` will append that to the "assistant" role in `chat_history`, otherwise `sendChat` will move back in the index of CopilotStreamController's content and append the string content at that index into the "user" role of `chat_history`
3. We'll also use `isSending` boolean to bring in a "typing" UI effect on the front end, for whenever our chat stream is awaiting the copilot's response to our sent messages.
4. We'll use a `scrollToBottom` function to update our page view and chat component, whenever the our chat overflows past the original height of the conversation box. `scrollToBottom` uses Sveltekit's built-in `requestAnimationFrame` method to keep track of the last rendered frame in our copilot conversation.

```Typescript

let chat_history: { role: "user" | "assistant"; content: string }[] = [];
let isSending = false;
let userInput = '';



async function sendChat() {

	isSending = true;

	await controller.sendMessage(userInput, (newMessage) => {


		if (chat_history.length > 0 && chat_history[chat_history.length - 1].role === 'assistant') {

			chat_history = [...chat_history.slice(0, -1), { role: 'assistant', content: newMessage }];

		} else {

			chat_history = [...chat_history, { role: 'assistant', content: newMessage }];

		}

		isSending = false;

		scrollToBottom();

	});

	chat_history = [...chat_history, { role: 'user', content: userInput }];

	userInput = '';

	scrollToBottom();

}

function scrollToBottom() {

	requestAnimationFrame(() => {

		const chatSection = document.querySelector('.chat-section');

		if (chatSection) {

			chatSection.scrollTop = chatSection.scrollHeight;

		}

	});

}


```

## Clear the Textarea when we click Send or hit Enter

We haven't declared or used our Textarea component yet, but we can save the user a ton of time by clearing the user input from Textarea whenever the Send button is clicked or the Enter key is pressed and a message is sent to the copilot.

We handle these two events with our `handleSubmit` and `handleKeyDown` methods for `page.svelte`:

```Typescript

async function handleKeyDown(e: KeyboardEvent) {

	if (e.key === 'Enter' && !e.shiftKey) {

		e.preventDefault();

		await sendChat();

	}

}



async function handleSubmit(this: HTMLFormElement) {

	if ($response.loading) return;

	const formData: FormData = new FormData(this);

	const message = formData.get("message") as string;

	if (message == "") return;

	userInput = message;

	sendChat();

	this.reset();

}


```


And that's it for the `<script></script>` section of our `page.svelte` component, when it comes to the bulk of it's event-driven logic and receiving data from CopilotStreamController. The rest of the work lies in building the front-end UI in the `<body></body>` and `<style></style>` sections of `page.svelte`.

You can find a full working example conversation UI for `page.svelte` at the [Pieces x Svelte repo here](https://github.com/seantiz/piecesvelte/blob/main/src/routes/%2Bpage.svelte). Copy and paste the body and style sections from that repo into your project's page component, if you're building from scratch and don't already have that version of `page.svelte` in your project.

## Preview, Build and Deploy


To create a production version of your app:

You can preview the production build with `npm run preview`

```bash

npm run preview

  
```

When you're ready to deploy your app to the web, use the `run build` command

```bash

npm run build

```

Svelte and Vite may need you to install an adapter for your production server's environment. See the [official Svelte documention here](https://kit.svelte.dev/docs/adapters) for a guide on installing adapters to your project.
