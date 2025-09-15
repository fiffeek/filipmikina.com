---
external: false
draft: false
title: "Dispatching actions on Hyprland's events"
description: Floating windows that refuse to be floated.
date: 2025-09-15
---

Ever had a window that should float but doesn't? Think of those `OAuth popups`
that start as `Mozilla Firefox` then change into `Sign in – Google Accounts`.

Hyprland's
[static window rules](https://wiki.hypr.land/Configuring/Window-Rules/#static-rules)
(like `float`) only trigger **when a window is created** — not when its title
changes later. What if we could catch those title changes and react instantly?

Enter [**hyprwhenthen**](https://github.com/fiffeek/hyprwhenthen): a tiny Go
tool that listens to Hyprland events and runs your scripts when regex patterns
match.

{% youtube url="https://www.youtube-nocookie.com/embed/fPz3sjG_90o" label="hyprwhenthen demo" height="500" /%}

---

## Quick install

```bash
$aurHelper -S hyprwhenthen-bin
```

or grab a prebuilt binary from the
[releases page](https://github.com/fiffeek/hyprwhenthen/releases).

---

## Example solution

Here’s a `~/.config/hyprwhenthen/config.toml` that reacts whenever a window’s
title matches `Sign in – Google Accounts`:

```toml
[[handler]]
on = "windowtitlev2"
# (.*) captures the window's address (first field), then we match the title
when = "(.*),Sign In - Google Accounts — Mozilla Firefox"
then = "~/.config/hyprwhenthen/scripts/float.sh $REGEX_GROUP_1"
```

And here’s a minimal `float.sh`:

```bash
#!/bin/bash
ADDRESS="0x$1"

# Toggle floating, resize to 50% x 50% of screen, and center it
hyprctl dispatch togglefloating "address:$ADDRESS" ||
  exit 0  # exit silently if window no longer exists

hyprctl dispatch resizewindowpixel exact 50% 50%,"address:$ADDRESS"
hyprctl dispatch centerwindow "address:$ADDRESS"
```

Now every OAuth popup **automatically becomes a centered floating window** — no
more manual dragging and resizing.

{% youtube url="https://www.youtube-nocookie.com/embed/-BDxsz0ltIk" label="hyprwhenthen demo" height="500" /%}

---

## Why not existing tools?

- **[shellevents](https://github.com/hyprwm/contrib/tree/main/shellevents) /
  [hyprevents](https://github.com/vilari-mickopf/hyprevents)** → simple bash
  wrappers, but limited pattern matching
- **[pyprland](https://github.com/hyprland-community/pyprland)** → powerful, but
  overkill for quick one-off event reactions
- raw `socat` → works, but gets messy with complex logic (e.g. background
  processing, event ordering)

[**hyprwhenthen**](https://github.com/fiffeek/hyprwhenthen) hits the sweet spot:

- ✅ Regex-based matching: match event context and capture matching groups
- ✅ Parallel execution: run handlers in the background
- ✅ Hot reloading: configuration change triggers automatic service reload
- ✅ Event ordering: events for the same window can be processed serially

Perfect for those _"I wish Hyprland could just..."_ moments.

---

> This is just one example. `hyprwhenthen` can react to _any_ Hyprland event —
> window creation, focus changes, workspaces, etc. It’s up to you to define the
> scenarios that fit your workflow, from automatically floating popups to moving
> specific apps to dedicated workspaces.
