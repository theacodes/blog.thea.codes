---
title: Introducing KiCanvas
date: 2023-04-20
description: An interactive, browser-based viewer for KiCAD files
---

I'm really excited to share what I've been working on these last few months: [KiCanvas], an interactive, browser-based, open source viewer for KiCAD files.

<video controls>
  <source src="./demo.webm">
  <source src="./demo.mp4">
</video>

KiCanvas is **early alpha** but I feel it's time to let it out into the world for all of you to try out and break. Presently, KiCanvas functions as a **standalone web application** that can view **files stored on GitHub** - providing an easy way to share your designs with others. However, this is just the beginning of my plans for this project. You can head over to [kicanvas.org] right now to to try it out, but if you'd like to read on you can learn more about the history of the project and the future plans.

[KiCanvas]: https://kicanvas.org
[kicanvas.org]: https://kicanvas.org

## Status and roadmap

To re-iterate: KiCanvas is very much **early alpha**. For this initial version I wanted to focus on a specific use case: **easily sharing design files**. There's going to be bugs and missing features even within this very limited initial scope. I'm happy to get [feedback and bug reports][issues], that's the whole idea behind releasing early- just please be kind and remember it's not intended to be perfect yet. There's a list of [known issues and limitations][known issues] as well as an [FAQ].

As the current functionality stabilizes and matures, I'll start focusing on the remainder of the [roadmap]. The most important thing is the **Embedding API**, which will let folks embed schematics and boards within web pages - just like [the prototype below](#creating-kicanvas). It's my hope that this will make creating beautiful, interactive, informative hardware documentation easier. In the end, I hope to make it as easy as using an `<img>` or `<video>` tag:

```html
<kicanvas src="cool-schematic.kicad_sch"></kicanvas>
```

If you have thoughts about the embedding API or how you might want to use it, feel free to reach out on [GitHub][issues] or [Discord]. I'd love to hear your thoughts.

[issues]: https://github.com/theacodes/kicanvas/issues
[known issues]: https://github.com/theacodes/kicanvas#known-issues
[FAQ]: https://github.com/theacodes/kicanvas#faq
[roadmap]: https://github.com/theacodes/kicanvas#status-and-roadmap
[Discord]: https://discord.gg/UpfqghQ

## Origins

KiCanvas started as an absurd side quest: while I was writing *[Creating a pick and place control board with the RP2040][Starfish]* I wanted to show parts of the schematic in the article to help illustrate and explain how the project works. In the past, I've used screenshots and even re-illustrated using graphic design tools, but those approaches require time and can lead to pretty mixed results. So, in a fit of brilliant, ADHD-fueled recklessness, I wrote a quick and dirty parser and [Canvas]-based renderer for `.kicad_sch` files - just enough to embed the schematics I wanted in that article. The result was beautiful even if the code was chaotic:

<div>
  <kicad-schematic id="power-in-sch" src="../starfish-a-control-board-with-the-rp2040/power-in.kicad_sch">
    <img class="fallback" src="../starfish-a-control-board-with-the-rp2040/power-in.png"/>
    <div class="help">
      <button class="info" onclick="getElementById('power-in-sch').select_all()">click a symbol for more details <i class="far fa-question-circle"></i></button>
    </div>
  </kicad-schematic>
</div>

Thankfully, the article was well received and folks really liked the interactive schematics. This got me thinking - *why isn't there a browser based viewer for KiCAD files?* The closest thing we have is [InteractiveHtmlBom] but it only handles boards and requires a KiCAD plugin to generate the files ahead of time. I wanted a truly seamless experience - point it at a KiCAD file and it'll show it.

At the end of December, after working through various proof of concepts, I shared the [idea of KiCanvas] and asked for financial support to spend time creating it. I am absolutely blown away by the number of people who sponsored this project. Having a little financial security for a few months means so much to me. I also really appreciate everyone who spent time talking to me about how KiCanvas would be helpful to them.

[Starfish]: ./starfish-a-control-board-with-the-rp2040
[Canvas]: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API
[InteractiveHTMLBom]: https://github.com/openscopeproject/InteractiveHtmlBom
[idea of KiCanvas]: https://twitter.com/theavalkyrie/status/1608274303232970753

## Onward

I wanted to keep this post short and sweet and let you curious cats explore all of the various links here. I hope KiCanvas can eventually become something useful to the entire Open Hardware community. I'm so excited about the future of this project - it hasn't even reached its [final form]!

This is a project I'm truly creating for the community. It will always be free and open source. I'm thankful for everyone who's shown excitement, provided feedback, and supported me in various ways. I'd really like to thank the following people for their overwhelming support and kindness:

- [@mithro](https://github.com/mithro)
- [@jeremysf](https://github.com/jeremysf)
- [@blues](https://github.com/blues)
- [@bradanlane](https://github.com/bradanlane)
- [@timonsku](https://github.com/timonsku)
- [@todbot](https://github.com/todbot)
- [@friggeri](https://github.com/friggeri)
- [@voidmar](https://github.com/voidmar)
- [@casundra](https://github.com/casundra)
- [@ntpopgetdope](https://github.com/ntpopgetdope)
- [@ehughes](https://github.com/ehughes)
- [@guru](https://github.com/guru)
- [@jamesneal](https://github.com/jamesneal)
- [@calithameridi](https://github.com/calithameridi)
- [@jwr](https://github.com/jwr)
- [@forsyth](https://github.com/forsyth)
- [@mattimo](https://github.com/mattimo)
- [@mzollin](https://github.com/mzollin)

With that, go forward and share your designs and stay tuned for more!

[final form]: https://www.youtube.com/watch?v=6h0GRhIKgD8

<kicad-schematic-dialog></kicad-schematic-dialog>
<link rel="stylesheet" href="../starfish-a-control-board-with-the-rp2040/kicanvas/style.css" />
<link rel="stylesheet" href="../starfish-a-control-board-with-the-rp2040/kicanvas.css" />
<script type="module" src="../starfish-a-control-board-with-the-rp2040/kicanvas/kicanvas.js"></script>
