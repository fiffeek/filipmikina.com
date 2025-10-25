---
external: false
title:
  "Rsyslog to Grafana Loki: Forwarding Syslog Messages via Promtail Syslog
  Receiver"
description:
  Complete guide to forwarding syslog messages from rsyslog to Grafana Loki
  using Promtail syslog receiver. Learn how to configure rsyslog as a UDP syslog
  server and forwarder to relay custom syslog formats to Loki. Includes Docker
  Compose and Kubernetes deployment examples for promtail syslog receiver
  configuration.
date: 2024-02-22
tags:
  [
    "Rsyslog",
    "Grafana Loki",
    "Loki",
    "Promtail",
    "Syslog",
    "Syslog Forwarding",
    "DevOps",
    "Docker",
    "Kubernetes",
    "Logging",
    "Observability",
  ]
keywords:
  [
    "rsyslog to loki",
    "syslog to loki",
    "rsyslog loki",
    "loki syslog",
    "promtail syslog",
    "rsyslog grafana",
    "syslog loki",
    "loki rsyslog",
    "send syslog to loki",
    "loki syslog receiver",
    "promtail vs vector",
    "loki.source.syslog",
    "grafana loki syslog",
    "grafana rsyslog",
    "loki syslog server",
    "promtail syslog receiver configuration example",
    "promtail syslog receiver configuration",
    "promtail syslog receiver documentation",
    "syslog forwarder",
    "udp syslog",
  ]
---

# Background

As part of unifying the developer experience and enabling a more uniform
observability stack for one company, I worked on centralizing multiple log
sources into a single pane from which the team could set up alerts.

