import pathlib

import cmarkgfm
from readme_renderer.markdown import _highlight
import frontmatter
import jinja2
import pygments.formatters

import witchhazel

jinja_env = jinja2.Environment(
    loader=jinja2.FileSystemLoader('templates'),
)


def get_sources():
    return pathlib.Path('.').glob('srcs/*.md')


def load_source(source):
    post = frontmatter.load(str(source))
    return post


def render_markdown(content):
    content = cmarkgfm.github_flavored_markdown_to_html(content)
    content = _highlight(content)
    return content


def write_post(slug, post, content):
    path = pathlib.Path("./docs/{}.html".format(slug))
    template = jinja_env.get_template('post.html')
    rendered = template.render(post=post, content=content)
    path.write_text(rendered)


def make_pygments_style_sheet():
    formatter = pygments.formatters.HtmlFormatter(
        style=witchhazel.WitchHazelStyle)
    css = formatter.get_style_defs('pre')
    pathlib.Path("./docs/static/pygments.css").write_text(css)


def main():
    make_pygments_style_sheet()

    sources = get_sources()

    for source in sources:
        post = load_source(source)
        content = render_markdown(post.content)
        write_post(source.stem, post, content)


if __name__ == '__main__':
    main()
