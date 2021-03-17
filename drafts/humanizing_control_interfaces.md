---
title: "Humanzing control interfaces"
date: 2021-02-17
legacy_url: yes
description: TODO
preview_image: TODO
---

OUTLINE

* Introduction
* Example: Light intensity
* Example: Joystick input
* Example: Tuning knob


We talk to our devices through all sorts of *physical, analog* inputs - knobs, touch screens, controllers, mice, accelerometers, etc. Often times, the raw data from these analog inputs are unsuitable to be used directly. They usually must be *filtered* and *transformed*.

It's common place for analog to digital conversion to involve some sort of *filtering*- for example, a low-pass filter can remove undesirable high-frequency noise like vibrations interfering with an accelerometer. You'll find lots of documentation and resources for optimizing the bandwidth for a given analog input signal.

However, sometimes this input data needs to be further transformed before it can be used to control some virtual or physical output. Think of video games where usually there isn't a 1:1 linear mapping between the joystick  input and the virtual character's movement. Often, there's an inner area of the joystick's range that translates to a single "walking" speed and an outer range that translates to a "running" speed.

!! TODO: Excerpt from a game manual show controls like above.

I've had a hard time finding significant literature about this topic. There's some disparate, isolated resources from separate fields like video games, animation, digital signal processing, control theory, etc. In this article I'll demonstrate some of the ways that you can transform (or *map*) an analog input signal to control some virtual or physical output. The purpose of these transformation is to give these controls a *human feel*- that is, the controls intuitively map to the user's *intention*.

In this article I'll walk through several examples that introduce concepts that build on each other to provide a robust toolset for mapping analog inputs into useful signals.


## Shedding some light on the situation

Let's talk about a familiar control: a light dimmer. This is a simple implementation of a digitally-controlled LED with a knob to control its brightness:

!! TODO: Fritzing drawing

As you turn the knob clockwise the brightness of the LED will increase. This design uses an analog to digital converter (ADC) to read the output from the potentiometer and then translates that to the LED's brightness. A naive approach would set the LED's brightness directly from the ADC's reading:

```python
led.brightness = adc.input
```

This little interactive illustration shows this approach:

<canvas id="led-1" width="1000" height="600" class="chart"></canvas>
<form class="canvas-controls" id="led-1-form">
    <div class="slider">
        <label for="brightness">Brightness</label>
        <input type="range" id="led-1-brightness" name="brightness"
                min="0" max="1.0" step="0.001" value="0.5">
    </div>
</form>

While this works, it isn't the best approach. It turns out that the human perception of the intensity of light isn't linear - it's somewhere between logarithmic and quadratic[^eyes]. Mapping the input to the brightness this way will make it more difficult for a person to achieve the desired brightness, especially at lower light level because small input changes will cause large changes in the perceived brightness.

Changing the program to transform the input signal using a [power function]() makes the control feel more natural:

```
led.brightness = pow(adc.input, 2)
```

Play around this with interactive illustration. The naive approach is on the left and the power function approach is on the right. You should notice that the brightness on the right changes in a much more "natural" way and that it's easier to control the brightness towards the lower end:

<canvas id="led-2" width="1000" height="600" class="chart"></canvas>
<form class="canvas-controls" id="led-2-form">
    <div class="slider">
        <label for="brightness">Brightness</label>
        <input type="range" id="led-2-brightness" name="brightness"
                min="0" max="1.0" step="0.001" value="0.5">
    </div>
</form>

It's sometimes easier to see this effect when the responses are plotted this way (naive on top, power function on the bottom):

<canvas id="led-3" width="1000" height="300" class="chart"></canvas>

And this graph shows the naive, *linear* output in red and the adjusted, *power function* output in blue:

<canvas id="led-4" width="1000" height="600" class="chart"></canvas>


This specific strategy is called [*Gamma correction*](). It's used all over the place in computer graphics but also comes in to play when [driving RGB LEDs](https://hackaday.com/2016/08/23/rgb-leds-how-to-master-gamma-and-hue-for-perfect-brightness/).


Taking a higher-level view, this was accomplished by applying some *transfer function* that transformed the raw input value into a suitable value to be used to drive the output. This is the heart of this article- this same principle shows up all over the place.

[^eyes]: The human eye's perception of brightness is *super* complex and depends on all sorts of external factors but for this purposes of this example it can be approximated as a logarithmic function.


## Hello, can you hear me?

It turns out the light dimmer example is equally applicable to other human senses, notably, controlling the volume of a sound. We also perceive loudness (or volume) logarithmically. Therefore, if you wanted to make a volume control that feels natural to people, you'd want to make it use the same kind of exponential transformation.

Try it out with the following two audio samples. The first one's volume control is linear and the second is exponential.


Start with the volume all the way down and try to slightly increase the volume. You'll notice it's much easier and smoother feeling with the exponential response.


## Easy, now

