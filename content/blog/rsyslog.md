---
external: false
draft: false
title: Forwarding UDP syslog messages to Loki using Promtail
description: This post is a draft and won't be built.
date: 2024-02-22
---

# Problem

As a part of unifying the developer experience and allowing for more uniform observability stack
for one company I was working on centralizing multiple log sources into a single pane we
could set up alerts from.

Logs centralization can be accomplished in many ways, in the context of this article the problem
I was faced with was collecting information from multiple sources to [Grafana Loki](https://grafana.com/oss/loki/) which [is supposed to offer a lower maintenance overhead](https://signoz.io/blog/loki-vs-elasticsearch/) in comparison with, e.g., ElasticSearch. One troublesome source happened to be an older appliance device that could only be configured to send syslog messages through UDP (with, well, undocumented and custom message format).

## Similar articles

Here are a couple of similar articles that got me started on the issue:

- [Using Rsyslog and Promtail to relay syslog messages to Loki](https://alexandre.deverteuil.net/post/syslog-relay-for-loki/)

# Background

Forwarding syslog messages to Loki is _almost_ straightforward, since relays such as [Promtail](https://grafana.com/docs/loki/latest/send-data/promtail/), or [Vector](https://vector.dev/docs/reference/configuration/sinks/loki/) are designed to listen to syslog messages and sink to Loki ([1](https://grafana.com/docs/loki/latest/send-data/promtail/configuration/#syslog), [2](https://vector.dev/docs/reference/configuration/sources/syslog/)). However, as the Grafana's documentation indicates, it's not all roses:

> The recommended deployment is to have a dedicated syslog forwarder like syslog-ng or rsyslog in front of Promtail. The forwarder can take care of the various specifications and transports that exist (UDP, BSD syslog, …).

Diving more into the specification, a few of the restrictions that Promtail syslog listener enforces are:

- Listening only works for TCP ([open issue](https://github.com/grafana/loki/issues/6772))
- The message format has to follow [IETF Syslog (RFC5424)](https://datatracker.ietf.org/doc/html/rfc5424)

In a very basic setup, wiring Promtail and Loki might be just enough, however, not all external vendors
support all of the above conditions (e.g. the messages might only be sent via UDP, or the format is bespoke). In other other, or the code that produces the syslog messages is simply out of our control and has some _weird_ specification.

One other infrastructural requirement that my specific environment enforced was using containers, and more specifically deploying this on Kubernetes. In this article, I'll go through a basic setup that allows for setting up rsyslog in a containerized environment.

# Solution

Per the official documentation above, the simplest solution to go about this is to
spin up a syslog forwarder that listens to multiple formats and transports, and forwards the message to Promtail,
which in turn forwards to message to Loki.

## Diagram

## Setup and configuration

### Rsyslog

```raw
module(load="imptcp")
module(load="imudp" TimeRequery="500")

input(type="imptcp" port="10514")
input(type="imudp" port="10514")

module(load="omprog")
module(load="mmutf8fix")
action(type="mmutf8fix" replacementChar="?")
*.* action(type="omfwd" Target="promtail" Port="1514" Protocol="tcp" Template="RSYSLOG_SyslogProtocol23Format")
```

### Promtail

### Loki

### Docker compose

# Bonus: Kubernetes

## Manifests
