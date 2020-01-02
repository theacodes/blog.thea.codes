---
title: "Thoughts on #CircuitPython2020"
date: 2020-01-02
legacy_url: yes
description: Things I'd like to see from CircuitPython.
---

Since I switched over to the [Flutter](https://flutter.dev) team at Google in 2019, I've shifted my programming outside of work to focus on CircuitPython rather than Python. In the last half of 2019, I started creating CircuitPython libraries (like [VoltageIO](https://github.com/theacodes/Winterbloom_VoltageIO) and [SmolMIDI](https://github.com/theacodes/Winterbloom_SmolMIDI)), contributing to CircuitPython itself, and even creating my [own board](../lessons-learned-from-building-a-circuitpython-board).

Adafruit has [asked the community](https://blog.adafruit.com/2020/01/01/what-do-you-want-from-circuitpython-in-2020-circuitpython2020-circuitpython/) where we'd like to see CircuitPython go in 2020. Here's (some of) my thoughts on the subject.


## Projects I'd like to build

My main goal for 2020 is to finish and start selling my first CircuitPython-based product, Winterbloom Sol. It's a module for the [Eurorack]() modular synthesizer format that handles translation from USB MIDI to control voltage and gate. It's unique compared to similar products in that it's easily customizable and re-programmable thanks to CircuitPython. It's my plan to have these ready to ship in March.

![](../static/sol.jpeg)

Beyond that I hope to start designing two more Eurorack modules using CircuitPython as the brain. I would also like to start designing a standalone synthesizer using CircuitPython - perhaps, even, a follow-up to the [Genesynth](../genesynth-a-sega-genesis-inspired-synthesizer).

## Things I think could be easier

Debugging. While pulling up the serial console and grabbing a traceback or interacting with the REPL is second nature to me since I've been programming most of my life, it's not the most straightforward things for newcomers. Mu helps a lot here, but it requires you to install something. [WebUSB](https://wicg.github.io/webusb/), [WebSerial](https://github.com/WICG/serial/wiki), or even [BLE](https://en.wikipedia.org/wiki/Bluetooth_Low_Energy) could be used to help users debug their code without installing *anything* on their device, and do so from machines where installing stuff isn't feasible (like Chromebooks).

I would love for an easier route to writing C extensions that doesn't involve a custom build of CircuitPython. As I start building more and more synthesizers with CircuitPython, my need to write C modules specific to that synth grows, and I don't necessarily want to have to fork CircuitPython or commit that board-specific code upstream.

Installing updates and packages. I have lots of thoughts about this and they're covered below.


## Core CPython libraries to add

Making an optimized [`colorsys`](https://docs.python.org/3/library/colorsys.html) available would be excellent. Lots of people do projects with shiny LEDs and being able to translate between color systems easily and quickly is super important.

[Dataclasses](https://docs.python.org/3/library/dataclasses.html#dataclasses.dataclass) would be excellent, especially if they have typing support.

f-string support would be lovely.


## Additional microcontroller platforms

I would love to see support for the [i.MX RT](https://www.nxp.com/products/processors-and-microcontrollers/arm-microcontrollers/i.mx-rt-series:IMX-RT-SERIES) line which is used in the [Teensy 4.0](https://www.pjrc.com/store/teensy40.html). They are ridiculously fast and have lots of RAM. It seems [Arturo is already working on this](https://www.hackster.io/news/the-i-mx-rt-family-makes-for-some-feature-filled-feathers-1210a63f8ef7). :)


## Library improvements - package management

CircuitPython's package management story right now is extremely basic- both from a library publishers and consumer standpoint. The workflow for publishers is to publish a `.py` file (for single file modules) or a `.zip` (for packages) an optionally compile to `.mpy` using `mpy-cross`. For consumers, it's a strategy of downloading this file/zip manually and placing it in `CIRCUITPY/lib`. It's difficult to know what can be upgraded and how to go find the latest version. It's hard for tutorials and samples to be reproducible.

Having spent *so much* time working in the Python packaging ecosystem I think that CircuitPython is uniquely positioned to present a new answer to the question of how to manage packages. I **do not** think that CircuitPython should adopt pip, conda or any other purely command-line focused package management solution. I think that as a community we should work to build something that can serve our use case better - something that's easy to use for someone who has never even heard of a command line.

I have so many thoughts on this. I would really love to find the time to seriously work on a comprehensive packaging experience for CircuitPython. I've written up some thoughts privately, if you're really interested and enthusiastic about this, please feel free to contact me.


## Documentation improvements

My biggest personal frustration with CircuitPython documentation is that it's often hard for me to find links to the API reference docs on readthedocs. I'd love to see the guides link into readthedocs when they mention modules and classes.


## In closing

I love CircuitPython. The community that we've built around Python-on-hardware is absolutely amazing and it's been one of the most rewarding interactions I've had with any technical community in my life. I really, really want to see this community continue to grow and become a significant part of the Python ecosystem - right alongside web development, data science, and system administration.