In the field of animation these sorts of transfer functions often are applied to the way objects move. In this context, they are called an [**easing**]() or a [**curve**](). It turns out that very few things look natural when they move in a linear fashion, so easings are used to introduce and control the *acceleration* of a animation- the rate of change over time. Try it out with this interactive animation that lets you look at some common easing functions:

<canvas id="easing" width="1000" height="600" class="chart"></canvas>
<canvas id="easing-animation" width="1000" height="200" class="chart"></canvas>
<form class="canvas-controls" id="easing-form">
  <div class="input-group">
    <label for="easing-form-easing">Easing function</label>
    <select class="form-control" id="easing-form-easing" name="easing">
      <option value="in_quad">Quadratic in</option>
      <option value="out_quad">Quadratic out</option>
      <option value="in_cubic">Cubic in</option>
      <option value="out_cubic">Cubic out</option>
      <option value="in_expo">Exponential in</option>
      <option value="out_expo">Exponential out</option>
    </select>
  </div>
  <div class="input-group buttons">
    <button type="button" id="easing-play" class="btn btn-lg btn-block btn-primary">Play</button>
  </div>
</form>

Notice that the animations cover the same amount of distance, but the animation with the easing applied has a distinct acceleration.

This is exactly the same approach used for the light dimmer and volume control examples above, just applied in a different context. It turns out there's all sorts of [useful easing functions]() and you can use them to introduce and control the acceleration or *response curve* of *any* system that maps input to control output.


## The dead zone

Okay, so hopefully you've got an idea of the basic concept here: transform the input signal before applying it to the output to get a better, more human feel.

Now I'm going to step back from easing and curves and show you another useful approach - dead zones.

To demonstrate this I'll use a game controller joystick input:

!! TODO: Illustration of a joystick

You can think of joysticks as two analog inputs: one for the x-axis and one for the y-axis. Using both of them you can plot the position of the joystick:

!! TODO: Joystick non-interactive animation?

A simple method of using a joystick to control a player character in a game is to move the player character by a constant amount based on the joystick's position:

```python
if joystick_x > 0:
  player_x += 1
elif joystick_x < 0:
  player_x -= 1
else:
  # Joystick is centered on the x-axis, don't move horizontally.

if joystick_y > 0:
  player_y += 1
elif joystick_y < 0:
  player_y -= 1
else:
  # Joystick is centered on the y-axis, don't move vertically.
```

!! TODO: Simple movement animation

However, joysticks are physical devices and therefore aren't perfect. When a joystick is in its center position the measurements from the analog inputs won't be exactly `(0, 0)` as you might expect. Generally, joysticks measurements will be a little off-center (an **offset**) and will jump around a bit from reading-to-reading (**noise**).

This can be frustrating for the player if the joystick's readings are applied in the simple way shown above. Take a look at the following little animation where I've added noise and offset. To the player, the joystick is appears centered but because of the real-world characteristics causing measurement errors the character is moving around all on its own!

!! TODO: animation with bad joystick input

Many games will solve this using a **"dead zone"** (also called a *[dead band]()*). The dead zone is simply a region in the middle of the joystick's range that always reads as `(0, 0)`. A simple approach is to define the deadzone as a small circular area in the middle of the joystick's range:

!! TODO: picture of deadzone.

This can be accomplished with a [piecewise function]() similar to this:

```python
dead_zone_radius = 0.1

if joystick_x < dead_zone_radius:
  player_x -= 1
elif joystick_x > -dead_zone_radius:
  player_x += 1
else:
  # Joystick is in the dead zone, don't move the player.
  pass

if joystick_y < dead_zone_radius:
  player_y -= 1
elif joystick_y > -dead_zone_radius:
  player_y +=1
else:
  # Joystick is in the dead zone, don't move the player.
  pass
```

Applying this technique to the little game above makes the experience much better:

!! TODO: game with fixed joystick input

Dead zones can be *super useful* when dealing with real-world sensor input since they often exhibit non-ideal characteristics like noise, offsets, and non-linear behavior near the edges of their range.

## Sneak king

The dead zone approach works well for the simple example above where the output is *binary*- in that case, the little player character is either moving or not, there's no way to have fine control over the speed of that movement.

For some games that's totally acceptable, however, that approach throws away a lot of the usefulness of having an analog input as the control interface! Lots of video games take advantage of the analog input and use the joystick's position to calculate how fast the player character should move.

!! TODO: animation/video of slowly walking, or except from game manual?

This appears deceptively easy to implement:

```python
max_speed = 2
player_x += joystick_x * max_speed;
player_y += joystick_y * max_speed;
```

But of course, real-world non-ideal characteristics of measuring analog inputs shows up to complicate things. Here's an animation showing how that approach responds when noise and offset are introduced:

!! TODO: Animation

Okay, so this has some of the same problems as the binary approach from the previous section. You can apply the dead zone approach:

