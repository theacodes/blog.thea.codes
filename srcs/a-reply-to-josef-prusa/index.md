---
title: A reply to Josef Průša
date: 2023-03-30
description: On the state of open source 3D printing in 2023
---

Yesterday, Prusa Research announced their latest 3D printer: the [Original Prusa MK4](https://blog.prusa3d.com/announcing-original-prusa-mk4_76585/), a fantastic follow-up to the award winning MK3 which is a favorite among hobbyists and professionals alike. At the same time, founder Josef Průša shared [a post](https://blog.prusa3d.com/the-state-of-open-source-in-3d-printing-in-2023_76659/) lamenting the state of open source hardware in 2023. Josef shares his experience over the last ten years with open hardware and his frustrations around the lack of reciprocity among fellow 3D printer manufacturers. At the end, Josef shares that he's chosen not to open source the electronics for the MK4 *yet*[^not-open-source] and calls for the establishment and adoption of a new, highly restrictive license.

Josef adds that he wants to have a conversation, so this post is my reply. I deeply respect Josef, his company, and all of the work they've done within the open source community, but I disagree with him on this matter. The rest of the post is **opinion** and it's given from someone with a different perspective- I fully expect many people to disagree with both me and Josef! I welcome feedback, but please treat me, Josef, and each other with respect. For what it's worth, I own a Prusa MINI+ and I plan on buying the MK4 when kits are available.

[^not-open-source]: Which, if you'll allow me to be a pedantic asshole for a nanosecond, quite literally makes it **not** open source despite all of the pontificating on the product page. It's open source when the source is open, not when you pinky promise to open source it. Just sayin'.

## Where we agree

First, I want to get out of the way some things that I completely or mostly agree with. Josef's first key item is in regards to the [GPL](https://www.gnu.org/licenses/gpl-3.0.en.html):

> The standard GNU GPL license under which our printers and software are available is very vague, written in a complicated way, and open to various interpretations. It was developed by academics for academic purposes. The 3D printing community has begun to use it for hardware for which it is not entirely suitable. A violation of this license can be enforced under copyright law, but these regulations differ in each country, and potential disputes can be long and expensive.

I agree. The GPL was made for software has no business being applied to hardware[^linking]. We have much, much better licenses made specifically for open hardware including the [CERN Open Hardware License](https://cern-ohl.web.cern.ch/) (which has strongly reciprocal, weakly reciprocal, and permissive variants), the permissive [Solderpad License](http://solderpad.org/licenses/), and the choose-your-own-adventure [Creative Commons Licenses](https://creativecommons.org/).

Next, I agree with Josef that recognition, attribution, and resources are not adequately given to open source authors:

> Devices or software manufacturers who use open source do not give enough credit to the original authors. In their welcome screens, readme files, or websites, you will often find no information about the origins of the product.

There is absolutely a need to talk about how to properly recognize and compensate open source contributors, however, that isn't ultimately what Josef's post attempts to address.

[^linking]: Like how the hell do you even parse the GPL's static vs dynamic linking nonsense with physical goods? Am I allowed to screw things together but not glue them? Ha!

## Josef's central frustration

To grossly distill Josef's post down to one central frustration, it's **reciprocity**. Josef is unsatisfied with the questionably ethical behavior of organizations that benefit from open hardware but do not meaningfully contribute back. This includes activities that are intentionally exploitative such producing 1:1 clones of open hardware with minimal changes[^dick-move] as well as actions that could be unintentionally harmful such as failing to give proper attribution on derivative works. Even in cases where things could be ascribed to ignorance instead of malace, companies often require pressure from the community to comply legally and ethically with open source.

I deeply understand and share this frustration. The spirit of open source is cooperation, coexistence, and shared success. It can feel maddening when someone takes advantage of the goodwill of a community and gives nothing back - like someone building a house in the middle of a public park. However, I don't share the same outlook on this situation: I don't believe that everyone who benefits from open source needs to reciprocate. Furthermore, I don't believe that licensing can save any of us from these issues.

[^dick-move]: In bird culture, this is largely considered a dick move.

## Attack of the clones

I get the sense that Josef, like many of us that make open hardware, is annoyed by *clones*. You can go to your favorite dirt cheap, questionably sourced retailer right now and find dozens of clones of Prusa hardware - some passable, some terrible, some great. You can also find a thriving ecosystem of low-cost derivatives like the [Ender series](https://www.creality.com/products/ender-3-3d-printer). In many cases, if not most cases, these clones and derivatives contribute basically nothing back to the original project and, at the surface, appear to add dubious value to the ecosystem as a whole.

The prevalance of clones can feel something like a parasitic relationship where we publish our blueprints for the benefit of everyone but we feel like it's really on benefiting these specific companies. We have the same problem over here in the music technology world, where [one asshole](https://www.musicradar.com/news/uli-behringer-tackles-the-haters-head-on) with a [big factory](https://en.wikipedia.org/wiki/Behringer) is cloning and undercutting [every](https://www.gearnews.com/behringer-clones-arturias-keystep-with-swing-midi-cv-controller-and-sequencer/) [popular](https://synthanatomy.com/2023/03/behringer-edge-analog-percussive-sythesizer-the-drummer-from-the-cloned-mother.html) [product](https://synthanatomy.com/2018/06/the-behringer-file-clones-midifan-com-forum-discussions-lawsuit-my-opinion-on-this-topic.html) he can, including those by [small open hardware designers](https://synthanatomy.com/2021/06/behringer-brains-macro-oscllator-with-15-mutable-instruments-plaits-algorithms.html).

But, despite Behringer (the person) being an objective dingus, it isn't as easy to outright condemn Behringer (the company). There is an argument to be made that they are making many pieces of music gear more accessible since Behringer products tend to be priced far less than their "inspirations" or clones of out of production hardware. They've also made some truly original products and they're one of literally two or three companies still manufacturing [vintage analog chips](https://www.coolaudio.com/) which are used across the industry.

And look beyond Behringer: the guitar world is [lousy with clones and variations of the Fender Stratocaster](https://jclemence.medium.com/the-short-history-of-stratocaster-copies-8365a493c406) leading to actual improvements like the [Superstrat](https://en.wikipedia.org/wiki/Superstrat) and DIY interpretations called "Partscasters".

So it's not quite cut and dry. There are cases where clones can actually contribute to ecosystems in unexpected ways. There are cases where companies start with clones and then adapt the product to suit some specific constraints. There are situations where proliferation is, in itself, contributing back to the project despite not seeing a direct, reciprocal contribution.

## The law will not save you

All of this is to say that **open source has absolutely nothing to do with being cloned**. Open source licenses will not save you, copyright won't save you[^us-copyright], patents will not save you: **if you have a successful product it will get cloned**. This is inevitable and trying to prevent it is a waste of your resources. Not even the almighty Apple can prevent the [mass](https://www.tomsguide.com/round-up/best-fake-airpods) [cloning](https://www.reddit.com/r/AirReps/comments/vrbms4/ultimate_guide_to_airpods_clones_202223/) of the AirPods.

You can't prevent clones but can change how you relate to them. You don't have to see your ecosystem, which includes clones and derivatives, as the enemy. Remember that you are leading the conversation, you are in control of the direction- the clones are followers not interlopers. The Fender Stratocaster is an icon in part because of its proliferation across companies meant that an entire ecosystem of custom parts, modifications, repair shops, and even innovative new designs could flourish. Prusa's MK2 / MK3 are iconic for the same reason - their proliferation has caused all of the parts involved in creating, repairing, and improving on Prusa's designs and its derivatives to be far more accessible and available.

Look at some open hardware contemporaries: the Arduino has been cloned so many times in so many different ways, yet, it's a success. In fact, it's a success **because** it's been cloned. Arduino lead the conversation by innovating experience, standards, and interoperability. Arduino literally opened their platform to competitors and flourished.

Open hardware succeeds through continuous evolution and innovation alongside its community and ecosystem.

This is a vastly different perspective on clones and copycats compared to the prevailing adversarial sentiment. While some of these companies are truly parasites who aren't contributing to the conversation at all, many are just eager to participate in a way we aren't expecting. We can't expect every member of our ecosystem to come to the table with the same intentions, skills, and desires as us. Some of us are here to develop the recipes while others are here to cook. Some of us advance the state of the art, some of us bring that into the hands of consumers. The hard part is figuring out how to make sure everyone is fed.

[^us-copyright]: Fun fact, in the United States, circuit boards are explicitly *not* covered by copyright. Ironically, this is the one piece of the MK4 that Prusa has yet to release the source to.

## Your product is not your product

There was one part of Josef's post that bounced around my head like a laser beam in a mirror maze:

> But community development isn’t the main reason why we offer our products as open source.

Allow me a moment to be somehow more opinionated and snarky than usual: I am absolutely gobsmacked by this statement. I would've thought that a company run by someone who literally slaps their name on everything[^oh-god-why] would understand that they aren't selling printers - they're selling a **brand**.

How do you sell an abstract concept like a "open source" brand? Your brand is the combination of your principles, goals, and ideals reified through leadership. You don't actually sell a brand, you build a community with people who believe in you and share your goals. Your physical goods are a byproduct, a means to an end that exist only to empower the community and further its goals. *Adoption* is your key metric, not *revenue*.

[^oh-god-why]: To the point where I'm literally slicing my model in PrusaSlicer, storing the gcode on a Prusa Research-branded flash drive, printing it on an Original Prusa MINI+ using Prusament. [It's Marc Jacobs but 3D printing](https://twitter.com/theavalkyrie/status/1467222722518396934). Thank god they changed the name of their design sharing site, PrusaPrinters, to [Printables](https://printables.com).

## Empowerment

This brings me to my key response to Josef:

**Please reconsider and choose to empower your community instead of punishing your ecosystem.**

Your proposed license would only harm individuals and have little to no effect on the companies you seek to hurt. I believe Prusa has succeeded because of its community, not because of its printers. The MK4 is a culmination and combination of both Prusa's innovation and tons of feedback from the community.

I would love to see Prusa go in the *opposite* direction- to be more open and more engaged with its community. Prusa does not currently develop its hardware in the open, instead, it develops its hardware privately and then publishes a read-only copy of the source files[^transparency]. This is in contrast to other open hardware projects, like the [LumenPnP](https://opulo.io), where the hardware is designed alongside the community. Prusa's approach is a one-sided conversation and it doesn't have to be like that.

I believe that Prusa has incredible potential to empower its community to **collectively** accomplish the goal of creating reliable, affordable, repairable, upgradeable 3D printers. I believe that Prusa can work *with* the ecosystem that has formed around their designs. I believe this because I believe that this is how open hardware succeeds- it's my opinion that the entire point of open hardware, software, and design is **empowerment** and that empowerment does not have caveats.

[^transparency]: Although I do really appreciate Prusa's recent transparency around the XL.
