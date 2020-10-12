---
title: We need to talk about GitHub
date: 2020-10-12
legacy_url: yes
description: How hosting monoculture is harming us and what we can do about it.
---

Have a seat and make yourself comfortable, we're gonna talk about GitHub. Yes, GitHub. And I'm not referring to the ICE Contract, the performative activism, the fleeing of their women senior engineers, or the other [litany of accusations](https://en.wikipedia.org/wiki/GitHub#Controversies) against the company. I want to talk about the *idea* of GitHub.

And for that matter - I want to talk about the idea of [SourceForge](https://en.wikipedia.org/wiki/SourceForge), [Google Code](https://en.wikipedia.org/wiki/Google_Developers#Google_Code), [BitBucket](https://en.wikipedia.org/wiki/Bitbucket), [GitLab](https://en.wikipedia.org/wiki/GitLab), etc. The entire concept of a single, centralized project & repository hosting service is *fundamentally* at odds with the health and longevity of the open source community.

## How we got here

Back in the early days of open source software we distributed source code and patches as archives (zips/tars/etc) through email and mailing lists. Of course, this was a bit cumbersome, however, it did benefit from the distributed nature of email. When you released your code to a mailing list your code was now replicated and shared to everyone subscribing to that list. They also had an *irrevocable* copy - that is, you couldn't do any [take-backsies](https://www.theregister.com/2016/03/23/npm_left_pad_chaos/).

Later we developed version control systems - things like [Subversion](https://en.wikipedia.org/wiki/Apache_Subversion). Subversion and its contemporaries helped with the cumbersome nature of code and patch distribution but allowing folks to access the repository over the network - so all you needed was the address (and sometimes a username/password) and you could access the code *and* its history.

However, Subversion and similar *centralized* repositories brought along new problems. You couldn't just zip up your code and send it off - you needed to *host* your repository (of course, you could still zip up the current state, but in practice that only happened during releases at best). In the early days lots of people hosted their own subversion servers, heck, even I did!

We eventually saw the rise of services to host our code - which we'll get into in just a second.

Then came the distributed version control system "revolution". Git, Mercurial, Fossil, Bazaar, and other popped up around 2005 to help solve the problems of having many developers working on the same project. Thanks in part to its origin in the Linux kernel and support from hosting services like Google Code, BitBucket, and GitHub, Git became the dominant version control system today. In StackOverflow's 2018 survey [87% of respondents use git](https://insights.stackoverflow.com/survey/2018#work-_-version-control) (this was the last year they asked this question).

We migrated out code from archives, to Subversion and friends, to Git, Mercurial and friends, and finally settled on Git as the *de facto* standard.


## Hosting - the cause of and solution to our problems

Version control systems gave us a lot of quality of life features but left us with an enormous problem - hosting.

Hosting was bothersome. You had to set up a server and make sure the server stayed up otherwise folks couldn't get to your code! You had to deal with access control and other administrivia. So much tiresome toil.

This is a problem that corporations were *quick* to offer solutions for. They came to us with an appealing offer: give us your code and we'll host it for free. After all, being the primary host for the world's software is an advantageous position. They could offer premium services for power users and businesses and leverage the goodwill of the open source community to score those deals. These companies are not hosting our software out of goodwill, they are hosting it so that they may take advantage of and extract capital from our work.

So throughout the history of open source we have a pattern of putting all of our eggs in one or two baskets. But eventually a company needs to make money - so they start boiling the eggs in the basket. SourceForge infamously started distributing adware and malware. Google Code shuttered its doors but was kind enough to provide a read-only archive. BitBucket removed Mercurial support. And so on and so forth.

When the eggs get hot we quickly move them to the next basket. Rinse, repeat.

So GitHub comes along, gains critical mass, and nearly all of us put our eggs in that basket - StackOverflow's 2020 survey showed that [82% of respondents use GitHub](https://insights.stackoverflow.com/survey/2020#technology-collaboration-tools).

If open source is a garden then we keep planting ourselves in sand and hoping the tide never comes in.


## The hosting monoculture

So now we find ourselves in a pickle. GitHub is so dominant in open source that other hosts might as well close up shop. But GitHub is not perfect. It's *not* open source, it's not managed by an independent foundation, and it does not have any obligation at all to serve the interests of open source communities. Its inaction has forced developers into collective bargaining strategies such as petitions ([Dear GitHub](https://github.com/dear-github/dear-github), [Dear GitHub 2.0](https://github.com/drop-ice/dear-github-2.0)) and a [community-run bug tracker](https://github.com/isaacs/github/issues) since GitHub doesn't have a public one.

The problem is that we can't bargain if we don't have any leverage. GitHub is now so dominant that we have a **hosting monoculture**. It would take an incomprehensible amount of us to convince them to do something that they don't want to do. We can't threaten to leave because where would we go? Not to mention that GitHub is now effectively our resumes and references.


## A hosting polyculture

So this is all doom and gloom, right? Well, no, we can fix this.

It's clear that expecting every developer to host their own repositories isn't scalable and also creates an enormous barrier to entry. It's also clear that the business of trying to host the world's code for free isn't sustainable without extracting capital *somehow*.

So how about a middle ground? A **hosting polyculture** could be a possible solution.

What does this mean practically? Well, it means we as a community collectively create hosts and federate our repositories across each other. This is the [Mastodon](https://en.wikipedia.org/wiki/Mastodon_(software)) idea applied to the problem of source code and project hosting. This is the realization of the idea behind *distributed* version control systems.

Let me illustrate. Imagine you're primarily a Python developer. Instead of publishing your code to GitHub, you instead sign up for an account on a Python community instance - run by the Python Software Foundation and funded through donations. You'd get an account like `stargirl@code.python.org`. You'd get some allotment of space in the community instance to keep things fair. You'd be able to publish your code and others would be able to look at it, clone it, file bugs, and send pull requests to `code.python.org/stargirl/my-project`.

Because of the federation, users on other instances can subscribe to your repository and have it mirrored over to their instance. They could then access the code even if your instance is unavailable. You can subscribe back so you can share project information like bugs and pull requests between instances.

You and the instance administrators would have the power to create your own codes of conduct, rules, privacy and security, etc. You can grant and limit access to people and instances as you choose.

Each open source community can have their own instance that they own, operate, and govern with features, rules, and structures that best suit their community. Imagine the fediverse of hosts organized around topics and communities - Node.js, data science, Ruby on Rails, Kubernetes, CircuitPython, Indie game development, etc.

Users can migrate to other instances any time. Businesses can run their own instances or pay for a hosting service. They have the choice without missing out on key features or being locked into a single vendor.

A federated polyculture of hosts would free our code from corporate hands and put our communities back in control.

## Open source is social capital

Open source represents the collective work on millions of individuals. It is social capital that should benefit the open source community first and foremost.

I believe that open source should be collectively owned. We, as a community, should directly own and control the publishing and collaboration tools and platforms that we depend on.

## How do we build it?

We already have the underlying technologies - distributed version control systems (such as Git, Mercurial, Fossil), federation protocols (such as [ActivityPub](https://en.wikipedia.org/wiki/ActivityPub)), distributed file systems (like [IPFS](https://en.wikipedia.org/wiki/InterPlanetary_File_System)).

We would need a collective effort to combine these technologies to produce a distributed, federated project hosting platform. This is no small task and it would take real investment to make it happen.

The best possible way that I could imagine this happening is if a major open source foundation provides funds to support the development of this. Even better if *multiple* foundations collaborate on this. We would then need a major open source community like Python, Node.js, Go, Ruby, etc. to collectively adopt the platform.

We could help the platform win adoption by adding federation support to and from GitHub - so people can easily start using this platform without immediately giving up GitHub.


## Hypocrisy

A confession - I am a hypocrite. I am clearly a big user of GitHub. I extensively use it for hosting my projects. I'm a member of ten or so organizations. I have a GitHub sponsors profile. I even use GitHub Pages to host the blog you're reading right now.

I am contributing to the monoculture but I would really, really love to see an alternative to hoping between corporations and hoping they play nice with our code.