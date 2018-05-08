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
    content = cmarkgfm.markdown_to_html_with_extensions(
        content,
        extensions=['table', 'autolink', 'strikethrough'])
    content = _highlight(content)
    return content


def write_post(post, content):
    path = pathlib.Path("./docs/{}.html".format(post['stem']))
    template = jinja_env.get_template('post.html')
    rendered = template.render(post=post, content=content)
    path.write_text(rendered)


def write_legacy_redirect(post):
    path = pathlib.Path("./docs/{}/index.html".format(post['stem']))
    path.parent.mkdir(parents=True, exist_ok=True)
    template = jinja_env.get_template('redirect.html')
    rendered = template.render(post=post)
    path.write_text(rendered)


def make_pygments_style_sheet():
    formatter = pygments.formatters.HtmlFormatter(
        style=witchhazel.WitchHazelStyle)
    css = formatter.get_style_defs('pre')
    pathlib.Path("./docs/static/pygments.css").write_text(css)


def write_index(posts):
    path = pathlib.Path("./docs/index.html")
    template = jinja_env.get_template('index.html')
    rendered = template.render(posts=posts)
    path.write_text(rendered)


def main():
    make_pygments_style_sheet()

    posts = []
    sources = get_sources()

    for source in sources:
        post = load_source(source)
        content = render_markdown(post.content)
        post['stem'] = source.stem
        write_post(post, content)

        if post.get('legacy_redirect'):
            write_legacy_redirect(post)

        posts.append(post)

    posts = sorted(posts, key=lambda post: post['date'], reverse=True)
    write_index(posts)


if __name__ == '__main__':
    main()
