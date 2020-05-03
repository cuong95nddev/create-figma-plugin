# Figma plugin basics

## How plugins work

### Overview

Context | Figma plugin API  | JavaScript API
:--|:--|:--
Main context | 🟢 Available (via the [`figma`](https://www.figma.com/plugin-docs/api/figma/) global object) | 🟡 Only a subset is available (excludes DOM, `Fetch`)
UI context | 🔴 Not available | 🟢 Available

See that:

1. There is a concept of a “Main context” and a “UI context”.
2. The availability of the Figma plugin API and JavaScript API differs between the two contexts.

### Main context

The entry point of a plugin command is a sandboxed JavaScript environment. We call this the plugin command’s **“Main context”**.

Within this Main context:

1. Our JavaScript code can access and manipulate the contents of the Figma document via the [Figma plugin API](https://www.figma.com/plugin-docs/api/api-overview/). The plugin API is made available on the [`figma`](https://www.figma.com/plugin-docs/api/figma/) global object.
2. Our JavaScript code can only access a subset of the standard browser JavaScript API. Most notably, this subset *excludes* both the [DOM](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model) as well as APIs such as [`Fetch`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API).

### UI context

Showing the UI for our plugin command must be explicitly triggered in the command’s Main context. Figma would then display a modal in the Figma editor interface; this modal contains an `<iframe>` within which which we can render a UI. We call this `<iframe>` the plugin command’s **“UI context”**.

Within this UI context:

1. Our JavaScript code cannot access the Figma plugin API; there is *no* `figma` global variable.
2. Our JavaScript code can access the full browser JavaScript API. This includes both the DOM and `Fetch`.
3. We can have any arbitrary HTML, CSS, and JavaScript in the `<iframe>`.

### Three common use cases

Conceptually, the way that the Main context and the UI context would communicate is through [“message passing”](https://www.figma.com/plugin-docs/how-plugins-run/). (In practice, this involves registering event listeners and emitting events.) This is the only way to leverage parts of the Figma plugin API or JavaScript API that are only available in the opposite context.

The following are three common use cases that we will encounter when developing a Figma plugin:

> **“We want to get data from the Figma document, and show the data in our plugin UI.”**

To accomplish this:

1. In the Main context, call the function to show the UI.
2. Read the required data off the Figma document in the Main context. Pass the data from Main context → UI context.
3. Receive and show the data in the `<iframe>`.

> **“We want to get data from the user, and use the data in our Figma document.”**

To accomplish this:

1. In the Main context, call the function to show the UI.
2. Render a form within the `<iframe>`. When the user clicks a submit button in the form, pass the user input data from UI context → Main context.
3. Receive and use the data in the Main context.

> **“We want to get data from an API endpoint, and use the data in our Figma document.”**

To accomplish this:

1. In the Main context, call the function to show the UI.
2. Pass a request to make an API call from Main context → UI context.
3. Make an API call in the `<iframe>`. When we receive the data from the API, pass the data from UI context → Main context.
4. Receive and use the data in the Main context.

---

## What plugins can and cannot do

Figma plugins can…

- Read and manipulate the contents (ie. pages, layers, components, styles) of the currently-active Figma document
- Store and retrieve data that is specific to the currently-active document
- Store and retrieve data that is specific to the plugin
- Get and set the user’s selection
- Get and set the currently-active page
- Run code in response to changes in the user’s selection or the currently-active page of the document while the plugin is currently running
- Change the viewport and zoom level
- Collapse and uncollapse layers in the the layer list panel
- Display a user interface in a modal in the Figma editor interface
- Do anything that can be done in an `<iframe>` using HTML, CSS and JavaScript eg. making API calls over the network, requesting a file from the user, leveraging web technologies like `<canvas>`, and so on

Figma plugins cannot…

- Access Figma documents that are not currently open
- Read or modify the document name, document ID, and URL of the currently-active Figma document
- Read or modify the document’s users and their access permissions
- Read or modify the document’s comments
- Read or modify components and styles from a team library
- Run code in response to granular user actions in the Figma editor eg. mouse events on the canvas
- Run persistently in the background
- Show more than one modal; at most one plugin modal can be shown at a time
- Run alongside other plugins; at most one plugin can be running at a time
- Trigger other plugins
- Trigger native Figma commands
- Have keyboard shortcuts for its commands
- Run while the user is in Presentation View
- Run if the user only has View permissions for the currently-open document
- Modify the native Figma UI