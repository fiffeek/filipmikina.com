---
external: false
draft: false
showToc: true
title:
  "Hyprland Monitor Config GUI/TUI and Manager: HyprDynamicMonitors vs Kanshi,
  Hyprmon, nwg-displays"
description:
  Comprehensive comparison of Hyprland monitor configuration tools - kanshi,
  shikane, hyprmon, nwg-displays, and pyprland. Learn why I built
  HyprDynamicMonitors, the first power-aware monitor manager for Hyprland that
  uses native monitor syntax, automatically switches profiles on display
  changes, and optimizes battery life. Includes setup examples, configuration
  syntax, and a feature comparison table.
date: 2025-09-13
tags:
  [
    "Hyprland",
    "Monitor Configuration",
    "Wayland",
    "Linux",
    "Multi-Monitor",
    "Go",
    "Arch Linux",
  ]
keywords:
  [
    "hyprmon",
    "kanshi hyprland",
    "hyprland kanshi",
    "hyprland monitor config gui",
    "hyprdynamicmonitors",
    "hyprland monitor gui",
    "hyprland monitor manager",
    "hyprland display settings gui",
    "hyprland gui configuration tool",
    "hyprland monitor manager gui",
    "hyprland monitor configuration gui",
    "hyprland nwg-displays",
    "hyprland monitors gui",
    "hyprland monitor config example",
    "hyprland monitor configuration syntax",
    "nwg displays hyprland",
    "monitor settings hyprland",
    "hyprland multi monitor setup",
    "hyprland monitor setup",
    "hyprland monitor",
    "nwg-displays hyprland",
    "hyprland monitor refresh rate",
    "hyprctl monitors output example",
    "kanshi no profile matched",
    "hyprdisplay",
    "hyprland reload monitors",
    "nwg monitor",
    "hyprland configuring monitors",
    "hyprland monitor failed to set any requested modes",
    "nwg-displays",
    "hyprland monitors",
    "hyprland monitors config",
    "hyprland configure monitor",
    "wdisplays hyprland",
    "hyprland list monitors",
    "hyprland monitor layout",
    "hyprland 4k monitor",
    "hyprland change refresh rate",
    "hyprland monitor position",
    "shikane",
    "autorandr",
    "hyprland dual monitor config",
    "hyprland gui monitor configuration tool",
    "hyprland monitor settings",
    "hypr monitor",
    "hyprdisplays",
    "hyprland monitor orientation",
    "hyprland config monitors",
    "hyprland display configuration",
    "hyprland multi monitor configuration",
    "monitor config hyprland",
    "autorandr wayland",
    "how to configure monitors in hyprland",
    "nwg monitors",
    "sway vs hyprland",
    "hyprland set monitor refresh rate",
    "nwg displays not working",
    "hyprland monitor transform syntax",
    "monitor configuration hyprland",
    "hyprland monitor brightness",
  ]
---

