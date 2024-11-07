# Changelog:

## Svelte x Pieces v0.1.1 (2024-11-7)

We migrated the client UI to Svelte 5 with v0.1.1!

* The main page is slimmed down with unused variables cleaned up.
* We moved `components` up one directory and changed the path alias
* We added renamed the `apis` folder to `getFromPieces` to make it clearer which tasks exist to post to the Pieces Open API endpoints and just for better readability.
* Safe loading of the Copilot controller into the client DOM with a browser window check.
* We removed unused dependencies after the move to Svelte 5

## Svelte x Pieces v0.1.0 (2024-11-7)

Svelte x Pieces now keeps a changelog and versioning to gradually make it easy to contribute. Over the last year, we've made the following changes:

* Added a Pieces Assets instance to GET from the endpoint (22de729)
* Tweaked the main page UI (3dd6066)

## v0.0.1

* Handling keyboard input (39e156f)
* Better handling of Copilot's streaming messages (8d3eb2c), (6b1568a)
* UI changes (1fa1d5e)
* Fixed problems with IPC threading and a recurring websocket error (f26c2a4)
* Added multi-modal LLM selection in the main page callout (357e415)
* Added the MIT license (fea7e93)
* Readme was updated by mason-at-pieces/main and others (e4e5636), (638beee)
* Removed CopilotStreamController.main() (c33cb08)
* Early setup of radio buttons in the main callout and multimodal LLM selection (1d1e746)