```python
max_speed = 2
dead_zone_radius = 0.1

if joystick_x < dead_zone_radius or joystick_x > -dead_zone_radius:
  player_x += joystick_x * max_speed;
else:
  # Joystick is in the dead zone, don't move the player.
  pass

if joystick_y < dead_zone_radius or joystick_y > -dead_zone_radius:
  player_y += joystick_y * max_speed;
else:
  # Joystick is in the dead zone, don't move the player.
  pass
```

!! TODO: Animation

It definitely helps but you might notice one little surprising thing: if you slowly move the joystick from the center outwards, when the joystick leaves the dead zone the player character "jumps" forward. Take a look at this plot of the above transfer function:

!! TODO: Plot

Notice that there's a *big* jump in movement speed at the edge of the dead zone. That's why this is occuring- the dead zone is obscuring the lower end of the movement speed range:

!! TODO: picture of this

This can be solved by *re-mapping* the range of the joystick after it leaves the dead zone:

!! TODO: Picture of this

Here's one way this could be implemented:

```python
def remap(value, src_low, src_high, dst_low, dst_high):
  normalized_value = (src_low + value) / (src_high - src_low)
  return dst_low + (dst_high - dst_low) * normalized_value

max_speed = 2
dead_zone_radius = 0.1

if joystick_x < dead_zone_radius or joystick_x > -dead_zone_radius:
  player_x += remap(joystick_x, dead_zone_radius, 1.0, 0.0, 1.0) * max_speed;
else:
  # Joystick is in the dead zone, don't move the player.
  pass

if joystick_y < dead_zone_radius or joystick_y > -dead_zone_radius:
  player_y += remap(joystick_y, dead_zone_radius, 1.0, 0.0, 1.0) * max_speed;
else:
  # Joystick is in the dead zone, don't move the player.
  pass
```

This makes the implementation a little more complex, but it makes the interactions feel a lot better:

!! TODO: Interactive animation

## Enough games

At this point I'm going to move on from the example of video game input. There's *lots* that can be done with joystick input and transforming it before applying it to some action- there's definitely lots of literature and resources for this. You can combine the dead zone and re-mapping approaches above with the *easings/curves* with interesting and sometimes useful effects. Games generally employ pretty sophisticated transformation functions for translating the measurements from the joystick into *user intent*. If you're interested in more on this specific area, I'd recommend the book [*Game Feel*]().

At this point you've learned about three useful approaches to processing real-world measurements:

* Non-linear response curves (also referred to as *easings*)
* Dead zones (also referred to as *dead bands*)
* Range re-mapping


## Bézier curves & splines

Now I'm going to introduce you to my favorite tool for this problem set: [Bézier curves](https://en.wikipedia.org/wiki/B%C3%A9zier_curve). Even if you've never heard of these before you've definitely seem them. In fact, you're look at some right now! Fonts are generally composed of several Bézier curves (a *Bézier spline*):

!! TODO: Picture of Bézier curves in a font

While Bézier curves are widely used for graphics, they show up all over the place. The easings used for animations mentioned above can all be accomplished using Bézier curves- [CSS does just this](https://developer.mozilla.org/en-US/docs/Web/CSS/easing-function). They also show up in *user interfaces* and *controls* - which is exactly what we're talking about here.

A [cubic](), one-dimensional Bézier curve can be used just like the transfer functions I've covered so far in this article. A cubic Bézier curve has *four* control points, `p0, p1, p2, p3`. You can think of `p0` and `p3` as the "anchors" - they're the minimum and maximum output. You can think of `p1` and `p2` as "handles". Take a moment to see how moving the handles impacts the output:

!! TODO: Interactive bezier thing

When applying Bézier curves as transfer functions for controls, you would choose the anchors (`p0` and `p3`) to match your desired output range (such as `0.0` and `1.1`) and you'd choose the "handles" (`p1` and `p2`) to define the response curve. I've taken the LED example from the beginning of this article and implemented it using a Bézier curve:

```python
TODO
```

!! TODO: Interactive illustration.

While using Bézier curves in this specific instance might be overkill, in general, using Bézier curves and splines grant you a significant amount of flexibility. These are an indispensible approach of to have in your tool kit.

## Tune up

I want to show you a specific example where Bézier curves are *awesome*.




Idea: tuning! use web audio to play notes. :)

<canvas id="test" width="1000" height="600" class="chart"></canvas>
<form class="canvas-controls" id="test-form">
    <div class="slider">
        <label for="nonlinearity">Non-linearity</label>
        <input type="range" id="test-nonlinearity" name="nonlinearity"
                min="0" max="1.0" step="0.001" value="0.4">
    </div>
    <div class="output">
        <label for="test_input">Input</label>
        <input type="range" id="test-input-slider" name="slider"
                min="0.0" max="1.0" step="0.001" value="0.5">
        <canvas id="test-input-canvas" width="640" height="50" class=""></canvas>
        <label for="test_output">Output</label>
        <canvas id="test-output-canvas" width="640" height="50" class=""></canvas>
    </div>
</form>

<script type="text/javascript" src="/static/humanizing/animations.js"></script>
<link rel="stylesheet" type="text/css" href="/static/humanizing/animations.css">
