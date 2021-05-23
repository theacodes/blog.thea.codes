---
title: "Talking to gamepads from Python without PyGame"
date: 2021-05-22
legacy_url: yes
description: How to use a game controller / gamepad without PyGame
---

Alright, here's the scenario: I wanted to use a gamepad/controller from my Python script so I could use it to control some hardware, but I didn't want to use [PyGame](https://www.pygame.org/) / [SDL](https://www.libsdl.org/) or anything like that. It's a "headless" terminal application and doesn't need a window or UI or anything - I just needed to talk to the controller. I also only needed to talk to *one kind* of controller. You might run into a use case like this if you're doing stuff with the [Raspberry Pi](https://www.raspberrypi.org/) without a screen.

This was harder to figure out that I expected, so, I thought I'd write up a short little guide for folks who might find themselves in a similar situation.

## Things that don't work

First, let me tell you some things that don't work:

1. Trying to use PyGame / SDL without a window or screen. You can't use [SDL_Joystick](https://wiki.libsdl.org/CategoryJoystick) without initializing SDL's video system.
2. Since I'm on macOS, I attempted to use [pyobjc](https://pyobjc.readthedocs.io/en/latest/) with the [Game Controller framework](https://developer.apple.com/documentation/gamecontroller). Yeah - I don't know if I was holding it wrong but I didn't get anywhere with that.
3. The seemingly useful [inputs](https://pypi.org/project/inputs/) library. It just didn't detect my controller at all.

## How do we talk to a gamepad?

Most game controllers these days are generic [USB HID](https://en.wikipedia.org/wiki/USB_human_interface_device_class) devices. They send their state through input reports that can be decoded to determine the state of the buttons and axes. This is a pretty low-level approach but it's also a relatively cross-platform way to do it. The big drawback is that you have to translate the raw HID report data, and this report's format varies from controller to controller. So it's not the best approach if you want to support a bunch of different controllers (which thankfully isn't my use case).

If you want a higher-level interface without resorting to PyGame / SDL, you can use platform-specific APIs. On Windows, you could use [Xinput](https://pypi.org/project/XInput-Python/#description) and on Linux you could use [evdev](https://python-evdev.readthedocs.io/en/latest/). Both of these APIs are more high-level than the HID interface since they take care of mapping the controller's reports into standard button and joystick events.

But, without a simple solution on macOS I decided to talk to the HID interface using [hidapi](https://github.com/trezor/cython-hidapi).

## Speaking HID

Once you've got [hidapi installed](https://github.com/trezor/cython-hidapi#install), you can use it to enumerate all of the HID devices:

```python
import hid

for device in hid.enumerate():
    print(f"0x{device['vendor_id']:04x}:0x{device['product_id']:04x} {device['product_string']}")
```

This prints out the vendor ID, product ID, and description for each HID device:

```
0x05ac:0x0259  Apple Internal Keyboard / Trackpad
0x0f0d:0x00c1  Pro Controller
```

In this case, I have a [Retro-bit SEGA Saturn controller](https://retro-bit.com/sega-saturn-control-pad-with-usb-black.html) (named "Pro Controller"). To start talking to it you have to tell `hidapi` its vendor and product ID:

```python
gamepad = hid.device()
gamepad.open(0x0f0d, 0x00c1)
gamepad.set_nonblocking(True)
```

Enabling non-blocking means that the program won't hang when trying to read from the device if it isn't ready, it'll just return `None`.

Now the program can read input reports from the controller:

```python
while True:
    report = gamepad.read(64)
    if report:
        print(report)
```

The report is a list of bytes that represent the state of the controller. For the Saturn controller the report is just 8 bytes long:

```python
[0, 0, 15, 128, 128, 128, 128, 0]
```

While this might seem inscrutable at first, it's actually pretty easy to figure out how these bytes represent the state of the controller- just watch the reports and note how they change when you press each button. For example, pressing the A button caused the report to change like this:

```python
# No buttons pressed
[0, 0, 15, 128, 128, 128, 128, 0]
# A button pressed
[4, 0, 15, 128, 128, 128, 128, 0]
```

The first byte changed to a `4`. Interesting - here's what happens when you press the B button:

```python
# No buttons pressed
[0, 0, 15, 128, 128, 128, 128, 0]
# B button pressed
[2, 0, 15, 128, 128, 128, 128, 0]
```

Oh the first byte changed for the B button, too, but it changed to `2`. What happens if both are pressed?

```python
# No buttons pressed
[0, 0, 15, 128, 128, 128, 128, 0]
# A & B buttons pressed
[6, 0, 15, 128, 128, 128, 128, 0]
```

Ah, now this makes sense- it's a [bitfield](https://en.wikipedia.org/wiki/Bit_field). Each button's state is represented by a bit in the first byte. It's much easier to see if it's formatted as bits:

```python
# No buttons pressed
[0b00000000, ...]
# A button pressed
[0b00000100, ...]
# B button pressed
[0b00000010, ...]
# A & B buttons pressed
[0b00000110, ...]
```

You can figure out the bit for each button this way, and once you have them all, getting the state of the buttons is straightforward using [bitmasks](https://en.wikipedia.org/wiki/Mask_(computing)):

```python
a = report[0] & 0b00000100
b = report[0] & 0b00000010
c = report[0] & 0b10000000
x = report[0] & 0b00001000
y = report[0] & 0b00000001
z = report[0] & 0b01000000
```

While the Saturn controller has a [D-pad](https://en.wikipedia.org/wiki/D-pad), its state is not reported like the buttons; it's reported as two axes as if it were an analog [joystick](https://en.wikipedia.org/wiki/Joystick). Reading the state of axes is a little different from buttons but not to difficult. Take a look at how the reports change when pressing the different directions on the D-pad:

```python
# Nothing pressed
[0, 0, 15, 128, 128, 128, 128, 0]
# Left pressed
[0, 0, 15,   0, 128, 128, 128, 0]
# Right pressed
[0, 0, 15, 255, 128, 128, 128, 0]
# Up pressed
[0, 0, 15, 128,   0, 128, 128, 0]
# Down pressed
[0, 0, 15, 128, 255, 128, 128, 0]
```

Notice that left and right change the 4th byte while up and down change the 5th byte. The 4th byte is reporting the left and right buttons as an "X-axis" and the 5th is reporting the up and down buttons as a "Y-axis". The range of the values are `0` to `255`, with `128` representing the middle. If this were a controller with a analog stick, the value would vary across the range based on where the stick is. Since this is a D-pad, it just reports `0` (all the way left / up), `128` (not pressed), `255` (all the right right / down). So the D-pad button states can be decoded like this:

```python
left = report[3] == 0
right = report[3] == 255
up = report[4] == 0
down = report[4] == 255
```

For this controller, that's it! Easy peasy if you only need to support one controller. If you're trying to do this with multiple controllers, eh, I'd just suck it up and use PyGame / SDL.

## What about other types controllers?

My little Saturn controller is pretty simple, but this works with other, more complex controllers, too. For example, the PlayStation 4 controller is a USB (and Bluetooth) HID device, so you can talk to it a similar way. However, the report is **much** more complex:

```python
[1, 127, 126, 121, 124, 8, 0, 240,
 0, 0, 61, 3, 2, 5, 0, 2, 0, 0, 0,
 34, 1, 159, 31, 181, 4, 0, 0, 0,
 0, 0, 27, 0, 0, 1, 148, 128, 95,
 0, 0, 128, 0, 0, 0, 0, 128, 0, 0,
 0, 128, 0, 0, 0, 0, 128, 0, 0, 0,
 128, 0, 0, 0, 0, 128, 0]
```

That's a lot stuff! It's not surprising- the PlayStation 4 controller has 12 buttons, two sticks, a D-pad, a touchpad, a gyroscope, and an accelerometer. Thankfully some nice people have [documented the report](https://web.archive.org/web/20210301230721/https://www.psdevwiki.com/ps4/DS4-USB) so if you want to use it that will give you a great head start.

A fun thing to note - the XBox controllers don't work with this approach. They don't use a standard HID protocol and instead use [a proprietary protocol](https://gist.github.com/devkid/4b3bd50760504d1b93ea684cfd3ed895). It's possible to talk to them using the higher-level APIs or with the even more low-level [libusb](https://libusb.info/) (if you're brave).

## Wrapping up

This was a wild ride but I eventually got what I needed - getting gamepad events from a Python script without needing PyGame. If you find yourself in a similar situation this might be helpful, but keep in mind the big drawback that you have to translate the HID reports to gamepad state - and the reports are different across controllers. It is possible to use the [HID descriptor](https://eleccelerator.com/tutorial-about-usb-hid-report-descriptors/) to decode the reports, but this would require talking through the even more low-level `libusb`.
