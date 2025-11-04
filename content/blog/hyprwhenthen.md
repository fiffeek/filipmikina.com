---
showToc: true
external: false
draft: false
heroImage: "/images/hyprwhenthen.png"
title:
  "Hyprland Events Automation: Auto-Float Windows with togglefloating and
  centerwindow"
description:
  Complete guide to Hyprland events and event-driven automation using
  HyprWhenThen. Learn how to use hyprctl dispatch togglefloating and
  centerwindow dispatcher to automatically float and center windows when titles
  change. Includes examples for OAuth popups, window rules, and dynamic
  workspace automation based on Hyprland events.
date: 2025-09-15
tags:
  [
    "Hyprland",
    "Hyprland Events",
    "Window Management",
    "Wayland",
    "Linux",
    "Go",
    "Automation",
  ]
keywords:
  [
    "hyprland events",
    "hyprctl dispatch togglefloating",
    "hyprland centerwindow dispatcher",
    "hyprland center floating window",
    "hyprland togglefloating",
    "hyprland toggle floating",
    "hyprctl dispatch exit hyprland",
    "hyprland center window",
    "hyprland window events",
    "hyprland event listener",
    "hyprland automation",
    "hyprland dynamic window rules",
    "hyprland float window on title change",
    "hyprland windowtitle event",
    "hyprland dispatch",
    "hyprctl commands",
    "hyprland event-driven",
    "hyprland window title change",
    "hyprland auto float",
    "hyprland center popup",
  ]
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

## Quick Reference: Common Hyprland Event Commands

### Toggle floating window

```bash
hyprctl dispatch togglefloating address:0x12345678
```

### Center a floating window

```bash
hyprctl dispatch centerwindow address:0x12345678
```

### Center and resize a floating window

```bash
# Toggle floating
hyprctl dispatch togglefloating address:0x12345678
# Resize to 50% screen size
hyprctl dispatch resizewindowpixel exact 50% 50%,address:0x12345678
# Center it
hyprctl dispatch centerwindow address:0x12345678
```

**Want these to happen automatically based on Hyprland events?** Read on to see
how hyprwhenthen makes window title changes, focus events, and workspace
switches trigger these commands automatically.

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

```ini {% title="~/.config/hyprwhenthen/config.toml" %}
[[handler]]
on = "windowtitlev2"
# (.*) captures the window's address (first field), then we match the title
when = "(.*),Sign In - Google Accounts — Mozilla Firefox"
then = "~/.config/hyprwhenthen/scripts/float.sh $REGEX_GROUP_1"
```

And here’s a minimal `float.sh`:

```bash {% title="~/.config/hyprwhenthen/scripts/float.sh" %}
#!/bin/bash
ADDRESS="0x$1"

# Toggle floating, resize to 50% x 50% of screen, and center it
hyprctl dispatch togglefloating "address:$ADDRESS" || \
  exit 0  # exit silently if window no longer exists

hyprctl dispatch resizewindowpixel exact 50% 50%,"address:$ADDRESS"
hyprctl dispatch centerwindow "address:$ADDRESS"
```

Now every OAuth popup **automatically becomes a centered floating window** — no
more manual dragging and resizing.

{% youtube url="https://www.youtube-nocookie.com/embed/-BDxsz0ltIk" label="hyprwhenthen demo" height="500" /%}

---

## Why not existing tools?

