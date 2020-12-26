import pathlib
from typing import Iterator, Sequence

import markdown
import markdown.extensions.fenced_code
import pymdownx.magiclink
import frontmatter
import jinja2

import highlighting
import witchhazel

jinja_env = jinja2.Environment(
    loader=jinja2.FileSystemLoader('templates'),
)

markdown_ = markdown.Markdown(
    extensions=[
        "toc",
        "admonition",
        "tables",
        "abbr",
        "attr_list",
        "footnotes",
        "pymdownx.smartsymbols",
        markdown.extensions.fenced_code.FencedCodeExtension(lang_prefix="language-"),
        pymdownx.magiclink.MagiclinkExtension(hide_protocol=False,)
    ]
)


def get_sources() -> Iterator[pathlib.Path]:
    return pathlib.Path('.').glob('srcs/*.md')


def parse_source(source: pathlib.Path) -> frontmatter.Post:
    post = frontmatter.load(str(source))
    return post


def fixup_styles(content: str) -> str:
    content = content.replace('<table>', '<table class="table">')
    return content


def render_markdown(content: str) -> str:
    markdown_.reset()
    content = markdown_.convert(content)
    content = highlighting.highlight(content)
    content = fixup_styles(content)
    return content


def write_post(post: frontmatter.Post, content: str):
    if post.get('legacy_url'):
        path = pathlib.Path("./docs/{}/index.html".format(post['stem']))
        path.parent.mkdir(parents=True, exist_ok=True)
    else:
        path = pathlib.Path("./docs/{}.html".format(post['stem']))

    template = jinja_env.get_template('post.html')
    rendered = template.render(post=post, content=content)
    path.write_text(rendered)


def write_posts() -> Sequence[frontmatter.Post]:
    posts = []
    sources = get_sources()

    for source in sources:
        post = parse_source(source)
        content = render_markdown(post.content)
        post['stem'] = source.stem
        write_post(post, content)

        posts.append(post)

    return posts


def write_pygments_style_sheet():
    css = highlighting.get_style_css(witchhazel.WitchHazelStyle)
    pathlib.Path("./docs/static/pygments.css").write_text(css)


def write_index(posts: Sequence[frontmatter.Post]):
    posts = sorted(posts, key=lambda post: post['date'], reverse=True)
    path = pathlib.Path("./docs/index.html")
    template = jinja_env.get_template('index.html')
    rendered = template.render(posts=posts)
    path.write_text(rendered)


def write_rss(posts: Sequence[frontmatter.Post]):
    posts = sorted(posts, key=lambda post: post['date'], reverse=True)
    path = pathlib.Path("./docs/feed.xml")
    template = jinja_env.get_template('rss.xml')
    rendered = template.render(posts=posts, root="https://blog.thea.codes")
    path.write_text(rendered)


def main():
    write_pygments_style_sheet()
    posts = write_posts()
    write_index(posts)
    write_rss(posts)


if __name__ == '__main__':
    main()
