# Presendoo Embed

Embed **Presendoo views** into any website.\
Available as a **typed npm package** for developers or as a **ready-to-use** `<script>` for non-technical users.

## 🚀 Installation

### Option 1: NPM (for developers)

```
npm install presendoo-embed
```

### Import the package in your app:

```
import "presendoo-embed";

Presendoo.setConfig({ project: "demo" });
document.getElementById("embed")?.addFrame({ type: "view" });
```

### Option 2: Script tag (for non-technical users)

Add this to your `<head>`:

```
<script src="https://cdn.jsdelivr.net/npm/presendoo-embed/dist/presendoo-embed.min.js"></script>
```

Then in your page:

```
<div id="embed" style="height: 600px;"></div>

<script>
    Presendoo.setConfig({ project: "demo" });
    document.getElementById("embed").addFrame({ type: "view" });
</script>
```

## 📖 API

### Global Config

```
Presendoo.setConfig({
    project: "myproject", // required
});
```

### Developer config options

_Don't use the following options in production, only for development purposes when running Presendoo locally_

```
Presendoo.setConfig({
    baseUrl: "localhost:5174",
    ssl: true // optional, defaults to true
});
```

---

### addFrame

Available on any `HTMLElement`.

```
element.addFrame({
    type: "view" | "list" | "all",
    unit_target?: string // optional, default: "self"
});
```

Examples:

```
// embed a view-only frame
document.getElementById("embed").addFrame({ type: "view" });

// embed a unit list
document.getElementById("list").addFrame({ type: "list" });
```

### 🖥️ Supported Frame Types

- view → Interactive project view

- list → Unit list

- all → Combined view + list

### 📨 Messaging (advanced)

The embed script automatically listens for messages between frames and handles:

- `view-updated`

- `language-change`

- `hover-unit`

- `filters-updated`

- `update-view`

- `show-unit` (opens overlay with unit details)

No manual wiring needed unless you want to send custom messages.

---

### 🌐 CDN URLs

- Always latest: https://cdn.jsdelivr.net/npm/presendoo-embed/dist/presendoo-embed.min.js

- Specific version: https://cdn.jsdelivr.net/npm/presendoo-embed@1.0.0/dist/presendoo-embed.min.js

### 📦 Development

- **Build**

```
npm run build
```

- **Lint & format**

```
npm run lint:fix
npm run format
```

- **Publish**

```
npm publish --access public
```

---

License\
MIT © Presendoo