Log centralization can be accomplished in many different ways. In the context of
this article, the problem I faced was collecting information from multiple
sources into [Grafana Loki](https://grafana.com/oss/loki/), which
[is said to offer a lower maintenance overhead](https://signoz.io/blog/loki-vs-elasticsearch/)
compared to, for example, ElasticSearch (more generally,
[ELK stack](https://aws.amazon.com/what-is/elk-stack/)). One troublesome source
happened to be an older appliance device that could only be configured to send
syslog messages through UDP (with, well, undocumented and custom message
format).

## Similar articles

Here are a couple of similar articles that got me started on the issue:

- [Using Rsyslog and Promtail to relay syslog messages to Loki](https://alexandre.deverteuil.net/post/syslog-relay-for-loki/)
- [Sending logs from syslog-ng to Grafana Loki](https://www.syslog-ng.com/community/b/blog/posts/sending-logs-from-syslog-ng-to-grafana-loki)
- [How I fell in love with logs thanks to Grafana Loki](https://grafana.com/blog/2021/03/23/how-i-fell-in-love-with-logs-thanks-to-grafana-loki/)
- [Create Rsyslog Service in Kubernetes](https://zhimin-wen.medium.com/create-rsyslog-service-in-kubernetes-12102c517895)

# Syslog Forwarding Challenges

Sending syslog messages to Loki seems _almost_ straightforward, thanks to relays
like [Promtail](https://grafana.com/docs/loki/latest/send-data/promtail/) or
[Vector](https://vector.dev/docs/reference/configuration/sinks/loki/), designed
to listen to syslog messages and feed them to Loki
[[1](https://grafana.com/docs/loki/latest/send-data/promtail/configuration/#syslog)]
[[2](https://vector.dev/docs/reference/configuration/sources/syslog/)]. However,
as
[Grafana's documentation](https://grafana.com/docs/loki/latest/send-data/promtail/configuration/#syslog)
cautions, it's not all smooth sailing:

> The recommended deployment is to have a dedicated syslog forwarder like
> syslog-ng or rsyslog in front of Promtail. The forwarder can handle various
> specifications and transports that exist (UDP, BSD syslog, …).

Digging deeper into the specifications, some restrictions imposed by the
Promtail syslog listener include:

- Listening only functions for TCP
  ([open issue](https://github.com/grafana/loki/issues/6772))
- The message format must adhere to
  [IETF Syslog (RFC5424)](https://datatracker.ietf.org/doc/html/rfc5424)
  "standard."

Before delving into any work, I confirmed that similar conditions apply to other
agents, such as
[Grafana Agent](https://grafana.com/docs/agent/latest/flow/reference/components/loki.source.syslog/)
or Vector. While they support _some_ use cases, nothing worked out of the box in
our context. Issues ranged from lack of UDP support to sporadic UDP support or
rejection of messages due to custom formats (for instance, Vector only supports
["common variations"](https://vector.dev/docs/reference/configuration/sources/syslog/#parsing)).

In a straightforward setup, connecting Promtail and Loki might suffice. However,
not all external vendors meet the specified conditions (e.g., messages may only
be sent via UDP, or the format is bespoke). Alternatively, it may be that the
code generating the syslog messages is beyond our control and follows a
_peculiar_ specification.

Another infrastructural requirement imposed by my specific environment was
container usage, specifically deploying this on Kubernetes. In this article,
I'll guide you through a basic setup for deploying
[rsyslog](https://www.rsyslog.com/) in a containerized environment, testing it
locally with `docker-compose`, and as a bonus, present a basic Kubernetes setup.

# Streamlining with Syslog Forwarding

As per the guidelines laid out in Grafana's aforementioned documentation, the
most straightforward approach involves setting up a syslog forwarder. This
forwarder should be adept at handling various formats and transports, seamlessly
relaying messages to Promtail, which, in turn, dispatches them to Loki. A nifty
solution lies in leveraging
[rsyslog's Alpine Docker image project](https://github.com/rsyslog/rsyslog-docker/tree/master/appliance/alpine),
conveniently accessible on
[DockerHub](https://hub.docker.com/r/rsyslog/syslog_appliance_alpine). Despite
the container image's vintage, the syslog landscape hasn't undergone significant
changes in the past six years. Now, let's delve into the configuration details.

## Diagram

The following diagram outlines the solution:

![Rsyslog](/images/rsyslog.svg)

## Prerequisites

This article operates under the assumption that the reader possesses a
foundational understanding of Docker and Docker Compose, emphasizing the
creation of a consistent and replicable environment using these tools to
evaluate the `rsyslog` forwarder.

Please ensure you have the following tools at your disposal:

- [Docker](https://docs.docker.com/install)
- [Docker Compose](https://docs.docker.com/compose/install)
- [netcat](https://linuxize.com/post/netcat-nc-command-with-examples/)

## Setup and configuration

The next sections will walk you through a basic setup using `docker compose` so
that you can follow along and test it in a reproducible environment.

### Rsyslog

The configuration underneath is telling `rsyslog` how to forward its inputs to
Promtail:

```text {% title="rsyslog.conf" %}
module(load="imptcp")
module(load="imudp" TimeRequery="500")
input(type="imptcp" port="10514")
input(type="imudp" port="10514")

module(load="omprog")
module(load="mmutf8fix")
action(type="mmutf8fix" replacementChar="?")
*.* action(type="omfwd" Target="promtail" Port="1514" Protocol="tcp" Template="RSYSLOG_SyslogProtocol23Format")
```

The first four lines in the configuration detail that our application is set up
to listen for both UDP and TCP connections on port `10514`. Moving on, the next
paragraph specifies that any incoming data should be directed to a target named
`promtail`. This `promtail` service is identified by its DNS name and expects
TCP connections on port `1514`. Additionally, it mandates that the forwarded
message should adhere to the
[RSYSLOG_SyslogProtocol23Format](https://www.rsyslog.com/doc/configuration/templates.html#reserved-template-names)
template. For an extra layer of robustness, I've included the
[mmutf8fix](https://www.rsyslog.com/doc/configuration/modules/mmutf8fix.html)
module, capable of handling any non-UTF-8 characters in the input. The use of
this module is entirely optional.

You can write a simple standalone `docker-compose.yaml` file to validate the
container comes up properly:

```yaml {% title="docker-compose.yaml" %}
services:
  rsyslog:
    image: rsyslog/syslog_appliance_alpine
    ports:
      - "10514:10514/tcp"
      - "10514:10514/udp"
    volumes:
      - ./rsyslog.conf:/config/rsyslog.conf
      - data:/work
    environment:
      RSYSLOG_CONF: "/config/rsyslog.conf"

volumes:
  data:
```

The usage of `RSYSLOG_CONF` is explained in the official
[documentation](https://github.com/rsyslog/rsyslog-docker/tree/master/appliance/alpine#environment-variables),
the `data` volume is added because it is a
[staging work directory](https://github.com/rsyslog/rsyslog-docker/tree/master/appliance/alpine#work)
for `rsyslog` that needs to be preserved across restarts. The above
configuration can be tested with `docker compose up`. To validate that the
messages can be sent via UDP you can run:

```
echo '<165>4    An application event log entry...' | nc -v -u localhost 10514
```

You should see a similar output to the one underneath for the command:

```
Connection to localhost (127.0.0.1) 10514 port [udp/*] succeeded!
```

### Promtail

The following configuration allows for listening for TCP syslog messages and
forwarding them to Loki:

```yaml {% title="promtail.yaml" %}
server:
  http_listen_port: 9081
  grpc_listen_port: 0

positions:
  filename: /var/tmp/promtail-syslog-positions.yml

clients:
  - url: http://loki:3100/loki/api/v1/push

scrape_configs:
  - job_name: syslog
    syslog:
      listen_address: 0.0.0.0:1514
      labels:
        job: syslog
    relabel_configs:
      - source_labels:
          - __syslog_message_hostname
        target_label: hostname
      - source_labels:
          - __syslog_message_app_name
        target_label: app
      - source_labels:
          - __syslog_message_severity
        target_label: level
```

By extending the `docker-compose.yaml` file, it is easy to validate that both
start up:

```diff
@@ -9,6 +9,12 @@ services:
       - data:/work
     environment:
       RSYSLOG_CONF: "/config/rsyslog.conf"
+  promtail:
+    image: grafana/promtail:2.9.4
+    volumes:
+      - ./promtail.yaml:/promtail.yaml
+    command:
+      - -config.file=/promtail.yaml

 volumes:
   data:
```

After executing `docker compose up` again and testing with:

```bash
echo '<165>4 2018-10-11T22:14:15.003Z mymach.it e - 1 [ex@32473 iut="3"] An application event log entry...' | nc -v -u localhost 10514
```

We can see that (after a couple internal retries and finally buffering the
message) the log can't be sent to `Loki` since we have not yet started it
(`dial tcp: lookup loki on 127.0.0.11:53: server misbehaving`):

```
rsyslog-promtail-1  | level=warn ts=2024-02-22T17:29:09.020479781Z caller=client.go:419 component=client host=loki:3100 msg="error sending batch, will retry" status=-1 tenant= error="Post \"http://loki:3100/loki/api/v1/push\": dial tcp: lookup loki on 127.0.0.11:53: server misbehaving"
```

### Loki

Spinning up Loki so that Promtail can push logs to it is as simple as:

```diff
@@ -15,6 +15,10 @@ services:
       - ./promtail.yaml:/promtail.yaml
     command:
       - -config.file=/promtail.yaml
+  loki:
+    image: grafana/loki:2.9.4
+    ports:
+      - 31000:3100

 volumes:
   data:

```

Then once again after restarting the compose application (by killing the current
pane and running `docker compose up`), one final test can be performed:

```bash
echo '<165>4 first 2018-10-11T22:14:15.003Z mymach.it e - 1 [ex@32473 iut="3"] An application event log entry...' | nc -v -u localhost 10514
echo '<165>4 second 2018-10-11T22:14:15.003Z mymach.it e - 1 [ex@32473 iut="3"] An application event log entry...' | nc -v -u localhost 10514
```

Due to the internal buffering the push above is performed twice so that the
first message is pushed to Promtail and Loki so that we can validate whether the
setup works:

```bash
curl http://localhost:31000/loki/api/v1/series
# {"status":"success","data":[{"level":"notice","job":"syslog","hostname":"4","app":"first"}]}
```

The second message should arrive later when more data is pushed.

### Docker compose

To provide a holistic view, here's the final Docker Compose file:

```yaml {% title="docker-compose.yaml" %}
services:
  rsyslog:
    image: rsyslog/syslog_appliance_alpine
    ports:
      - "10514:10514/tcp"
      - "10514:10514/udp"
    volumes:
      - ./rsyslog.conf:/config/rsyslog.conf
      - data:/work
    environment:
      RSYSLOG_CONF: "/config/rsyslog.conf"
  promtail:
    image: grafana/promtail:2.9.4
    volumes:
      - ./promtail.yaml:/promtail.yaml
    command:
      - -config.file=/promtail.yaml
  loki:
    image: grafana/loki:2.9.4
    ports:
      - 31000:3100

volumes:
  data:
```

# Summary: Expanding Possibilities

Within this article, I've introduced a fundamental technique to channel UDP
syslogs, even with varying formats, to Loki through Promtail. The beauty of this
approach lies in its adaptability. You can broaden its scope by tweaking
configurations, such as extending `rsyslog's` setup or adjusting `Promtail's`
forwarding and labeling mechanisms. This flexibility empowers you to tailor the
solution to diverse data formats, making it a versatile foundation for your
syslog forwarding endeavors.

# Bonus: Simple setup in Kubernetes

This configuration can be easily mapped to Kubernetes abstractions to allow for
a simple deployment and usage.

## Rsyslog

The user needs some kind of
[an ingress controller](https://kubernetes.io/docs/concepts/services-networking/ingress-controllers/)
or [a load balancer](https://kubernetes.io/docs/concepts/services-networking/)
to expose the rsyslog forwarder service, and as these are heavily dependent on
the context, the following configuration does not take this fully into account.

### Configuration

The configuration itself can be kept in a config map for simplicity:

```yaml {% title="cm.yaml" %}
apiVersion: v1
kind: ConfigMap
metadata:
  name: rsyslog-config
data:
  rsyslog.conf: |
    module(load="imptcp")
    module(load="imudp" TimeRequery="500")
    input(type="imptcp" port="10514")
    input(type="imudp" port="10514")
    module(load="omprog")
    module(load="mmutf8fix")
    action(type="mmutf8fix" replacementChar="?")
    *.* action(type="omfwd" Target="promtail" Port="10514" Protocol="tcp" Template="RSYSLOG_SyslogProtocol23Format")
```

An alternative approach would be to bake this in the container image itself.

### Deployment

```yaml {% title="deployment.yaml" %}
apiVersion: apps/v1
kind: Deployment
metadata:
  name: rsyslog-forwarder
  labels:
    app: rsyslog-forwarder
spec:
  selector:
    matchLabels:
      app: rsyslog-forwarder
  template:
    metadata:
      labels:
        app: rsyslog-forwarder
    spec:
      containers:
        - name: rsyslog-forwarder
          image: rsyslog/syslog_appliance_alpine:latest
          env:
            - name: "RSYSLOG_CONF"
              value: "/config/rsyslog.conf"
          ports:
            - containerPort: 10514
              name: syslogudp
              protocol: UDP
          volumeMounts:
            - name: rsyslog-work
              mountPath: /work
            - name: rsyslog-config
              mountPath: /config/rsyslog.conf
              readOnly: true
              subPath: rsyslog.conf
      volumes:
        - name: rsyslog-work
          persistentVolumeClaim:
            claimName: rsyslog-work # TODO: pvc needs to be provided externally
        - name: rsyslog-config
          configMap:
            name: rsyslog-config
```

Take note of the `volume` named `rsyslog-work`. It's hooked up using a
[persistent volume claim (PVC)](https://kubernetes.io/docs/concepts/storage/persistent-volumes/).
This specific storage area plays a crucial role for `rsyslog` – think of it as
the backstage where things get organized.

Now, the nitty-gritty details about which PVC to choose and how to set it up are
beyond the scope of this article. Different environments may have various
options. If you're in a public cloud, like Google Cloud, making sure this
backstage area is available is usually a breeze. They've got something called
[dynamic PVC provisioning](https://cloud.google.com/kubernetes-engine/docs/concepts/persistent-volumes),
making your life easier in cloud setups.

### Service

No matter how we would like to expose the pods to the external world we would
need a service object:

```yaml {% title="service.yaml" %}
apiVersion: v1
kind: Service
metadata:
  labels:
    app: rsyslog-forwarder
  name: syslog-shipper-rsyslog
spec:
  ports:
    - name: syslogudp
      port: 10514
      protocol: UDP
      targetPort: syslogudp
  selector:
    app: rsyslog-forwarder
  type: ClusterIP
```

Depending on the context, the`LoadBalancer` service type with a static IP might
be a better choice, or alternatively, one could expose the deployment for with
an ingress object and an ingress controller, such as
[NGINX Ingress Controller](https://docs.nginx.com/nginx-ingress-controller/).
Tailor your approach based on the specific needs and nuances of your
environment.

## Promtail

To achieve a comprehensive configuration, leverage
[the Helm Chart for Promtail](https://github.com/grafana/helm-charts/tree/main/charts/promtail).
This allows you to seamlessly configure Promtail to listen to `syslog` and relay
messages to `Loki`, mirroring the setup in the Docker Compose scenario. Below
are sample values you can feed to the chart:

```yaml {% title="values.yaml" %}
config:
  clients:
    - url: http://loki:3100/loki/api/v1/push

  snippets:
    scrapeConfigs: |
      - job_name: syslog
        syslog:
          listen_address: 0.0.0.0:1514
          labels:
            job: syslog
        relabel_configs:
          - source_labels:
              - __syslog_message_hostname
            target_label: hostname
          - source_labels:
              - __syslog_message_app_name
            target_label: app
          - source_labels:
              - __syslog_message_severity
            target_label: level

daemonset:
  enabled: false

deployment:
  enabled: true

extraPorts:
  syslog:
    name: tcp-syslog
    containerPort: 1514
    protocol: TCP
    service:
      type: ClusterIP
      port: 1514
      externalIPs: []
```
