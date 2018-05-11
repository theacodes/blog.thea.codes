import datetime
import pathlib

import cmarkgfm
import frontmatter
import jinja2

import highlighting
import witchhazel

jinja_env = jinja2.Environment(
    loader=jinja2.FileSystemLoader('templates'),
)


def get_sources() -> pathlib.Path:
    return pathlib.Path('.').glob('srcs/*.md')


def load_source(source: pathlib.Path) -> dict:
    post = frontmatter.load(str(source))
    return post


def render_markdown(content: str) -> str:
    content = cmarkgfm.markdown_to_html_with_extensions(
        content,
        extensions=['table', 'autolink', 'strikethrough'])
    content = highlighting.highlight(content)
    return content


def write_post(post: dict, content: str) -> str:
    if post.get('legacy_url'):
        path = pathlib.Path("./docs/{}/index.html".format(post['stem']))
        path.parent.mkdir(parents=True, exist_ok=True)
    else:
        path = pathlib.Path("./docs/{}.html".format(post['stem']))

    template = jinja_env.get_template('post.html')
    rendered = template.render(post=post, content=content)
    path.write_text(rendered)


def write_posts() -> list[dict]:
    posts = []
    sources = get_sources()

    for source in sources:
        post = load_source(source)
        content = render_markdown(post.content)
        post['stem'] = source.stem
        write_post(post, content)

        if isinstance(post['date'], datetime.datetime):
            post['date'] = post['date'].date()

        posts.append(post)

    return posts


def write_pygments_style_sheet():
    css = highlighting.get_style_css(witchhazel.WitchHazelStyle)
    pathlib.Path("./docs/static/pygments.css").write_text(css)


def write_index(posts: list[dict]):
    posts = sorted(posts, key=lambda post: post['date'], reverse=True)
    path = pathlib.Path("./docs/index.html")
    template = jinja_env.get_template('index.html')
    rendered = template.render(posts=posts)
    path.write_text(rendered)


def main():
    write_pygments_style_sheet()
    posts = write_posts()
    write_index(posts)


if __name__ == '__main__':
    main()
