---
title: "The tools and tech I use to run a one-woman hardware company"
date: 2021-05-16
legacy_url: yes
description: A look into the tech and tools used by Winterbloom
---

[Winterbloom](https://winterbloom.com) is a boutique, open-source synthesizer company and it has exactly **one** engineer - me. I am responsible for everything - from the hardware design, to the firmware, to the documentation, and everything else! Because this is a ton of work I've had to be very deliberate with the tools and tech that I use.

This article is a look into our current tech stack one year in and some ideas I have for the future. I'll go from the microcontrollers, the firmware, and all the way up to user guide. I hope this is helpful, but if you want more details about something or if something doesn't make sense, feel free to [reach out](mailto:me@thea.codes).


## Overall philosophy

A one-woman company requires a *far* different approach than any sort of company with more than one engineer. As I go through this tech stack, remember that these choices and decisions are made with that context in mind- they probably won't hold up as well when taken out of that context!

> "Lateral thinking with withered technology"
> - [Gunpei Yokoi](https://en.wikipedia.org/wiki/Gunpei_Yokoi)

The quote above is something that really resonates with my philosophy: I'm not trying to chase the state-of-the-art, I'm trying to use well-understood tools and technology to accomplish my goals. While I've used a relatively broad set of languages, tools, and frameworks throughout my career, with Winterbloom I try to leverage stuff that I feel "fluent" in as much as possible.

I'm also keenly aware of the impact of creating physical devices. I don't want to just create more e-waste. I want to create things that can truly be owned, repaired, re-used, and re-purposed for as long as possible. I hold in my mind that there is a real moral argument that could be made against creating new hardware *at all*[^morality], so as I bring precious materials together into new forms I really try to weigh the long-term impact of my creations. This is another reason I choose "withered" technology - it is more easily understood and maintained by others.

While this philsophy can lead to choosing solutions that aren't "perfect", I try to pick the best tool for the job that works for me *right now* and gives my creations a fair shot at longevity.

[^morality]: See [permacomputing](http://viznut.fi/texts-en/permacomputing.html), some strong thoughts by *Viznut* about how we are creating so much throw-away technology. Specifically the quote: *"IC fabrication requires large amounts of energy ... the resulting microchips should be treasured like gems".*

## Microcontrollers

Most of our products require a microcontroller and there are a **lot** of choices out there. Using a different microcontroller for every product isn't feasible- I would have to read thousands of pages of documentation to learn to use the new controller, its peripherals, its board layout requirements, and how implement drivers. It's much better for me to pick two or three microcontrollers to focus on so I can build expertise as I create more products.

Winterbloom's primary microcontroller is the [Microchip SAM D](https://www.microchip.com/en-us/products/microcontrollers-and-microprocessors/32-bit-mcus/sam-32-bit-mcus/sam-d) series- specifically, the [SAM D21](https://www.microchip.com/wwwproducts/en/ATsamd21g18), [SAM D51](https://www.microchip.com/wwwproducts/en/ATSAMD51N19A), and [SAM D11](https://www.microchip.com/wwwproducts/en/ATSAMD11D14). These three general-purpose microcontrollers cover a variety of use cases and they actually have a common set of peripherals. That is *awesome*- it lets me re-use knowledge and code across projects that use any of these three microcontrollers.

It also helps that these microcontrollers are well established and have a very strong community. They're used in the [Arduino Zero](https://store.arduino.cc/usa/arduino-zero), Adafruit's [M0](https://www.adafruit.com/product/3403) and [M4](https://www.adafruit.com/product/3857) boards, SparkFun's [Things](https://www.sparkfun.com/products/14713), and more. This means there are lots of existing designs and firmware that can be adapted.

Here's some features common to all three that are super helpful for me:

1. **USB device**: Most of our products can operate as USB MIDI devices so having this is a must. USB also makes programming, debugging, configuration, and firmware updates so much easier.
2. **Flexible SERCOM peripheral**: SERCOMs can be configured for various serial communication protocols including [SPI](https://en.wikipedia.org/wiki/Serial_Peripheral_Interface), [I2C](https://en.wikipedia.org/wiki/I%C2%B2C), and [USART](https://en.wikipedia.org/wiki/Universal_synchronous_and_asynchronous_receiver-transmitter). This is perfect for communicating with external peripherals.
3. **Multi-channel 12-bit ADC**: All of our products need to read analog signals from the outside world. Having a built-in, multi-channel [analog-to-digital converter](https://en.wikipedia.org/wiki/Analog-to-digital_converter) is super convenient and simplifies our designs.
4. **Advanced timer peripherals**: These timers can be used for high-resolution timekeeping, PWM generation, and waveform generation.

Here's a little comparison table for these three microcontrollers:

|              | SAM D11    | SAM D21    | SAM D51    |
|--------------|------------|------------|------------|
| CPU          | Cortex-M0+ | Cortex-M0+ | Cortex-M4F |
| Clock speed  | 48 MHz     | 48 MHz     | 120 MHz    |
| Max flash    | 16 kB      | 256 kB     | 1024 kB    |
| Max RAM      | 4 kB       | 32 kB      | 256 kB     |
| Max pins     | 24         | 64         | 128        |
| SERCOMs      | 3          | 6          | 8          |
| ADC channels | 10         | 20         | 32         |
| [DACs](https://en.wikipedia.org/wiki/Digital-to-analog_converter)         | 1          | 1          | 2          |
| [I2S](https://en.wikipedia.org/wiki/I%C2%B2S)          | No         | Yes        | Yes        |

This gives me a clear set of criteria for choosing which SAM D to use - the SAM D11 is great for super simple things, the SAM D21 is a great all-arounder, and the SAM D51 is great for more demanding applications.

Looking towards the future I'm considering two other microcontrollers - the [RP2040](https://www.raspberrypi.org/documentation/rp2040/getting-started/) and the [STM32H7](https://www.st.com/en/microcontrollers-microprocessors/stm32h7-series.html). The RP2040 could be great for applications that don't require a lot of analog I/O, and the STM32H7 is an absolute powerhouse that could be useful for applications where sound generation needs to happen within the firmware itself.

## Hardware design

I design all of our hardware using [KiCAD](https://www.kicad.org/), a free and open source electronics design automation suite. KiCAD matches well with our philosophy: since our hardware is open source, we want the program used to view and edit the hardware documentation to be open source as well.

We have a small, but useful set of [common symbols, footprints, and 3D models](https://github.com/wntrblm/winterbloom_kicad_library) for parts that we use. We've also published [a list of our preferred parts](https://www.notion.so/theacodes/62f23f09ecfb4f0593cecfa66cefacc4?v=c3c9444aed274708a85644b1cd889003) in case it's useful for others.

## Firmware

There's actually several different bits that come together to form the firmware for our products- the programming language, the build system, the testing framework, etc. The next couple of sections will cover each part in turn.

## The C Programming Language, GCC, and CMSIS

I write our firmware using [C](https://en.wikipedia.org/wiki/C_(programming_language)). While some might gasp at using such an "old" language, it turns out that the combination of my familiarity with C, the maturity of its resources and tooling, and the low-level nature of writing firmware means that C happens to be a joyful language for me to write firmware in.

There are several options in terms of toolchains for microcontrollers. You can pay a lot of money for commercial compiliers from [Keil](https://www.keil.com/), [IAR](https://www.iar.com/products/architectures/arm/iar-embedded-workbench-for-arm/), and others, but it's really important to that our products, which are open source, use free and open source tools. We use the [GCC ARM Embedded Toolchain](https://developer.arm.com/tools-and-software/open-source-software/developer-tools/gnu-toolchain/gnu-rm).

We use [`--std=gnu11`](https://gcc.gnu.org/onlinedocs/gcc/Standards.html) as our C dialect, which comprises of the latest C standard and [GCC's C language extensions](https://gcc.gnu.org/onlinedocs/gcc/C-Extensions.html). We also compile with `-Wall -Wextra` and a [few other useful warnings](https://github.com/wntrblm/wintertools/blob/7646c602da4061819d5babfc0a7488b5ba2e5ffa/wintertools/buildgen.py#L143-L158) enabled to help catch undefined behavior.

Creating firmware can feel like a daunting task. Most microcontroller vendors provide a set of tools, frameworks, and examples - and most importantly - a hardware abstraction layer (HAL) library. For example, Microchip offers several options including [Atmel START](https://www.microchip.com/en-us/development-tools-tools-and-software/embedded-software-center/atmel-start) and [MPLAB Harmony](https://www.microchip.com/en-us/development-tools-tools-and-software/embedded-software-center/mplab-harmony-v3). These vendor resources can simultaneously be very helpful and extremely hard to work with. They often comprise of a lot of generated code with very little in the way of commenting and documentation.

I personally find the Microchip-provided HAL to be a little too unwieldy[^asf]. Because of that, we use the low-level [CMSIS](https://developer.arm.com/tools-and-software/embedded/cmsis) library directly and I write very small, usually project-specific, abstractions over that[^abstractions]. While it has a steep initial learning curve, getting familiar with working at this level has allowed me to better understand and utilize the hardware.

[^asf]: A small example: a single peripheral interface can involve 8 different files and 3-4 abstractions!
[^abstractions]: A good example of this is Castor & Pollux's [ADC interface](https://github.com/wntrblm/Castor_and_Pollux/blob/eec7a12c14b2274c7d020770e0a4cc0512c1139c/firmware/src/hw/gem_adc.c), which is based on two of my articles about [using the SAM D21 ADC](../reading-analog-values-with-the-samd-adc) and [getting the most out of it](../getting-the-most-out-of-the-samd21-adc).

## Firmware libraries

I don't write *everything* from scratch. There are several high quality libraries out there that really speed up the process of writing firmware. However, I am *extremely* cautious about using libraries in our firmware. Carelessly using a bunch of third-party code that I don't understand can end up hurting more than helping.

Here's some of the libraries we use:

- [TinyUSB](https://github.com/hathach/tinyusb): an excellent and small USB library.
- [Marco Paland's printf](https://github.com/mpaland/printf): a printf implementation optimized for microcontrollers.
- [libfixmath](https://github.com/PetteriAimonen/libfixmath): a small library for [fixed-point arthemetic](https://en.wikipedia.org/wiki/Fixed-point_arithmetic), which is super handy on microcontrollers that don't have a floating-point unit.
- [µnit](https://nemequ.github.io/munit/): a very small, very useful testing framework.

When we use a third-party library, we pull its source directly into the firmware's source tree (similar to a [monorepo](https://en.wikipedia.org/wiki/Monorepo)). This has a few benefits:

- All of the code needed to build the firmware is in one place.
- We get to choose how updates are applied to the library.
- We can make changes to the library without worrying about impacting other things.
- We have a clear picture of all of the code that we're building and shipping.
- We have a clear idea of which licenses the code and resulting firmware are under.

There's also a bit of re-usable code that we share across projects. I've collected it all into [libwinter](https://github.com/wntrblm/libwinter). It includes small helpers for things like random numbers, GPIO, colorspace conversion, MIDI, and timing.

## Build system

Our build system uses [Python](https://python.org) and [Ninja](https://ninja-build.org). Python is used to generate the `ninja.build` file and Ninja subsequently performs the build:

```bash
$ python3 configure.py
$ ninja
```

I initially started with [Makefiles](https://en.wikipedia.org/wiki/Make_(software)), but it quickly became hard to work with. Makefiles are wonderful, but at a certain level of complexity it makes more sense to move to an actual turing-complete language. Ninja is intentionally designed to be used by a higher-level build system[^ninja-backend] and Python was an obvious choice for me due to my familiarity with it. Again, it helps that Ninja and Python are well-established with lots of resources.

You can see an example of our `configure.py` script [here](https://github.com/wntrblm/Castor_and_Pollux/blob/main/firmware/configure.py). This one is used to build [Castor & Pollux's](https://winterbloom.com/store/winterbloom-castor-and-pollux) firmware for the SAM D21.

You might wonder why I ended up kinda rolling my own instead of using some existing high-level build system like CMake, Meson, etc. It mostly comes down to preference and the ability to completely understand how the build system works. It's much easier for me to reason about 300 lines of Python that are specifically tailored to our use case than to try to reason about a sprawlingly complex general-purpose build system.

[^ninja-backend]: Tools like [Meson](https://mesonbuild.com/) and [CMake](https://cmake.org/) can use Ninja as their "backend".


## Python-based tooling

All of our tooling uses [Python](https://python.org) and lives in a single repository, [wintertools](https://github.com/wntrblm/wintertools). Having these common utilities makes maintaining multiple products a lot more feasible for a single person.

First, `wintertools` has a variety of tools used during firmware development- it helps generate `ninja` files, analyses RAM and flash usage, adds detailed build info, and so on. Most of these are used by each product's `configure.py` script (like [the one mentioned in the last section](https://github.com/wntrblm/Castor_and_Pollux/blob/main/firmware/configure.py)).

Second, it has tooling for programming and testing our products- it has modules for interacting with our debug probe, our oscilloscope, our bench multimeter, and with the products themselves over serial or MIDI. These are used to create program & test scripts for each product (like [this one](https://github.com/wntrblm/Big_Honking_Button/blob/main/factory/factory_setup.py)).

I chose Python for all of this because I have a lot of experience with using Python for developer tooling. Beyond that, Python has long been seen as an ideal "glue" and tooling language thanks to its readability and large standard library. It's an ideal choice for use cases like this and there's literally **tons** of resources for writing tools like this in Python.

Looking towards the future, there's a few things I can do to make `wintertools` easier to use for people who aren't me- things like documentation and tests. There's a few more features/tools I'd like to add as well, like unifying our firmware release & publishing process.


## CircuitPython

Some of our products don't use custom firmware; they instead use [CircuitPython](https://circuitpython.org), an education-focused Python for microcontrollers. There's a lot of reasons why I picked CircuitPython:

- It makes it easy for our customers to customize the product's behavior. A CircuitPython device shows up as a little flash drive with a `code.py` file that they can just edit!
- It makes developing the firmware/software for a product much easier (as long as it fits within the constraints of CircuitPython).
- It has an [**incredible** community](https://learn.adafruit.com/welcome-to-the-community) that's maintained by [Adafruit](https://adafruit.com/).

For products like [Big Honking Button](https://winterbloom.com/store/winterbloom-big-honking-button) and [Sol](https://winterbloom.com/store/winterbloom-sol), which are intended to be customized, CircuitPython is an incredibly powerful option. It's so easy to use and so approachable that it turns what would generally be a frustrating and confusing experience into a delightful one. It also helps with the longevity of my creations; CircuitPython supports these products directly and will continue to release new versions for them as long as there are people maintaining CircuitPython[^maintainer].


[^maintainer]: I'm currently one of the people that maintains CircuitPython :)


## Documentation & user guides

As hard as you might try, it's almost impossible to create a product that needs no instructions. Complicated things like synthesizers need to provide at least *some* guidance or folks will just be frustrated by trying to understand some inscrutable interface. Documentation is **so** important and I take it very seriously- take a look at [Castor & Pollux's user guide](https://gemini.wntr.dev) for a look at how we approach documentation.

All of our product documentation is written in [Markdown](https://daringfireball.net/projects/markdown/), built into static webpages using [MkDocs](https://www.mkdocs.org/), and hosted on [GitHub Pages](https://pages.github.com/).

First, I chose Markdown because it's very easy to write and its also easy for other to contribute to. Fixing a few documentation issues is a common way that people start contributing to an open-source project, so I wanted to make that as easy as possible. In the past, I've preferred [reStructuredText](https://www.sphinx-doc.org/en/master/usage/restructuredtext/basics.html) for writing technical documentation (especially API documentation), but this kind of documentation lends itself much better to Markdown.

Second, MkDocs is a relatively simple static site generator that works well for us. Using a static site generator simplifies hosting and places the source of truth into the project's repository - both very useful things for us. MkDocs is the right balance of small enough but with just enough flexibility for us. It's also written in Python which means that if I do need to dig into the internals I'll be well-equipped to do so.

Third, we use GitHub Pages as our host. Since MkDocs just generates a static website, hosting on a provider like GitHub Pages is incredibly easy. I chose GitHub Pages because we're already hosting our source code on GitHub and it's a free service that provides all of the features we need (custom domains, HTTPS, etc.) The beauty of using a static website is that if for some reason GitHub Pages becomes undesirable, it's easy to move.

Through MkDocs' theming engine our documentation sites all have the same look & feel, [winterbloom-mkdocs-theme](https://github.com/wntrblm/winterbloom_mkdocs_theme). This theme is built on the [Bulma CSS framework](https://bulma.io/) and is optimized for readability and accessibility. We don't use any CSS compiler tools like [Sass](https://sass-lang.com/) or [LESS](https://lesscss.org/) since I prefer to keep things simple.


## JavaScript

Our documentation might be static pages, but they aren't **boring**. They contain useful interactive animations, embedded audio samples, [WebMIDI](https://www.w3.org/TR/webmidi/)-based settings editors, and more. For this, we need JavaScript.

This section is probably going to be the most controversial. It seems that it's fashionable to hate on JavaScript these days; while there are certainly valid criticisms I don't think it's as horrible as people would have you believe. There's no denying how useful JavaScript is and there's no escaping it if you're doing any sort of web development.

In recent years, [changes to the language](https://turriate.com/articles/modern-javascript-everything-you-missed-over-10-years) have made it a *lot* easier to work with. However, the overall ecosystem continues to churn so rapidly that it's very difficult to keep up with current best practices - especially for a single developer with a lot of other responsibilities.

I've chosen to avoid using the [Node.js ecosystem](https://nodejs.org/en/) in favor of just plain JavaScript. This is really because that whole part of the JavaScript ecosystem is **overwhelming** to me. It's useful, it's powerful, and I'm not here to rain on anyone's parade, but for me and for Winterbloom it's unnecessary, complicated, and wasteful. It's totally valid to come to a different conclusion for your use case.

Thanks to improvements both in the core language and Web APIs, using plain JavaScript is not only feasible but practically *joyful* for a small developer. We use features like [modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules), [classes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes), [arrow functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions), [Canvas](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API), [WebMIDI](https://www.w3.org/TR/webmidi/), [TypedArray](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray), and more. These modern features allow me to keep our JavaScript codebase small, clean, and free of external dependencies.

Just like with our common C and Python code, I've pulled out our common JavaScript code into a little library named [winterjs](https://github.com/wntrblm/winterjs). There really isn't much there- just some basic helpers for `<audio>` elements, `<forms>`, and WebMIDI.

Looking towards the future, I'm actually quite excited by [Deno](https://deno.land). Deno is somewhat of a parallel-universe Node.js that includes a standard library and closely matches Web APIs wherever possible. This is quite useful for me since it opens up the possibility of easily testing our JavaScript code - something [I've already experimented with](https://github.com/wntrblm/winterjs/blob/main/tests/teeth_test.js).

Finally, if you're a JavaScript developer and you go digging into my JavaScript code you might find some of my style choices offensive- I use 4 spaces and `snake_case`. I do this so that I'm consistent with our C and Python code which makes context switching much easier for me. Your style is probably different and that's totally okay!

## Wrapping up

I hope this was insightful, and possibly even helpful. Obviously I can't explain every single [layer of the onion](https://www.youtube.com/watch?v=-FtCTW2rVFM) or justify every decision, but if you have questions or feedback I'd [love to hear it](mailto:me@thea.codes).

## Footnotes

///Footnotes Go Here///
