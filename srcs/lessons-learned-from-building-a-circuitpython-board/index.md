---
title: Lessons learned from building a custom CircuitPython board
date: 2019-10-06
legacy_url: yes
---

I've spent the last few months designing a project that runs CircuitPython. Unlike many projects, this project does not use an off-the-shelf CircuitPython development board like Adafruit's [Feather M4 Express](https://www.adafruit.com/product/3857) or [IstyBitsy M4 Express](https://www.adafruit.com/product/3800). Instead, I wanted this project to be a single circuit board that contains all of the functional parts of the project - the CPU and its necessary hardware (which would usually be on the development board) as well as the peripherals (things that would generally be on Featherwings or shields). This makes the board smaller, more tightly integrated, and eventually easier to produce in larger quantities.

However, creating a custom CircuitPython board isn't a trivial process. There were quite a few things I ran into that have become lessons for me in the future. This post collects some of those lessons as a reference to myself as well as hopefully a helpful resource for others that are trying to do something like this. It isn't intended to be a complete guide on how to do this - there's already a couple of those out there. It's intended to be a supplementary list of things to look out for.


## About my project

For context the project I'm building that led to all of this is a [Eurorack synthesizer module](https://en.wikipedia.org/wiki/Eurorack). Modular synthesizers have lots of separate "modules" that perform specialized functions. You connect these modules together using [patch cables](https://en.wikipedia.org/wiki/Patch_cable) and they use voltage signals to talk to one another. My project is used to convert [MIDI](https://en.wikipedia.org/wiki/MIDI) messages into voltages to control various parts of the synthesizer. The project has several components - the CPU for processing MIDI data, a DAC for converting digital values to analog voltage, [op amps](https://www.electronics-tutorials.ws/opamp/opamp_1.html) to scale the output of the DAC to voltages that adhere to Eurorack standards, and a logic level shifter to convert for a handful of digital outputs. It also has some distinct power requirements - Eurorack gives the module +12, -12, and ground. The board has a set of power regulators to get the correct voltages to various components.

Here's a picture of the finished board with various sections highlighted:

![](./sol-annotated.jpg)

Note that this project is still not quite done, but I'm far enough along to share some parts of it here. :)


## Start from an existing board design

The absolute best thing that you can do to set yourself up for success is work from an existing CircuitPython board's design. In my case, I based the design off the [Adafruit Feather M4 Express](https://www.adafruit.com/product/3857) and the [Sparkfun Thing Plus](https://www.sparkfun.com/products/14713). The schematics for both of these boards are readily available ([Feather](https://learn.adafruit.com/adafruit-feather-m4-express-atsamd51/downloads), [Thing](https://cdn.sparkfun.com/assets/8/2/1/d/f/SAMD51_Thing_Plus_v10.pdf)). Both boards use the [Atmel SAMD51 CPU](https://www.microchip.com/wwwproducts/en/ATSAMD51J19A), a very capable CPU for CircuitPython. Many development boards will contain all of the essentials to run the CPU and little else. You can start your board by reconstructing the schematic for an existing board and making modifications as needed.

There are *lots* of benefits from working from an existing board. A lot of the guesswork will have already been done for you. You'll be able to use the reference board to test your peripherals (more on that later). You'll have a much easier time porting CircuitPython and the bootloader as well (more on that later, too).

In my case, there were several things present on the reference boards that I didn't need. Since this board would be powered by the Eurorack connector, I didn't need the battery charging circuit and switching logic. I swapped all of that out for a simple [LD1117](https://www.st.com/en/power-management/ld1117.html)-based 3.3v linear regulator that converts the +12v from the Eurorack connector to 3.3v for the CPU. I also didn't bother with the tiny red LED that's usually wired to `board.D13`. Also keep in mind that you don't need to put in all of the connections for the digital and analog pins that are broken out on the development board. Since everything will be integrated you can make those connections directly to your peripherals. It might be useful to break a few spare ones out for debugging or future expansion (like adding a [STEMMA connector](https://learn.adafruit.com/introducing-adafruit-stemma-qt)).


## Read the CPU datasheet. Over and over.

The Feather uses a [ATSAMD51J19A](https://www.microchip.com/wwwproducts/en/ATSAMD51J19A). I decided to actually use the ATSAMD51**20**A, which is the same chip with slightly more memory. They have the same [datasheet](http://ww1.microchip.com/downloads/en/DeviceDoc/60001507E.pdf). It's extremely important to review the datasheet **several** times. I mean, you don't have to review the whole thing (it's a couple of thousand pages) but there is this very important section titled "Schematic Checklist". The datasheet for most CPUs will have a similar section. When designing your own board you should go through that section several times to ensure you've given the little chip the best possible chance of working as expected.

One thing that was important for my design is that CPU has several modes for its power supply. The Feather has the hardware needed to use a feature called "switching power mode" that helps with efficiency (useful for battery powered board) but my project doesn't need that and I could reduce the part count by using "linear mode only". I had to thoroughly review this part of the datasheet to properly design the power supply section.

Triple check the CPU datasheet to make sure you don't miss anything. I actually somehow managed to forget to apply 3.3v to `VDDIO` in my first board revision so I didn't even power the CPU! It was an easy enough thing to [bodge](https://www.techopedia.com/definition/17992/blue-wire), but still.


## Proof of concept peripherals

As mentioned earlier, one of the benefits of working with an existing board as your reference is that it gives you a chance to build a proof of concept with the peripherals that you plan to use.

In my case, I wanted to build some proof of concepts for the power supply section and the DAC that I'd be using. So I took a Feather M4 Express and got to work. You can use breadboards and through-hole components if you want, but in my case the DAC I wanted to use was surface mount only.

So I created a small breakout board for the DAC:

![](./dac-breakout.jpg)

This let me hook the DAC up to the Feather and write a little Python library to control it without having to get too heavily invested in my board. As an added bonus, I also got a nice DAC breakout board for future prototyping *and* now had the schematics for the DAC section ready to integrate into the final project.

I also did the same with the power supply section. I built a small breakout board that took the Eurorack power connection and used linear regulators to provide +5v and +3.3v:

![](./power-breakout.jpg)

This was a little tricker than the DAC as you have to do some special stuff to let the Feather be externally powered ([more details here](https://learn.adafruit.com/adafruit-feather-m4-express-atsamd51/power-management#alternative-power-options-5-14)). But it was worth it to prove out the tricky power supply section.

Doing these kinds of prototype/proof of concept builds with your peripherals is a great way to inch closer to your final project while providing yourself with a wealth of useful components for future projects. In the end, designing the final schematic for my project was a lot easier as I was able to combine the schematics from these breakouts and the modified Feather schematic.


## Check before selecting a flash chip

Most projects will likely want to use an external flash memory chip to store the project code as the CPU has relatively limited storage. Before you go and just order any old QSPI flash chip it's useful to take a look at the ones that CircuitPython already has configuration for. I used [this file](https://github.com/adafruit/circuitpython/blob/master/supervisor/shared/external_flash/devices.h) as a reference when selecting my QSPI flash chip. Thankfully most of these chips have the exact same pinout so it's easy to switch if you need to, but in my experience it saves a lot of headache if you just get one that CircuitPython already knows about to start with.


## Double, double check your parts before ordering

I made the mistake of ordering the [QFN](https://en.wikipedia.org/wiki/Quad_Flat_No-leads_package) version of the CPU during my first order. QFN parts have no external pins and are basically impossible to solder by hand. I had intended to order the [QFP](https://en.wikipedia.org/wiki/Quad_Flat_Package) version. You'll also notice that lots of mass produced professional development boards will use extremely tiny surface mount passive components. While you'll most certainly want to use surface mount passives for the CPU, you don't need to torture yourself with itty bitty parts. I used 1210-sized components that were more than reasonably sized for hand soldering without being too large and cumbersome to deal with. Just make sure to double check when ordering you parts that you get the right package and size before ordering stuff. I actually managed to order an *extremely* tiny crystal for my project but it turns out I had the right footprint for it, so, it very luckily worked out.


## Include a programming header

It isn't always obvious but lots of professional development boards do not include programming headers so you won't see them in the schematic. Sometimes they include them in non-obvious ways such as with [Pogo pins](https://en.wikipedia.org/wiki/Pogo_pin). You'll want to make sure to include some sort of programming header on your custom board. I suggest using the [10-pin Cortex Debug (SWD) header](http://infocenter.arm.com/help/topic/com.arm.doc.faqs/attached/13634/cortex_debug_connectors.pdf). Sparkfun has it in their [footprint libraries](https://github.com/sparkfun/SparkFun-KiCad-Libraries) as `2X5-PTH-1.27MM` and the pin headers are [Mouser Part Number #855-M50-3500542](https://www.mouser.com/ProductDetail/855-M50-3500542). There is also a super nice [surface mount version](https://www.adafruit.com/product/752).

Of course, to actually program the board you'll need some sort of programmer to plug into the programming header. I use a J-Link. There's an [educational](https://www.adafruit.com/product/3571) and [commercial](https://www.adafruit.com/product/2209) version available from Adafruit.


## Only populate what you need at first

While creating this board I was also learning how to use surface mount parts and learning to do [hot plate reflow soldering](https://www.sparkfun.com/tutorials/59). On my first revision I actually populated the entire board and it didn't work. I had *no* idea how to go about figuring out what was wrong. Thankfully a friend of mine helped me by removing parts one by one until the board stopped shorting out (thanks, Scott!). It turned out to be an incorrectly installed Neopixel that was causing the short. However, it would have been a lot easier (and cheaper) to just put the minimal amount of parts on the board to see if things are working.

For the second revision I populated the 3.3v regulator (and its passives), the SAMD51 (and its passives), and the programming header and verified that they worked before continuing to populate the rest. I still used the hot plate to reflow solder the QFP SAMD51 and spare myself the pain of hand soldering that. I then hand-soldered the rest of the components on one by one - verifying their operation as I went. This was *much* more cost and time effective even if it were just a bit tedious.


## Bootloader - you actually need it!

I had incorrectly assumed that I could just flash my CircuitPython build to the board using the J-Link and it would work. It turns out I was completely wrong - you *do* need a bootloader to run CircuitPython (it's probably possible to build without needing one but I haven't found instructions for that). If you flash it to your board and read back your board's memory you'll notice that there's a big blank chunk of memory at the beginning of the address space. CircuitPython leaves that around for the bootloader!

You'll need to clone the [UF2 Bootloader repository](https://github.com/adafruit/uf2-samdx1) and configure it for your board. If your board is functionally the same as your reference board you can likely just build the bootloader for your reference board and flash it to your chip. Otherwise, copy your reference board's folder under `./boards` and modify whatever you need. In my case I just had to update the chip variant.


## Building CircuitPython

Finally we get to building CircuitPython. Again, working from an existing board helps here. You can copy the reference board's configuration and modify to your needs. There's a [in-depth guide](https://learn.adafruit.com/how-to-add-a-new-board-to-circuitpython/customizing-the-board-files) for that.

Once it's built - flash it to the device using the programmer or bootloader and you're ready to go!
