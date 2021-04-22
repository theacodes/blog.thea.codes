---
title: "Using the SAM D21's brown-out detector"
date: 2021-04-21
legacy_url: yes
description: A guide to using the SAM D21's brown-out detector to prevent strange behavior.
---

Over the past year, I've been getting more and more acquainted with the [SAM D21](https://www.microchip.com/wwwproducts/en/ATsamd21g18) 32-bit ARM-Cortex M0+ microcontroller. It's a lovely little chip and you can find it all over the place - notably in the [Arduino Zero](https://store.arduino.cc/usa/arduino-zero) and several of Adafruit's [M0 boards](https://www.adafruit.com/product/3403). I've written several articles about various aspects of the SAM D21 and I've even shipped two products that use it as their brain.

In this post, I'll cover the basics of the SAM D21's *brown-out detector*, why it's not just useful but **critical**, and how it can help you make your SAM D21-based project more reliable and resilient. Even if you think your project will never be subjected to a brown-out event, I promise it's worth your time to learn about the brown-out detector and how it can save you from all kinds of unexpected behavior.

## A debugging story

> If you aren't interested in a fun debugging story and you just want to read the technical bits, [skip ahead](#using-the-brown-out-detector).

Let me tell you a story about how I ended up becoming familiar with the brown-out detector. Just over a month ago, we started shipping [Castor & Pollux](https://winterbloom.com/store/winterbloom-castor-and-pollux) - a Eurorack module with a SAM D21 brain. While nearly all of our customers were happy, we got a couple of reports of modules spontaneously dying for no apparent reason. They would turn on their synthesizer and a previously fine Castor & Pollux would now be lifeless.

This is a difficult situation to debug- it's hard to reproduce (otherwise we would've seen it during factory setup), the affected units are far away, and the environments they're in are highly variable - Castor & Pollux is a *module* that goes into a [modular synthesizer](https://en.wikipedia.org/wiki/Modular_synthesizer), so there's practically endless combinations of power supplies and other modules that could affect the overall system.

I initially suspected a hardware issue. Since the whole power situation in a modular synthesizer can be pretty hostile, my hunch was that some unexpected voltage spike or drop was frying something. I subjected several units to pretty intense overvoltage, undervoltage, and output shorting conditions and turned up nothing.

The last stress test I wanted to put the hardware through was *power cycling*. I connected five units up to my bench supply and switched the power on and off at various intervals.

![A cat turning a light switch off and on](/static/2021-4-21/cat.gif){:class=small}

After about 50 cycles, one of the modules stopped working. It's a weird feeling when you're happy that something you made has died! I started investigating and found that the module physically seemed fine- it wasn't shorting out as if one of the ICs had suffered a terrible fate, nothing was getting hot, and no magic smoke had escaped. The voltage regulator was reading a steady `3.3v`. I connected my debug probe and to my surprise, the microcontroller was alive and well. *Almost*.

The microprocessor was fine but it wasn't running the firmware, so, I tried to re-flash the bootloader and firmware and it immediately sprung back to life.

What? Why did that work?

I reproduced this again with another unit and instead of re-flashing it I dumped the contents of its flash. I opened it up in a hex editor and immediately saw the problem: the first page (`256` bytes) of flash had been erased. **that's not supposed to happen**!

![A screenshot of a hex editor comparing two files, the first one showing empty values for the first 256 bytes](/static/2021-4-21/corruption.png).

These first `256` bytes are part of the bootloader and without them the module is bricked - users without a debug probe would be unable to rescue their module from this state. So that explains the way in which the modules are dead, but not the complete chain of events that got them into this state.

So memory corruption during power cycling is the culprit- but how did that happen? The bootloader's code is supposed to be protected from being overwritten ([datasheet][datasheet] section 22.6.2). This is where I discovered the first half of this mystery - none of these units had the bootloader protection enabled.

I had assumed that the bootloader we use, [uf2-samdx1](https://github.com/adafruit/uf2-samdx1), would enable bootloader protection automatically. It turns out that isn't the whole story- it only enables bootloader protection in two cases:

1. The bootloader protection configuration is invalid
2. The bootloader has updated itself

Since our units had valid configuration (valid, but *disabled*) and because we don't update the bootloader with itself during setup, neither of these cases ever occurred. This left the bootloader unprotected from spurious writes.

Okay, so we should configure bootloader protection during factory setup. But that isn't the end of this mystery - the bootloader protection is supposed to be the last line of defense. Why did the first page of flash get erased in the first place? Nothing in the firmware or bootloader tries to write to flash during normal operation, so what gives?

Well, it's complicated, and this is where brown-out detection comes into play.

## Brown-outs, slow power supply rise time, and unfortunate side-effects

The brown-out detector's basically functionality is to measure the microcontroller's power (`VDDANA` in the SAM D21's case) and to take some action if it falls below a certain level.

There's the obvious case of a *typical* brown-out: there's too little input voltage due to a battery that doesn't have enough charge or an invalid power supply. However, there's another case that isn't immediately obvious: power supply rise time.

When you power on a device, the power isn't immediately available to all of the components at once. This is because of several factors such as [inrush current][inrush], overall resistance of the circuit, capacitors needing to charge up, and stray inductance.

![A graph showing power supply voltage during start-up. It has a noticeable droop in response to the inrush current](/static/2021-4-21/inrush.png)

<div class="image-caption">from <a href="ttps://www.ti.com/lit/an/slva670a/slva670a.pdf" target="_blank">Managing Inrush Current</a> by Texas Instruments</div>

Because of this, it's possible for the microcontroller to start *before* the power supply has reached its target voltage (this is sometimes called a "*brown-in*"). For the SAM D21, the power-on reset circuit will start the processor once the power supply voltage is above `1.45v` ([datasheet][datasheet] section 37.11.2). The SAM D21 can operate at `1.45v` quite well, however, it can not operate correctly at *full speed* at that voltage without special considerations.

Notably, the on-board flash (NVM) has to be configured differently if the microcontroller is running at lower voltages ([datasheet][datasheet] table 37-42):

![A table showing the necessary configuration for the SAM D21's flash at various operating voltages and frequencies](/static/2021-4-21/flash-wait-states.png)

This is where I ran into trouble: it was possible for the module to startup, switch to 48 MHz, configure the NVM for `1` wait state, and try to run normally before the power supply reached the required minimum of `2.7v` to run at that frequency. This could and did lead to NVM corruption.

The brown-out detector can help with this scenario as well. The firmware can use the brown-out detector to stay at a lower clock speed and wait until the supply voltage is high enough before continuing to normal execution.

## Using the brown-out detector

Alright 👏, I've convinced you to use the brown-out detector- how do you do it? The [datasheet][datasheet] covers the brown-out detector (`BOD33`) in section `17.6.9`, but it's unfortunately pretty slim on details, so I'll show you how to use it in a practical application.

This program will use `BOD33` for two separate steps:

1. On startup, it will wait for the power supply to settle at the proper voltage.
2. After the power supply settles, it will setup the brown-out detector to automatically reset the microcontroller if the voltage goes too low.

Here's how to use the `BOD33` to wait for the power supply to settle:

```c
/* Disable the brown-out detector during configuration,
   otherwise it might misbehave and reset the
   microcontroller. */
SYSCTRL->BOD33.bit.ENABLE = 0;
while (!SYSCTRL->PCLKSR.bit.B33SRDY) {};

/* Configure the brown-out detector so that the
   program can use it to watch the power supply
   voltage */
SYSCTRL->BOD33.reg = (
    /* This sets the minimum voltage level to 3.0v - 3.2v.
       See datasheet table 37-21. */
    SYSCTRL_BOD33_LEVEL(48) |
    /* Since the program is waiting for the voltage to rise,
       don't reset the microcontroller if the voltage is too
       low. */
    SYSCTRL_BOD33_ACTION_NONE |
    /* Enable hysteresis to better deal with noisy power
       supplies and voltage transients. */
    SYSCTRL_BOD33_HYST);

/* Enable the brown-out detector and then wait for
   the voltage level to settle. */
SYSCTRL->BOD33.bit.ENABLE = 1;
while (!SYSCTRL->PCLKSR.bit.BOD33RDY) {}

/* BOD33DET is set when the voltage is *too low*,
   so wait for it to be cleared. */
while (SYSCTRL->PCLKSR.bit.BOD33DET) {}
```

It's important to run this code as early as possible. For our firmware, it's
necessary to do this before we setup the clocks to run at 48 MHz since that
will lead to corruption otherwise.

The next step is to set up the brown-out detector to keep monitoring the
voltage and automatically reset the microcontroller if it falls below the
required voltage - this is what folks generally think of when they hear
"brown-out".

The code above actually did most of the setup for this step, all that's
needed now is to change the *action* from `NONE` to `RESET`:

```c
/* Let the brown-out detector automatically reset the microcontroller
   if the voltage drops too low. */
SYSCTRL->BOD33.bit.ENABLE = 0;
while (!SYSCTRL->PCLKSR.bit.B33SRDY) {};

SYSCTRL->BOD33.reg |= SYSCTRL_BOD33_ACTION_RESET;

SYSCTRL->BOD33.bit.ENABLE = 1;
```

🎉 that's it! Now your project won't suffer from unexpected and dangerous
behavior when the power supply gets wonky.

## Wrapping up & futher reading

I highly recommend that you always use the brown-out detector unless you have a really, really good reason not to do so. It's a bit of a surprise that Microchip does not enable it by default.

One last thing before you go: you can actually configure the brown-out detector to be automatically enabled at start-up through the special configuration bits in the *NVM User Row Mapping* ([datasheet][datasheet] section 10.3.1) (also sometimes referred to as *fuses*). I'll be writing another post about that so stay tuned!

Further reading:

* [The SAM D21 datasheet][datasheet]
* [Managing inrush current (SLVA670A)](https://www.ti.com/lit/an/slva670a/slva670a.pdf) by Texas Instruments
* [Wikipedia article on inrush current][inrush]
* [Power supply rise and fall output characteristics](http://power-topics.blogspot.com/2013/02/power-supply-rise-and-fall-output.html) by TDK-Lambda Americas
* [Flash Corruption: Software Bug or Supply Voltage Fault?](https://www.digikey.com/Web%20Export/Supplier%20Content/lattice-semiconductor-220/pdf/lattice-wp-flash-corruption.pdf) by Shyam Chandra of Lattice Semiconductor
* [What Is Brown Out Reset in Microcontrollers? How to Prevent False Power-Downs](https://www.allaboutcircuits.com/technical-articles/what-is-brown-out-reset-microcontroller-prevent-false-power-down) by Stephen Colley
* [What is flash memory wait states?](https://electronics.stackexchange.com/questions/27241/what-is-flash-memory-wait-states) on StackOverflow


[datasheet]: https://ww1.microchip.com/downloads/en/DeviceDoc/SAM_D21_DA1_Family_DataSheet_DS40001882F.pdf
[inrush]: https://en.wikipedia.org/wiki/Inrush_current
