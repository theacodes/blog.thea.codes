---
title: "Genesynth: A Sega Genesis-inspired synthesizer"
date: 2019-01-22
legacy_url: yes
description: An open-source, MIDI-controlled hardware synthesizer using the YM2612 chip.
preview_image: genesynth-promo.jpg
preview_image_alt: A picture of a hardware synthesizer
---

My largest side project over the last year has been the *Genesynth* - an open-source hardware synthesizer inspired by the Sega Genesis / Mega Drive. It started with a [crazy idea](../genesynth-part-1-idea-and-research) and amazingly ended up with a functional, incredible sounding synthesizer.

![YM2612 Registers](../static/genesynth-promo.jpg)

While I'm not *totally* done with the project, it's close enough for me to really share it with the world. This post introduces you to this synthesizer and how I built it. Feedback is always welcome, and I would especially love to know which technical details you'd like me to go into in future blog posts.


## The inspiration

As noted in my first [build log](../genesynth-part-1-idea-and-research) about the Genesynth, I grew up listening to Sega Genesis music and it left a permanent impression on me. The Genesis was one of the last consoles to feature a synthesizer chip instead of the samplers and CD playback that later consoles would adopt. It used an (at the time) relatively advanced FM synthesizer chip from Yamaha, the [YM2612](https://en.wikipedia.org/wiki/Yamaha_YM2612). The Genesis gave us some of the most iconic game soundtracks, and they were all brought to life using this chip's distinct voice.

<iframe width="560" height="315" src="https://www.youtube.com/embed/_T7hdIh-gtw" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>

For these reasons, I set out to re-create this sound in a hardware synthesizer.


## The modern-day recreation of Genesis sound

<iframe width="100%" height="300" scrolling="no" frameborder="no" allow="autoplay" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/646940496&color=%23433b38&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true"></iframe>

The Genesynth uses the same YM2612 6 voice FM synthesis chip as the one used for the Sega Genesis. A [Teensy 3.5](https://www.pjrc.com/store/teensy35.html) interfaces between the chip and MIDI-over-USB providing real-time control of all of the chip's parameters, patch loading, and various polyphony modes.

The synth features a [high-quality audio amplifier](../genesynth-part-3-proper-audio) that far exceeds the original Genesis version while retaining the same filter roll-off. This means that you can *hear* the chip's 9-bit DAC's distortion, or the so-called ["ladder effect"](http://alyjameslab.blogspot.com/2013/06/ym2612-ladder-effect-suite.html) quite clearly, such as during the long sustain parts in these clips:

<iframe width="100%" height="300" scrolling="no" frameborder="no" allow="autoplay" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/558684303%3Fsecret_token%3Ds-ywqmF&color=%23433b38&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true"></iframe>

<iframe width="100%" height="300" scrolling="no" frameborder="no" allow="autoplay" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/524990358%3Fsecret_token%3Ds-vg1gD&color=%23433b38&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true"></iframe>

Because all of the parameters are exposed over MIDI you can build things like [Ctrlr](http://ctrlr.org/) panels to control the parameters in real-time:

![Ctrlr panel](../static/genesynth-ctrlr-panel.png)

<blockquote class="twitter-tweet" data-lang="en"><p lang="en" dir="ltr">Because I&#39;m super bored tonight here&#39;s some more synth noodling.<br><br>I&#39;ve got basically all of the parameters exposed to Ableton now. :)<br><br>The envelopes on this thing are actually quite usable once you get the hang of it. Some super fun sounds can happen with envelopes + unison. <a href="https://t.co/dKdxrvlUK2">pic.twitter.com/dKdxrvlUK2</a></p>&mdash; Thea Flowers 🌺 (@theavalkyrie) <a href="https://twitter.com/theavalkyrie/status/1086522285651947520?ref_src=twsrc%5Etfw">January 19, 2019</a></blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

## Creating the Genesynth

Creating this project took weeks of research, months of iteration, and nearly a year of programming. This is the *first* synthesizer I've ever built, and my first *real* hardware project. I even learned how to make PCBs for this project! There were so many difficult areas and times that I felt like abandoning it but every breakthrough meant I got to hear more cool sounds come out of these magic rocks. This positive feedback loop kept me encouraged to continue the project.

My original version of the hardware was created on breadboards and had no MIDI functionality, just VGM playback:

![First Genesynth](../static/genesynth-breadboard.jpg)

It eventually moved to more permanent protoboards:

![Second Genesynth](../static/genesynth-protoboard.jpg)

And then finally, in order to have the [best possible audio quality](../genesynth-part-4-cleaning-up-the-noise-in-synth-audio-amplifier), I ended up creating custom PCBs:

![Genesynth PCBs](../static/genesynth-pcbs.jpg)

And just last week I finally placed everything into a laser-cut acrylic case:

![Genesynth in its case](../static/genesynth-case.jpg)

The software went through several iterations as well. As mentioned, it initially just had VGM playback - as there was a lot of prior art I could draw from there. Eventually, once I was able to verify my timing and hardware was functioning, I began implementing patch loading and MIDI functionality. Finally, I started coding a simple user interface for loading patches and displaying parameter states when being controlled over midi.

<blockquote class="twitter-tweet" data-lang="en"><p lang="en" dir="ltr">It now shows the FM algorithm used by the current patch!<br><br>(This was a lot of code to do. Basically manually drawing all these little graphs) <a href="https://t.co/Nj9GdJz9y3">https://t.co/Nj9GdJz9y3</a> <a href="https://t.co/0OnhmCOqrk">pic.twitter.com/0OnhmCOqrk</a></p>&mdash; Thea Flowers 🌺 (@theavalkyrie) <a href="https://twitter.com/theavalkyrie/status/1052809544479342592?ref_src=twsrc%5Etfw">October 18, 2018</a></blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

## Creating your own

Genesynth is open-source hardware. Everything I put into creating this is available on my GitHub at https://github.com/theacodes/genesynth. I would *love* to see other people build these and I would *love* feedback if you do.

If you're more interested in just buying one, I wouldn't recommend offering me money to build an incomplete side project for you - I would recommend [the DAFM synthesizer](https://www.tindie.com/products/Kasser/dafm-synth-genesis-ym2612-ym3438/) instead.

## Read more

I've written other blog posts about the build process:

* [Idea & Research](../genesynth-part-1-idea-and-research)
* [Basic Communication](../genesynth-part-2-basic-communication)
* [Proper Audio](../genesynth-part-3-proper-audio)
* [PCBs and Noise Elimination](../genesynth-part-4-cleaning-up-the-noise-in-synth-audio-amplifier)

There's also a big [Twitter Moment](https://twitter.com/i/moments/1016762308553371648) that collects all of my Tweets about this project. Finally, there's a [post on /r/synthdiy](https://www.reddit.com/r/synthdiy/comments/ahtl2r/yall_seemed_to_like_my_sega_genesis_inspired/).

## Thanks

I would like to specifically thank the follow people for their help and encouragement during this project:

* [Gus Class](https://gusclass.com/) for reviewing this post and always being enthusiastic about this project.
* [Aidan Lawrence](https://www.aidanlawrence.com/) who's previous work in this area was invaluable to me, but they also went out of their way to answer questions and provide me with translations of Japanese documentation.
* The pseudonymous creators of the [Mega Amp](http://www.sega-16.com/forum/showthread.php?26568-Introducing-the-Mega-Amp-The-universal-Genesis-audio-circuit) mod for the Sega Genesis.
* Maxim's World of Stuff has the most complete [documentation on the YM2612](http://www.smspower.org/maxim/Documents/YM2612) and none of this would've been possible without it.
* Aly James' [FMDrive](http://www.alyjameslab.com/alyjameslabfmdrive.html) provided the basis for patch saving and loading.
* The /r/synthdiy and /r/askelectronics communities on Reddit. Both were helpful and encouraging during this process.
