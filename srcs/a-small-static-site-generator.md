---
title: Writing a small static site generator
date: 2018-05-11
legacy_url: yes
description: How I created a small markdown-based static site generator for my blog.
---

There are like, a hundred different static site generators written in Python (and even more written in other languages).

So I decided to write my own. Why? Well, I just kind of wanted to. I had a
desire to move my blog away from [Ghost](https://ghost.org/) and I wanted to keep things really minimalistic. I decided to use [GitHub Pages](https://pages.github.com/) to host the output as they recently announced support for [SSL for custom domains](https://blog.github.com/2018-05-01-github-pages-custom-domains-https/).

## Rendering content

Every static site generator needs to take some source format (like Markdown or ReStructuredText) and turn it into HTML. Since I was moving from Ghost I decided to stick with Markdown.

Since I recently integrated [Github-flavored Markdown](https://github.github.com/gfm/) rendering into [Warehouse](https://github.com/pypa/warehouse), I decided to use the underlying library I made for that - [cmarkgfm](https://pypi.org/project/cmarkgfm). Rendering Markdown to HTML with `cmarkgfm` looks something like this:

```python
import cmarkgfm


def render_markdown(content: str) -> str:
    content = cmarkgfm.markdown_to_html_with_extensions(
        content,
        extensions=['table', 'autolink', 'strikethrough'])
    return content
```

`cmarkgfm` does have convenience method called `github_flavored_markdown_to_html`, but it uses GitHub's [tagfilter](https://github.github.com/gfm/#disallowed-raw-html-extension-) extension which isn't desirable when I want to embed scripts and stuff into posts. So I just hand-picked the extensions I wanted to use.


## Collecting sources

Okay, we have a way to render Markdown but we also need a way to collect all
of our source files. I decided to store all of sources under `./src`. We can
use [`pathlib`](https://docs.python.org/3/library/pathlib.html) to collect them all:

```python
import pathlib
from typing import Iterator


def get_sources() -> Iterator[pathlib.Path]:
    return pathlib.Path('.').glob('srcs/*.md')
```

## Frontmatter

Many static site generators have a concept of *frontmatter*- a way to set metadata and such for each source file. I wanted to support frontmatter that 
let me to set a date and title for each post. It looks like this:

```markdown
---
title: Post time
date: 2018-05-11
---

# Markdown content here.
```

There's a really nice and simple existing library for frontmatter called [python-frontmatter](https://pypi.org/project/python-frontmatter/). I can use
this to extract the frontmatter and the the raw content:

```python
import frontmatter


def parse_source(source: pathlib.Path) -> frontmatter.Post:
    post = frontmatter.load(str(source))
    return post
```

The returned `post` object has `.content` property that has the post content and otherwise acts as a dictionary to fetch the frontmatter keys.

## Rendering the posts

Now that we have the post content and frontmatter, we can render them. I decided to use [jinja2](https://pypi.org/project/jinja2) to place the `cmarkgfm`-rendered post Markdown and frontmatter into a simple HTML template.

Here's the template:

```html
<!doctype html>
<html>
<head><title>{{post.title}}</title></head>
<body>
  <h1>{{post.title}}</h1>
  <em>Posted on {{post.date.strftime('%B %d, %Y')}}</em>
  <article>
    {{content}}
  </article>
</body>
</html>
```

And here's the Python code to render it:

```python
import jinja2

jinja_env = jinja2.Environment(
    loader=jinja2.FileSystemLoader('templates'),
)


def write_post(post: frontmatter.Post, content: str):
    path = pathlib.Path("./docs/{}.html".format(post['stem']))

    template = jinja_env.get_template('post.html')
    rendered = template.render(post=post, content=content)
    path.write_text(rendered)
```

Notice that I store the rendered HTML in `./docs`. This is because I configured GitHub Pages to publish content from the [doc directory](https://help.github.com/articles/configuring-a-publishing-source-for-github-pages/#publishing-your-github-pages-site-from-a-docs-folder-on-your-master-branch).

Now that we can render a single post, we can loop through all of the posts using the `get_sources` function we created above:

```python
from typing import Sequence


def write_posts() -> Sequence[frontmatter.Post]:
    posts = []
    sources = get_sources()

    for source in sources:
        # Get the Markdown and frontmatter.
        post = parse_source(source)
        # Render the markdown to HTML.
        content = render_markdown(post.content)
        # Write the post content and metadata to the final HTML file.
        post['stem'] = source.stem
        write_post(post, content)

        posts.append(post)

    return posts
```

## Writing the index

We can now render posts but we should also render a top-level `index.html` that lists all of the posts. We can do this with another jinja2 template and the list of posts returned from `write_posts`.

Here's the template:

```html
<!doctype html>
<html>
<body>
  <h1>My blog posts</h1>
  <ol>
    {% for post in posts %}
    <li>
      <a href="/{{post.stem}}">{{post.title}}</a>
    <li>
    {% endfor %}
  </ol>
</body>
</html>
```


And here's the Python code to render it:

```python
def write_index(posts: Sequence[frontmatter.Post]):
    # Sort the posts from newest to oldest.
    posts = sorted(posts, key=lambda post: post['date'], reverse=True)
    path = pathlib.Path("./docs/index.html")
    template = jinja_env.get_template('index.html')
    rendered = template.render(posts=posts)
    path.write_text(rendered)
```

## Finishing up

All that's left now is to just wire this all up using a `main` function.

```python
def main():
    posts = write_posts()
    write_index(posts)


if __name__ == '__main__':
    main()
```

## Check this out on GitHub

So the page you're reading now was rendered with this code! You can go and see the full source code for this, including syntax highlighting support, over at [theacodes/blog.thea.codes](https://github.com/theacodes/blog.thea.codes/)