- [shellevents](https://github.com/hyprwm/contrib/tree/main/shellevents) /
  [hyprevents](https://github.com/vilari-mickopf/hyprevents) → simple bash
  wrappers, but limited pattern matching
- [pyprland](https://github.com/hyprland-community/pyprland) → powerful, but
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
> window creation, focus changes, workspaces, etc. It's up to you to define the
> scenarios that fit your workflow, from automatically floating popups to moving
> specific apps to dedicated workspaces.

---

## FAQ: Hyprland Events and Window Management

### What are Hyprland events?

Hyprland events are real-time notifications emitted by the compositor whenever
something happens - like a window opening, title changing, workspace switching,
or monitor connecting. You can listen to these events using
`socat UNIX-CONNECT:/tmp/hypr/$HYPRLAND_INSTANCE_SIGNATURE/.socket2.sock -` or
use tools like hyprwhenthen to react to them automatically.

Common Hyprland events include:

- `windowtitlev2` - Window title changes
- `openwindow` - New window created
- `closewindow` - Window closed
- `activewindow` - Window focused
- `workspace` - Workspace switched
- `monitoradded` / `monitorremoved` - Monitor changes

### How do I use hyprctl dispatch togglefloating?

The `togglefloating` dispatcher switches a window between floating and tiled
mode:

```bash
# Toggle current window
hyprctl dispatch togglefloating

# Toggle specific window by address
hyprctl dispatch togglefloating address:0x12345678

# Toggle by window class
hyprctl dispatch togglefloating class:firefox
```

You can bind this to a key in your Hyprland config:

```bash
bind = SUPER, V, togglefloating,
```

Or use hyprwhenthen to automatically float windows based on title changes.

### How do I center a floating window in Hyprland?

Use the `centerwindow` dispatcher:

```bash
# Center current window
hyprctl dispatch centerwindow

# Center specific window
hyprctl dispatch centerwindow address:0x12345678
```

For automatic centering when windows float, combine with hyprwhenthen:

```ini
[[handler]]
on = "windowtitlev2"
when = "(.*),Sign In - Google Accounts"
then = "~/.config/hyprwhenthen/scripts/float-and-center.sh $REGEX_GROUP_1"
```

### How can I automatically float and center OAuth popups?

Use hyprwhenthen to detect title changes and run commands. Here's a complete
example:

**Config** (`~/.config/hyprwhenthen/config.toml`):

```ini
[[handler]]
on = "windowtitlev2"
when = "(.*),Sign In - Google Accounts"
then = "~/.config/hyprwhenthen/scripts/float-center.sh $REGEX_GROUP_1"
```

**Script** (`~/.config/hyprwhenthen/scripts/float-center.sh`):

```bash
#!/bin/bash
ADDRESS="0x$1"
hyprctl dispatch togglefloating "address:$ADDRESS"
hyprctl dispatch resizewindowpixel exact 50% 50%,"address:$ADDRESS"
hyprctl dispatch centerwindow "address:$ADDRESS"
```

This automatically floats, resizes, and centers any window matching the title
pattern.

### What's the difference between static window rules and event-based automation?

**Static window rules** in Hyprland apply only when a window is created:

```bash
windowrule = float, ^(pavucontrol)$
```

This works if the window class/title is known at creation time.

**Event-based automation** (like hyprwhenthen) reacts to changes during a
window's lifetime:

- Window title changes (OAuth popups)
- Window class updates
- Focus changes
- Any other Hyprland event

Use static rules for predictable windows, event automation for dynamic ones.

### How do I list all Hyprland events?

Connect to Hyprland's event socket:

```bash
socat UNIX-CONNECT:/tmp/hypr/$HYPRLAND_INSTANCE_SIGNATURE/.socket2.sock -
```

Then interact with Hyprland (open windows, switch workspaces, etc.) to see
events in real-time.

For a full list of event types, see the
[Hyprland IPC documentation](https://wiki.hypr.land/IPC/).

### Can I use hyprwhenthen for workspace automation?

Yes! You can react to `workspace` events to automate layout changes:

```ini
[[handler]]
on = "workspace"
when = "workspace>>3"  # When switching to workspace 3
then = "hyprctl keyword monitor DP-1,3840x2160@144,0x0,1.5"
```

Or move specific apps to dedicated workspaces when they open:

```ini
[[handler]]
on = "openwindow"
when = ">>.*Spotify.*"
then = "hyprctl dispatch movetoworkspacesilent 9"
```
