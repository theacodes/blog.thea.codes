import datetime
import pathlib
from typing import Sequence
import shutil

import markdown
import markdown.extensions.fenced_code
import markdown_link_attr_modifier
import pymdownx.magiclink
import frontmatter
import jinja2

import highlighting
import witchhazel

jinja_env = jinja2.Environment(
    loader=jinja2.FileSystemLoader("templates"),
)
jinja_env.globals["current_year"] = datetime.datetime.now().year

markdown_ = markdown.Markdown(
    extensions=[
        "toc",
        "admonition",
        "tables",
        "abbr",
        "attr_list",
        "footnotes",
        "pymdownx.smartsymbols",
        "pymdownx.tilde",
        "pymdownx.caret",
        markdown.extensions.fenced_code.FencedCodeExtension(lang_prefix="language-"),
        pymdownx.magiclink.MagiclinkExtension(
            hide_protocol=False,
        ),
        markdown_link_attr_modifier.LinkAttrModifierExtension(
            new_tab="external_only", custom_attrs=dict(referrerpolicy="origin")
        ),
    ]
)


def copy_static():
    pathlib.Path("./docs").mkdir(parents=True, exist_ok=True)
    shutil.copytree(
        pathlib.Path("./static"), pathlib.Path("./docs/static"), dirs_exist_ok=True
    )


def get_sources():
    yield from pathlib.Path(".").glob("srcs/*.md")
    yield from pathlib.Path(".").glob("srcs/*/index.md")


def parse_source(source: pathlib.Path) -> frontmatter.Post:
    post = frontmatter.load(str(source))
    return post


def fixup_styles(content: str) -> str:
    content = content.replace("<table>", '<table class="table">')
    return content


def render_markdown(content: str) -> str:
    markdown_.reset()
    content = markdown_.convert(content)
    content = highlighting.highlight(content)
    content = fixup_styles(content)
    return content


def write_post(post: frontmatter.Post, content: str):
    dst = pathlib.Path(f"./docs/{post['stem']}")
    dst.mkdir(parents=True, exist_ok=True)

    index = dst / "index.html"

    template = jinja_env.get_template("post.html")
    rendered = template.render(post=post, content=content)

    index.write_text(rendered)


def copy_post_resources(post: frontmatter.Post):
    src = post["source"].parent
    dst = pathlib.Path(f"./docs/{post['stem']}")
    dst.mkdir(parents=True, exist_ok=True)

    shutil.copytree(src, dst, dirs_exist_ok=True)


def write_posts() -> Sequence[frontmatter.Post]:
    posts = []
    sources = get_sources()

    for source in sources:
        post = parse_source(source)
        content = render_markdown(post.content)

        post["source"] = source
        if source.match("*/index.md"):
            post["stem"] = source.parent.name
            copy_post_resources(post)
        else:
            post["stem"] = source.stem

        write_post(post, content)

        posts.append(post)

    return posts


def write_pygments_style_sheet():
    css = highlighting.get_style_css(witchhazel.WitchHazelStyle)
    pathlib.Path("./docs/static/pygments.css").write_text(css)


def write_index(posts: Sequence[frontmatter.Post]):
    posts = sorted(posts, key=lambda post: post["date"], reverse=True)
    path = pathlib.Path("./docs/index.html")
    template = jinja_env.get_template("index.html")
    rendered = template.render(posts=posts)
    path.write_text(rendered)


def write_rss(posts: Sequence[frontmatter.Post]):
    posts = sorted(posts, key=lambda post: post["date"], reverse=True)
    path = pathlib.Path("./docs/feed.xml")
    template = jinja_env.get_template("rss.xml")
    rendered = template.render(posts=posts, root="https://blog.thea.codes")
    path.write_text(rendered)


def write_cname():
    pathlib.Path("./docs/CNAME").write_text("blog.thea.codes")


def main():
    copy_static()
    write_pygments_style_sheet()
    posts = write_posts()
    write_index(posts)
    write_rss(posts)
    write_cname()


if __name__ == "__main__":
    main()