**TL;DR:** Looking for a Hyprland monitor configuration tool? I built
[**HyprDynamicMonitors**](https://github.com/fiffeek/hyprdynamicmonitors) — a
power-aware, automatic monitor manager with a built-in TUI for Hyprland. Unlike
kanshi or shikane, it uses native Hyprland monitor syntax. Unlike nwg-displays
or hyprmon, it automatically switches profiles when you plug/unplug displays.
Most importantly, it's the only tool with power state awareness — automatically
adjusting refresh rates and settings based on whether you're on battery or AC
power. This article compares all available Hyprland monitor configuration tools
and explains why I built my own.

---

## Quick Start: Hyprland Monitor Configuration

**Manual configuration** - If you just need to configure monitors once, add this
to your `~/.config/hypr/hyprland.conf`:

```bash {% title="~/.config/hypr/hyprland.conf" %}
# Basic syntax
monitor=MONITOR-NAME,RESOLUTION@REFRESH_RATE,POSITION,SCALE

# Examples
monitor=eDP-1,2880x1920@120,0x0,2.0          # Laptop display
monitor=DP-1,3840x2160@60,2880x0,1.5         # External 4K monitor
monitor=,preferred,auto,1                     # Auto-configure remaining monitors
```

Find your monitor names with: `hyprctl monitors`

**Automatic configuration** - If you switch between multiple monitor setups
(laptop, docking station, office), you'll want a tool that automatically applies
the right configuration:

- **[kanshi](#existing-software)** / **[shikane](#existing-software)** -
  Wayland-generic, custom config format
- **[nwg-displays](#existing-software)** / **[hyprmon](#existing-software)** -
  GUI/TUI tools for manual setup
- **[HyprDynamicMonitors](#the-solution-hyprdynamicmonitors)** - Automatic +
  power-aware (my solution)

→ Jump to [tool comparison table](#existing-software) or
[read why I built my own tool](#why-i-built-my-own)

---

## Why Existing Monitor Tools Fell Short for Hyprland

After switching to Arch Linux, I decided to give Wayland another try (my last
setup was on [Ubuntu with X11](https://github.com/fiffeek/.dotfiles)). For the
compositor, I landed on [Hyprland](https://wiki.hypr.land/). Its excellent
documentation and the sheer amount of
[public configs](https://github.com/search?q=hyprland&type=code) made it an easy
choice.

But I quickly hit a roadblock: I missed one of my most essential X11 tools —
[autorandr](https://github.com/phillipberndt/autorandr). Since I regularly
switch between laptop-only, home docking, and office setups — and I care a lot
about battery life — I needed something that:

- Automatically applies the right monitor layout when displays change
- Is aware of power state (AC vs battery)
- Lets me keep using Hyprland’s native monitor syntax

---

## Existing software

Before deciding to write my own tool, I experimented with several existing
options:

- [1] [kanshi](https://sr.ht/~emersion/kanshi/) - Generic Wayland output
  management
- [2] [shikane](https://github.com/hw0lff/shikane) - Another Wayland output
  manager
- [3] [nwg-displays](https://github.com/nwg-piotr/nwg-displays) - GUI-based
  display configuration tool for Sway/Hyprland
- [4] [hyprmon](https://github.com/erans/hyprmon) - TUI-based display
  configuration tool for Hyprland
- [5]
  [pyprland's monitors plugin](https://hyprland-community.github.io/pyprland/monitors.html) -
  Hyprland monitor management via IPC

The first two ([1], [2]) are essentially `autorandr` replacements — but they
require you to define a completely separate configuration format that's then
translated to Wayland protocols. Since Hyprland already supports a powerful
[native monitor syntax](https://wiki.hypr.land/Configuring/Monitors/), I wasn't
keen on losing that flexibility.

The next two ([3], [4]) provide a way to visually configure and save monitor
profiles — great for one-time setups, but not automatic. I wanted something that
reacts instantly when monitors are plugged in or removed, _without_ me having to
run commands.

`pyprland`’s monitors plugin ([5]) came the closest to what I wanted. It listens
to Hyprland events and issues
[`hyprctl` commands](https://github.com/hyprland-community/pyprland/blob/1ddb67c648e2e6d344d86165a77b9e46e6384ff9/pyprland/plugins/monitors.py#L166).
But it had three drawbacks for my use case:

1. Its configuration format is transformed into `hyprctl` commands, meaning
   upstream code changes are required for new options.
2. There’s no simple, inspectable config file to tweak, just plugin settings.
3. No power state awareness.

After testing each option, here’s how they stacked up against what I actually
needed:

| Feature                          | kanshi | shikane | nwg-displays | hyprmon | pyprland | needed |
| -------------------------------- | ------ | ------- | ------------ | ------- | -------- | ------ |
| Visual way to adjust monitors    | ❌     | ❌      | ✅           | ✅      | ❌       | ❓     |
| Automatic config application     | ✅     | ✅      | ❌           | ❌      | ✅       | ✅     |
| Power state awareness            | ❌     | ❌      | ❌           | ❌      | ❌       | ✅     |
| Outputs an editable file         | ❌     | ❌      | ✅           | ✅      | ❌       | ✅     |
| User control over generated file | ❌     | ❌      | ❌           | ❌      | ❌       | ✅     |
| Supports Hyprland                | ✅     | ✅      | ✅           | ✅      | ✅       | ✅     |
| Supports Wayland (generic)       | ✅     | ✅      | ✅           | ❌      | ❌       | ❓     |

## Why I Built My Own

Extending `pyprland` would have meant dealing with power-awareness, rewriting
its config parser, and restructuring event handling — essentially a partial
rewrite.

Since I wanted full control over configuration, a minimal architecture, and
something that gracefully survives restarts, suspend/resume cycles, and
enabling/disabling a monitor, I decided to build a dedicated tool instead.

---

## Building HyprDynamicMonitors: A Power-Aware Monitor Manager

The result is
[**HyprDynamicMonitors**](https://github.com/fiffeek/hyprdynamicmonitors): a
power-aware, event-driven monitor configuration manager that embraces Hyprland's
native config syntax instead of abstracting it away. Check out
[the GitHub repository](https://github.com/fiffeek/hyprdynamicmonitors/blob/main/README.md)
for more examples and detailed usage instructions.

---

## Core Design Principles

### Event-driven, not polling

Listens to Hyprland IPC and D-Bus events; near-zero CPU usage when idle.

### Native Hyprland syntax

No new DSL to learn; just write normal Hyprland config with Go template logic
for dynamic behavior:

```gotmpl {% title="~/.config/hyprdynamicmonitors/hyprconfigs/basic.conf" %}
# Adjust refresh rate based on power state
monitor=eDP-1,2880x1920@{{if isOnAC}}120.00000{{else}}60.00000{{end}},0x0,2.0,vrr,1

{{if isOnBattery}}
# Disable animations when on battery
animations {
    enabled = false
}
{{end}}
```

### Profile-based matching

Each monitor setup gets its own profile with clear matching rules. When a
profile matches the current environment, its config is applied automatically:

```ini {% title="~/.config/hyprdynamicmonitors/config.toml" %}
[profiles.laptop_only]
config_file = "laptop.conf"
[[profiles.laptop_only.conditions.required_monitors]]
name = "eDP-1"

[profiles.dual_4k]
config_file = "dual-4k.conf"
[[profiles.dual_4k.conditions.required_monitors]]
name = "eDP-1"
[[profiles.dual_4k.conditions.required_monitors]]
description = "Dell U2720Q"
```

### Fail-fast reliability

If something goes wrong, the service exits immediately rather than continuing in
a broken state. `Systemd` then restarts it and re-applies the correct
configuration; no silent failures.

## Design decisions

- **Go templates** were chosen for their simplicity and familiarity to anyone
  who's used `Hugo`, `Helm`, or `Kubernetes` manifests.
- **File generation over `hyprctl` commands** gives you visibility and control.
  You can inspect, tweak, and version your configs.
- **Built-in TUI** provides an interactive terminal interface for configuring
  monitors visually. You can experiment with layouts, positions, resolutions,
  and refresh rates in real-time before applying or saving them as profiles.

## What makes it different

- **Full Hyprland integration**: Uses native syntax, so you can inspect, debug,
  and even version-control the generated configs.
- **Power state awareness**: Automatically adapts refresh rates, animations, and
  layouts based on whether you're on AC power or battery.
- **Hot reloading**: Configuration changes are applied automatically without
  restarting the service.
- **Minimal resource usage**: No polling, no background loops — it's entirely
  event-driven.

### Interactive TUI

HyprDynamicMonitors includes a built-in terminal user interface for visual
monitor configuration. The TUI lets you:

- Adjust monitor positions, resolutions, and refresh rates interactively
- Preview changes in real-time before applying them
- Save configurations as profiles for automatic switching
- Edit monitor properties like rotation, scaling, and VRR settings

![TUI Demo](/images/demo.gif)

The TUI is especially useful for initial setup or experimenting with new monitor
arrangements. Once you've configured a layout you like, save it as a profile and
the daemon will automatically apply it whenever that monitor combination is
detected.

For detailed TUI usage and keyboard shortcuts, see the
[TUI documentation](https://hyprdynamicmonitors.filipmikina.com/docs/quickstart/tui).

---

## Real-World Impact After Weeks of Daily Use

After using HyprDynamicMonitors for several weeks in my daily workflow, it's
solved the core problems I had with existing solutions:

- **Laptop mobility**: Plugging into my desk setup at home or work automatically
  switches to the appropriate multi-monitor configuration. Unplugging
  immediately falls back to laptop-only mode with battery-optimized settings.
- **Power efficiency**: Battery profiles automatically reduce refresh rates from
  120Hz to 60Hz and disable resource-intensive visual effects, extending battery
  life without any manual intervention.
- **Maintainable configuration**: Since it uses standard Hyprland syntax,
  configuration changes don't require learning tool-specific formats. Templates
  make it easy to share common patterns across profiles while keeping each one
  readable.
- **Reliability**: The fail-fast design with systemd restarts has proven robust
  over weeks of daily use (mostly due to user errors on the configuration side).
  The service handles Hyprland restarts, suspend/resume cycles, and various edge
  cases gracefully.

---

## Was it worth building from scratch?

The combination of power state awareness, native Hyprland integration, and
template-based configuration would have been difficult to achieve by extending
existing tools without fundamental architectural changes.

This approach does come with trade-offs, though. It's Hyprland-specific (unlike
`kanshi` or `shikane` which work with any Wayland compositor), and the fail-fast
design requires proper service management setup.

For users with simpler needs or those using other compositors, existing tools
are likely sufficient. But for complex laptop setups requiring power-aware,
dynamic monitor configuration with full control over the resulting Hyprland
config, building a purpose-built solution proved to be the right choice.

Plus, it gave me a great excuse to dive deeper into `Go`, `D-Bus`, `AUR`, and
`Hyprland`'s internals — which was fun!

## Feedback

HyprDynamicMonitors ended up solving every pain point I had: seamless profile
switching, battery-optimized refresh rates, and solid reliability. All while
letting me keep full control over my Hyprland config.

If you have a laptop setup that moves between multiple monitor configurations,
give it a try!

- [GitHub repo with installation and usage](https://github.com/fiffeek/hyprdynamicmonitors)
- [All configuration options](https://github.com/fiffeek/hyprdynamicmonitors/blob/main/examples/full/config.toml)

And if you run into issues or have ideas for improvement,
[open an issue](https://github.com/fiffeek/hyprdynamicmonitors/issues) or
[email me](mailto:filipmikina@gmail.com) — I'd love to hear how it works on your
setup.

---

## FAQ: Common Hyprland Monitor Configuration Issues

### How do I configure monitors in Hyprland?

Add monitor configuration to `~/.config/hypr/hyprland.conf` using the syntax:

```bash
monitor=MONITOR-NAME,RESOLUTION@REFRESH_RATE,POSITION,SCALE
```

List your available monitors with `hyprctl monitors` to get the exact names. For
automatic multi-monitor management, use tools like kanshi, hyprmon,
nwg-displays, or HyprDynamicMonitors.

### What Hyprland monitor managers are available?

- **kanshi / shikane** - Automatic profile switching, but use custom config
  formats instead of native Hyprland syntax
- **nwg-displays** - GUI tool for visual monitor configuration (manual
  application)
- **hyprmon** - TUI tool for terminal-based monitor setup (manual application)
- **HyprDynamicMonitors** - Automatic, power-aware manager using native Hyprland
  syntax

See the [comparison table](#existing-software) above for detailed feature
breakdown.

### How do I fix "kanshi: no profile matched" error?

This happens when kanshi can't find a profile matching your current monitor
setup. Check:

1. Monitor names in your kanshi config match `hyprctl monitors` output exactly
2. You've defined a fallback profile with just your laptop display
3. Profile conditions aren't too restrictive (try using just monitor names, not
   serial numbers)

Alternatively, use HyprDynamicMonitors which generates profiles from your
Hyprland config instead of requiring a separate format.

### Why isn't nwg-displays working with Hyprland?

Common issues:

1. **Changes not persisting** - nwg-displays saves to a separate config file.
   You need to source it from your main Hyprland config.
2. **Conflicts with existing config** - Check for conflicting monitor statements
   in `hyprland.conf`
3. **Wayland permissions** - Ensure nwg-displays has proper Wayland display
   access

For automatic application without manual GUI interaction, consider kanshi or
HyprDynamicMonitors instead.

### How do I set monitor refresh rate in Hyprland?

In your Hyprland config:

```bash
monitor=eDP-1,2880x1920@120,0x0,2.0  # 120Hz
monitor=DP-1,3840x2160@60,2880x0,1.5  # 60Hz
```

To change dynamically: `hyprctl keyword monitor "eDP-1,2880x1920@60,0x0,2.0"`

For power-aware refresh rate switching (e.g., 120Hz on AC, 60Hz on battery), use
HyprDynamicMonitors.

### How do I fix "Hyprland: monitor failed to set any requested modes"?

This error means the monitor doesn't support the requested resolution/refresh
rate.

**Manual fix:** List supported modes with `hyprctl monitors`, then use a valid
resolution like `monitor=DP-1,3840x2160@60,0x0,1` or
`monitor=DP-1,preferred,auto,1`. Check cable quality - DisplayPort 1.4 is
required for 4K@120Hz.

**OR** use [HyprDynamicMonitors TUI](#interactive-tui) which automatically
restricts you to valid resolutions and refresh rates for each connected monitor,
preventing this error entirely.

### What's the difference between hyprmon and HyprDynamicMonitors?

**hyprmon** is a TUI for manually configuring and saving monitor layouts. You
run it, configure your setup, and save it - but you need to manually re-run it
when monitors change.

**HyprDynamicMonitors** is a superset: it includes a similar TUI for one-time or
persistent configuration, but also runs as a background service that
automatically detects monitor changes and applies the right profile. It
additionally supports power state awareness (AC vs battery) and uses Go
templates for dynamic configuration.

Think of HyprDynamicMonitors as "hyprmon + automatic switching + power
awareness".
