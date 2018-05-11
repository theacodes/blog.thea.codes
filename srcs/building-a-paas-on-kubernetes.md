---
title: Opinionated deployment tools & Kubernetes
date: 2016-02-10
legacy_url: yes
---

*Note: This post expects you to be familiar with [Kubernetes](kubernetes.io) concepts.*

**You should be building on top of Kubernetes**. Seriously.

To me, a large shift in my understanding of Kubernetes came when I started thinking about the things that it provides, such as replication controllers, services, pods, etc., as building blocks. Sure, you can write a few yaml files and deploy a wide variety of things. However, in some situations it's more useful to approach things at a higher level.

Consider the usual process of deploying an application to a Platform-as-a-Service. For Heroku, you run `git push`. For Google App Engine, you run `appcfg.py update`. The platform handles creating and configuring an opinionated set of resources to run your application. You don't have to think about "well, I need a replication controller, a service, etc.". You simply deploy your code in one step. In a Platform-as-a-Service, you're no longer concerned with the individual resources needed to run your app.

I feel that building this sort of workflow on Kubernetes is critical when bridging the gap from Development to DevOps. Developers typically aren't overly concerned without how the platform handles deploying the app. They write code and they need a way to say 'this is ready to deploy'. DevOps should enable this.

Kubernetes gives us the tools to build a Platform-as-a-Service experience. In fact, it's a great idea! The good folks over at [Deis](https://deis.io) are currently rebuilding Deis v2 on Kubernetes. Although you can explicitly define every Kubernetes resource required to deploy your app, you don’t necessarily need to, in fact, it may be an anti-pattern.

## Noel: A minimal cluster-native PaaS

I decided to see just how difficult it would be to create a tool that enables a 'minimal' PaaS workflow on Kubernetes. A 'minimal' PaaS would need to provide:

1. **Zero-config deployment**: A Dockerfile should be the only requirement for deploying code.
2. **Multiple apps/microservices**: The PaaS should be able to host any number of apps/microservices, and they should be able to communicate with each other.
2. **Scaling**: the cluster administrator should be able to easily manually scale applications up and down.
2. **Configuration management**: There should be a way to set configuration values independently of the code base, as spelled in [12 factor app](http://12factor.net/).

When creating the tool, I decided to try to create something somewhere between [dokku](http://dokku.viewdocs.io/dokku/) and [deis](https://deis.io). Both of these provide a great, straightforward developer experience. I decided to provide two workflows for deploying applications:

1. **Local build**: you can run `noel build-and-deploy` in a directory containing a Dockerfile to build deploy an application. This is similar to how [Google App Engine](https://cloud.google.com/appengine) works.
2. **Remote build**: you can add a special remote and run `git push noel master` to remotely build and deploy an application.

Both of these present a much more straightforward workflow to developers over interacting directly with the Kubernetes cluster. As a bonus, they're both trivial to integrate into a continuous integration pipeline.

[Noel](https://github.com/theacodes/noel) is available on github. Here's a demonstration of using the remote build workflow to deploy a simple application. Once deployed, you can see it takes only a few seconds for the application to come up and serve traffic:

<script type="text/javascript" src="https://asciinema.org/a/4r2lhzq9tq63qmk0xv4wtlvng.js" id="asciicast-4r2lhzq9tq63qmk0xv4wtlvng" async></script>

## Putting the pieces together

Noel uses the following Kubernetes resources to deploy applications onto the cluster:

* **Replication Controller**: Noel creates a unique replication controller for every *version* of a deployed application. In the future, the Kubernetes Deployment API can be used to do rolling updates to avoid downtime.
* **Secrets**: Each application has a secret associated with it that is used to store the application configuration. Noel configures the application's replication controller to mount the secret on its pods.
* **Service**: Each application has a service that routes cluster-internal traffic to its pods. This allows applications/microservices to talk directly to each other within the cluster.

Noel runs two services itself on the cluster:

2. **Remote Builder**: Handles `git push` requests and runs `noel build-and-deploy` to build and deploy applications.
3. **Nginx Frontend**: Handles proxying external traffic from `app.example.com` to the appropriate application's service.

## A multi-mode cluster

Noel, along with applications developed with Noel, are able to run alongside anything else that is deployed on the cluster. This is a truly powerful aspect of Kubernetes. Consider an application that consists of three microservices and requires Redis and PostgreSQL. The microservices are stateless and can be easily deployed via something like Noel or Deis v2. The Redis and PostgreSQL resources can be maintained directly by the cluster administrator or via something like [helm](https://helm.sh). You can connect them all together using the Kubernetes DNS service and Secrets.

In short, you do not need to stick with a particular way of Kubernetes deployment. You should choose what's right for each subset of what you need to deploy and build tools to support that. Noel is a very small tool, and proof-positive that it is possible to build your own tools to handle **opinionated workflows** on top of Kubernetes.
