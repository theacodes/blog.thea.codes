---
title: Github-flavored Markdown descriptions on PyPI
date: 2018-04-02
legacy_url: yes
description: The Python Package Index is now more approachable and beautiful.
---

Last month Dustin Ingram happily proclaimed that [PyPI supports Markdown Descriptions](https://dustingram.com/articles/2018/03/16/markdown-descriptions-on-pypi). This took a lot of work - go check out his wonderful blog post on everything it took to get there.

However, we weren't *quite* done. While PyPI supported [CommonMark](http://commonmark.org/), it did not support one of the most widely used variants of Markdown, [Github-Flavored Markdown](https://github.github.com/gfm/). This meant that users who were using the same `README.md` for both GitHub and PyPI wouldn't see any of the fancy GitHub-Flavored features on PyPI.

Well, we've fixed that. As of April 2018 PyPI now supports (and defaults to) GitHub-Flavored Markdown.

## See it in action

Dustin's original sample [project](https://pypi.org/project/markdown-description-example/) and [repo](https://github.com/di/markdown-description-example) still works, of course, but I went ahead and forked it and added some GitHub-Flavored Markdown examples. You can see this project [here](https://pypi.org/project/gfm-markdown-description-example/) and the source [here](https://github.com/theacodes/gfm-markdown-description-example).

What's so beautiful about all of this is you can continue to follow Dustin's [instructions on his blog](https://dustingram.com/articles/2018/03/16/markdown-descriptions-on-pypi) and you get GitHub-Flavored Markdown features automatically. Even projects that previously had broken descriptions because of missing features should see their descriptions fixed. :)

## A big round of thanks

None of this would have happened if it weren't for [Sumana Harihareswara](https://github.com/brainwane), [Dustin Ingram](https://github.com/di), and [Cosimo Lupo](https://github.com/anthrotype) (who helped me crack the Windows wheel building puzzle for [cmarkgfm](https://github.com/theacodes/cmarkgfm)). And of course, this is just building on the work of all the wonderful people who made Markdown descriptions possible in the first place.
