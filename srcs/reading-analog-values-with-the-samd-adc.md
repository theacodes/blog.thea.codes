---
title: "Reading analog values with the SAMD21's ADC"
date: 2020-07-08
legacy_url: yes
description: A low-level, register-based approach to using the SAMD21 ADC
---

I've been diving deeper and deeper into the [SAM D21's](https://www.microchip.com/wwwproducts/en/ATsamd21g18) hardware over the last few weeks. I've been trying to grasp as much as I can at the hardware level so that I can take advantage of some of the more advanced features that higher-level environments like [Arduino](https://www.arduino.cc/) and [CircuitPython](https://circuitpython.org) can obscure behind the friendly `analogRead` function. This means working at things at the hardware register level.

Today I started working with the SAM D21's [Analog to Digital Converter](https://en.wikipedia.org/wiki/Analog-to-digital_converter) (ADC). This peripheral lets you measure analog voltage on one of the microcontroller's pins and is super useful for my synthesizer projects. This post walks through setting up the ADC and reading a value. It's also pretty likely that this information applies to other controllers in the SAM family, such as the SAM D51.


## How the ADC works 

The ADC is one of the SAM D21's more straightforward peripherals so thankfully the setup isn't too complex and boils down to these steps:

1. Enable the bus clock to the ADC.
1. Wire up a peripheral clock to the ADC.
1. Load the ADC's calibration values.
1. Configure the measurement parameters.
1. Configure the pin for the ADC function.
1. Start the ADC and trigger a measurement.

It's also important to note that The SAM D21 has one single ADC but it has multiple channels. This means that while you can only measure one pin (channel) at a time, you can swap between the channels to measure the voltage on multiple pins. This post will only show using one pin but it should give you enough to go on if you want to read multiple pins.


## Configuring the ADC

Okay, to start you'll need to enable the bus clock. This lets the microcontroller talk to the ADC peripheral - nothing works without this! If you're using Arduino or something like that it's likely that this is already done for you - but it won't hurt to do it again.

```c
/* Enable the APB clock for the ADC. */
PM->APBCMASK.reg |= PM_APBCMASK_ADC;
```

Next you'll need to wire up a peripheral clock. In this case, I have `GCLK1 ` setup as an 8Mhz clock and I'm going to use that for the ADC. Depending on your setup you might want to use a different clock. Finally, if you're on Arduino it's already set up a bunch of clocks for you. Either way, you'll need to attach *some* clock to the ADC. Here's the code:

```c
/* Enable GCLK1 for the ADC */
GCLK->CLKCTRL.reg = GCLK_CLKCTRL_CLKEN |
                    GCLK_CLKCTRL_GEN_GCLK1 |
                    GCLK_CLKCTRL_ID_ADC;

/* Wait for bus synchronization. */
while (GCLK->STATUS.bit.SYNCBUSY) {};
```

Alright! Now that the ADC has a clock you can actually talk to it. First things first - you need to load the calibration. This is important because without it you won't get the full accuracy of the ADC. There's some very vague information about this in the datasheet but I was able to find some code that demonstrates how to use this in a random application note. The calibration is done at the factory and is stored in the chip's NVM. This code loads the calibration from the NVM and puts it into the ADC's `CALIB` register:

```c
uint32_t bias = (*((uint32_t *) ADC_FUSES_BIASCAL_ADDR) & ADC_FUSES_BIASCAL_Msk) >> ADC_FUSES_BIASCAL_Pos;
uint32_t linearity = (*((uint32_t *) ADC_FUSES_LINEARITY_0_ADDR) & ADC_FUSES_LINEARITY_0_Msk) >> ADC_FUSES_LINEARITY_0_Pos;
linearity |= ((*((uint32_t *) ADC_FUSES_LINEARITY_1_ADDR) & ADC_FUSES_LINEARITY_1_Msk) >> ADC_FUSES_LINEARITY_1_Pos) << 5;

/* Wait for bus synchronization. */
while (ADC->STATUS.bit.SYNCBUSY) {};

/* Write the calibration data. */
ADC->CALIB.reg = ADC_CALIB_BIAS_CAL(bias) | ADC_CALIB_LINEARITY_CAL(linearity);
```

Cool, with the calibration loaded now you can set up the measurement parameters. This will vary based on your use case, but this shows how to do the absolute simplest measurement. This measurement is 12-bits, uses the internal voltage reference, and captures only one sample. Here's the code:

```c
/* Wait for bus synchronization. */
while (ADC->STATUS.bit.SYNCBUSY) {};

/* Use the internal VCC reference. This is 1/2 of what's on VCCA.
   since VCCA is typically 3.3v, this is 1.65v.
*/
ADC->REFCTRL.reg = ADC_REFCTRL_REFSEL_INTVCC1;

/* Only capture one sample. The ADC can actually capture and average multiple
   samples for better accuracy, but there's no need to do that for this
   example.
*/
ADC->AVGCTRL.reg = ADC_AVGCTRL_SAMPLENUM_1;

/* Set the clock prescaler to 512, which will run the ADC at
   8 Mhz / 512 = 31.25 kHz.
   Set the resolution to 12bit.
*/
ADC->CTRLB.reg = ADC_CTRLB_PRESCALER_DIV4 |
                 ADC_CTRLB_RESSEL_12BIT;

/* Configure the input parameters.

   - GAIN_DIV2 means that the input voltage is halved. This is important
     because the voltage reference is 1/2 of VCCA. So if you want to
     measure 0-3.3v, you need to halve the input as well.

   - MUXNEG_GND means that the ADC should compare the input value to GND.

   - MUXPOST_PIN3 means that the ADC should read from AIN3, or PB09.
     This is A2 on the Feather M0 board.
*/
ADC->INPUTCTRL.reg = ADC_INPUTCTRL_GAIN_DIV2 |
                     ADC_INPUTCTRL_MUXNEG_GND |
                     ADC_INPUTCTRL_MUXPOS_PIN3;
```

Okay, one last task before you can start taking measurements: you have to configure the input pin for the ADC. The code above specified that you want to use `AIN3`/`PB09` as the input pin so you'll need to configure that for input. By the way, you can find a complete list of analog input pins in section 33.8.8 of the [SAM D21 datasheet](http://ww1.microchip.com/downloads/en/DeviceDoc/SAM_D21_DA1_Family_DataSheet_DS40001882F.pdf). Here's the code for that:

```c
/* Set PB09 as an input pin. */
PORT->Group[1].DIRCLR.reg = PORT_PB09;

/* Enable the peripheral multiplexer for PB09. */
PORT->Group[1].PINCFG[9].reg |= PORT_PINCFG_PMUXEN;

/* Set PB09 to function B which is analog input. */
PORT->Group[1].PMUX[4].reg = PORT_PMUX_PMUXO_B;
```

Alright - configuration complete! Last but not least, you need to enable the ADC:

```c
/* Wait for bus synchronization. */
while (ADC->STATUS.bit.SYNCBUSY) {};

/* Enable the ADC. */
ADC->CTRLA.bit.ENABLE = true;
```

## Measuring and reading values

Okay, so you've configured the ADC and you're ready to measure stuff. You can do that by triggering the ADC and waiting for a result to be ready. Here's how you do it:

```c
/* Wait for bus synchronization. */
while (ADC->STATUS.bit.SYNCBUSY) {};

/* Start the ADC using a software trigger. */
ADC->SWTRIG.bit.START = true;

/* Wait for the result ready flag to be set. */
while (ADC->INTFLAG.bit.RESRDY == 0);

/* Clear the flag. */
ADC->INTFLAG.reg = ADC_INTFLAG_RESRDY;

/* Read the value. */
uint32_t result = ADC->RESULT.reg;
```

That's it! You can do that over and over again to continue reading from the ADC. Something **super important to note**: you **must** throw away the first reading from the ADC because the first reading won't be accurate at all. This is just how the hardware works and it's called out specifically in the datasheet.


## Wrapping up

I hope this post is helpful for someone - either someone wanting to learn more about register-level microcontroller programming or someone looking to get the SAM D21 ADC working for their project. I'll be writing a follow up post on some more advanced features of the ADC soon - stay tuned!

Here's some resources about the SAM D21 ADC that I used when researching this topic and writing this post, they may be useful as further reading:

- [SAM D21 Datasheet](http://ww1.microchip.com/downloads/en/DeviceDoc/SAM_D21_DA1_Family_DataSheet_DS40001882F.pdf)
- [CircuitPython's AnalogIn source code](https://github.com/adafruit/circuitpython/blob/main/ports/atmel-samd/common-hal/analogio/AnalogIn.c)
- [Adafruit's samd-peripheral's ADC source code](https://github.com/adafruit/samd-peripherals/blob/master/samd/samd21/adc.c)
- [Arduino's SAMD21 core analog source code](https://github.com/arduino/ArduinoCore-samd/blob/master/cores/arduino/wiring_analog.c)
- [ATSAMD21-ADC library](https://github.com/Molorius/ATSAMD21-ADC)
