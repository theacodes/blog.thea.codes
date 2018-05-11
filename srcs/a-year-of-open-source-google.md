---
title: A year of open-source @ Google
date: 2016-03-24
legacy_url: yes
---

It's been just over a year since I joined the amazing Cloud Platform Developer Relations team at Google. I'm incredibly happy to be part of a team filled with passionate and brilliant people who are always excited about technology and fanatical about open-source.

For me personally, it's incredibly fulfilling to be in a position where nearly everything I write is open-source. Over the last year I've published more open-source code than I ever have in my life. I thought it might be nice to review some of the stuff I've managed to put together. :)

## Nox

[Nox](http://nox.readthedocs.org/en/latest/) is a project of necessity. While trying to test our Python samples, we realized that our Tox configuration was out-of-control. We needed something more flexible. Nox is almost identical to Tox, with the exception that Nox uses a small Python script instead of an ini file for configuration. This small difference allows us to write smaller, easier to understand test automation scripts. While I don't anticipate Nox replacing Tox altogether (not even for my projects), I do like having the option of something more flexible when it's needed.

## Noel

[Noel](https://github.com/theacodes/noel) was really my first attempt at writing something for the Kubernetes ecosystem. I [wrote in detail](http://blog.thea.codes/building-a-paas-on-kubernetes/) about Noel in another blog post. Basically, it's another layer of abstraction on top of Kubernetes that lets you take a container and deploy it straight to Kubernetes without thinking about Kubernetes. I was rather surprised at the positive response to this - the Kubernetes Deployment SIG was kind enough to invite me to talk about it during their meeting. [KubeWeekly](https://twitter.com/kubeweekly) was nice enough to post it in their newletter. I plan on coming back to Noel soon and taking advantage of some new Kubernetes features.

## PSQ

[PSQ](https://github.com/GoogleCloudPlatform/psq), or Pub/Sub Queue, is a [rq](http://python-rq.org/)-alike that uses [Cloud Cloud Pub/Sub](https://cloud.google.com/pubsub) as the transport instead of Redis. This is really neat because it essentially allows you to have a zero-configuration deferred task queue. Cloud Pub/sub is an impressive transport that can scale to millions of messages per second.

## httplib2shim

[httplib2shim](https://github.com/GoogleCloudPlatform/httplib2shim) provides a [httplib2](https://pypi.python.org/pypi/httplib2) interface over [urllib3](https://urllib3.readthedocs.org/en/latest/). This allows people who are stuck using libraries that depend on httplib2 to benefit from the sanity (thread safety, certificate validation, connection pooling) of urllib3.

## Flask-Talisman

[Talisman](https://github.com/google/oauth2client/issues/211) is a small flask extension that provides sane defaults for HTTP security headers as well as comprehensive [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/Security/CSP/Introducing_Content_Security_Policy) support.

## urllib3.contrib.appengine

Speaking of urllib3, I was happy to be able to contribute [urllib3.contrib.appengine](https://urllib3.readthedocs.org/en/latest/contrib.html#google-app-engine) which provides better support for App Engine's urlfetch API in urllib3, opening the gate for [requests to support App Engine again](https://toolbelt.readthedocs.org/en/latest/adapters.html#appengineadapter). Huge thanks to [@shazow](https://github.com/shazow) for being so helpful in reviewing and getting that merged.

## oauth2client

I helped out a bit on Google's [oauth2client](https://github.com/google/oauth2client) by writing a [Flask extension for authorization](http://oauth2client.readthedocs.org/en/latest/source/oauth2client.contrib.flask_util.html), re-organizing  modules, and helping out with unit testing. There's still much to do here, but it's been incredible progress over the last year. Huge shoutout to the other contributors who've pushed this project forward: [Danny Hermes](https://github.com/dhermes), [Nathaniel Manista](https://github.com/nathanielmanistaatgoogle), and [Bill Prin](https://github.com/waprin).
