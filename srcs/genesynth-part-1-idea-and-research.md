---
title: "Genesynth part 1: idea and research"
date: 2018-06-19
legacy_url: yes
---

> **Note*: Unlike my typical posts, this is a multi-parter and will ramble on for some time. Eventually, I'll post a final summary post of the synthesizer. If this bores you, wait a few months for that post instead. :)*


I *love* the Sega Genesis (or Mega Drive for non-North American folks). It was one of the first consoles I ever had the opportunity to play and my earliest memories of gaming consist of *Sonic the Hedgehog 2*. I spent countless hours playing *Quackshot*. This console is the reason I fell in love with video games and technology.

## The magic chip in the Sega Genesis

The Genesis hardware is quite amazing- I could go on about it forever- but I want to talk about one part of it in particular: the sound hardware.

You see, the Genesis's sound hardware was relatively unique and also one last of its kind. Consoles leading up and including the Genesis were incapable of *audio playback*, something we've mostly taken for granted in the era of abundant storage and sophisticated digital audio. To overcome this limitation older consoles would use a separate, dedicated sound chip to produce sounds. These consoles typically used relatively simple square wave generators or [Programmable Sound Generators](https://en.wikipedia.org/wiki/Programmable_sound_generator) (PSGs). These chips were basically just told what frequency to generate square waves at and the duration. This allowed the main CPU to provide a soundtrack without having to constantly waste cycles toggling pins to generate sound waves. You can hear this characteristic sound in the games created for the *Nintendo Entertainment System* and the *Gameboy*, like this iconic track from *Super Mario Brothers*:

<iframe width="560" height="315" src="https://www.youtube.com/embed/wGX4obVl64w" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>

The Genesis took this to the next level. It had a 3-channel PSG for funsies, but the real star of the show was a full-blown FM synthesizer chip created by Yamaha: the [YM2612](https://en.wikipedia.org/wiki/Yamaha_YM2612). In the 80's, FM synthesis was all of the rage with the Yamaha DX7 being one of the most notable examples. Without a doubt you've heard this synthesizer before even if you don't know it by name. If you want to know more about FM synthesis and the history of the DX7, I recommend this amazing video from Polyphonic:

<iframe width="560" height="315" src="https://www.youtube.com/embed/Q1Ha0MMT0aA" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>

This chip allowed the Genesis to provide soundtracks for games unlike any other console. It gave a voice to the some of the most incredible video game soundtracks, such as *Sonic 3 & Knuckles*:

<iframe width="560" height="315" src="https://www.youtube.com/embed/_T7hdIh-gtw" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>

Even though this sound hardware was *amazing*, it was doomed to be obsoleted. While this chip could produce an incredible range of sounds it was difficult to program for. In fact, Sega had to go [above and beyond](https://www.youtube.com/watch?v=WEvnZRCW_qc) to help developers program audio. Hardware FM synthesis chips had their days numbered as soon as *samplers* were feasible to include in consoles. Nintendo's answer to the Genesis, The Super Nintendo, did just this. It opted to include a [full sampler chip](https://en.wikipedia.org/wiki/Nintendo_S-SMP) as its audio engine. While the Genesis required tweaking and careful programming to achieve the desired sound (if it were even possible), the Super Nintendo allowed audio engineers to simple load samples of exactly the sound they wanted to hear. Hardware samplers were short-lived as well - with the launch of the PlayStation games could finally do audio playback and hardware sound chips were quickly forgotten.

## A (terrible) idea is born

The Genesis happened at *just* the right time for this sort of audio engine to work. The limitations of the hardware sometimes bred creativity in the most wonderful ways. I love the sounds that come out of this thing. So, I had an idea.

> I'm going to build a hardware synthesizer using the same chips as the Sega Genesis.

Anyone who knows me knows I love two things: [Synthesizers and cute girls](https://www.youtube.com/watch?v=DJ2LUrXxa1o). I *had* to build this. I've been toying around with building a synthesizer for the last year or so but I just couldn't find enough inspiration. I found it.

To be clear - this is terrible idea. If you just want to make music that *sounds* like the Genesis there are **tons** of VSTs that do this without fussy hardware. One excellent one is the [FMDrive](http://www.alyjameslab.com/alyjameslabfmdrive.html).

So on a whim I ordered a handful of YM2612 chips from our pals in China and started doing some research while I waited for them to cross the Pacific.

## Research

I am absolutely not the first person to try this. Not by a long shot. However, I'm super surprised at how little documentation there is around the YM2612 and just sound programming for the Genesis in general. I was able to source several references that were really useful for *emulation*, but not so much for hardware interfacing. I was able to find several [VGM](https://en.wikipedia.org/wiki/VGM_(file_format)) players that proved useful for verifying my hardware setup but weren't as helpful for implementing MIDI control.

Here's some helpful resources I found and what I was able to use them to discover:

1. Maxim's World of Stuff has [a good transcription](http://www.smspower.org/maxim/Documents/YM2612) of some official Sega documentation on the 2612. This documentation is indispensable for knowing the registers available and also provided me with an excellent barebones test program.
2. Aidan Lawrence has made a great [Teensy-based VGM player](http://www.aidanlawrence.com/hardware-sega-genesis-video-game-music-player-2-0/). Since I'm also using the Teensy for my Synth, their source code and project documentation was incredibly valuable for getting things up and running. They were also incredibly helpful on GitHub when I asked about timing (you rock, Aidan).
3. Aidan also provided me with the original [Japanese YM3438 Manual](/files/YM3438_APL.pdf) which has so far proven really helpful for figuring out timings and frequency calculations. The YM3438 is the CMOS equivalent of the YM2612, so it's super helpful to have this reference.
4. The MIDIBox project has a [Genesis module](http://www.midibox.org/dokuwiki/doku.php?id=mbhp_genesis) whose designs and source code have been somewhat helpful in figuring things out. I find this code really difficult to follow (due to my own shortcomings as a C programmer) but I've been able to extract some useful stuff here so far and I'm sure I'll find even more.
5. Right now I'm using the [Mega Amp](http://www.sega-16.com/forum/showthread.php?26568-Introducing-the-Mega-Amp-The-universal-Genesis-audio-circuit) circuit as my output amplifier.

## Next time

On the next part, I'll go into my first experiments with the YM2612 and share some experiences I had with that phase. :)
