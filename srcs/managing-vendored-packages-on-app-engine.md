---
title: Managing vendored packages on App Engine
date: 2014-09-02
legacy_url: yes
---

**N.B.:** You don't need to follow this post anymore. I've gotten this functionality built-in to the Google App Engine standard environment. See the [official documentation](https://cloud.google.com/appengine/docs/standard/python/tools/using-libraries-python-27).

Recently I had a discussion with [Michael Bernstein](http://github.com/webmaven) about vendoring packages in App Engine projects and some of the headaches that come with doing that. We worked together to solve various issues, both in what [we were doing](https://github.com/GoogleCloudPlatform/appengine-python-bottle-skeleton/pull/12) and with the [tools available](https://github.com/pypa/pip/pull/2007) to us. This post is intended to catalogue my personal approach to vendoring in App Engine.

### The problem

Even trivial python web applications often need one or more third-party packages. The generally agreed way to do this is to simple use ``pip install`` to make it happen. Modern development and deployment practices usually require each application to have its own [virtualenv](http://virtualenv.readthedocs.org/en/latest/) to isolate application-specific packages from system-wide packages. This is absolutely fantastic and perfectly follows the guidelines laid out in the [twelve-factor app](http://12factor.net/dependencies).

Unfortunately, those of us using App Engine do not have proper virtualenv support. In an ideal world we would create our ``requirements.txt`` and the app engine runtime would take care of the rest (downloading, installing, and wiring these packages in a virtualenv). This means we have to resort to vendoring.

### What is vendoring?

Vendoring is when you essentially bundle third-party dependencies within your application's source tree. It's an [anti-pattern](https://gist.github.com/datagrok/8577287), but it's the only choice we've got. What you end up with is a folder structure that looks like this:

    my-application/
    - handlers/
      - cool_feature.py
    - lib/
      - requests
      - oauth2client
      ...

Some people call the vendor folder ``lib`` (like me) some call it ``vendor`` or ``third-party`` and so on. It doesn't matter what you call it; the idea is the same. We're installing (or copying) all of our dependencies into a folder within our application instead of "properly" installing them in a virtualenv or system-wide.

### How to vendor with App Engine

In theory it's simple. You essentially need two things:

1. A way to install packages into your application's. ``lib`` folder
2. A way to import things from the ``lib`` folder.


### Installing packages

We can use ``pip`` along with the ``--target`` argument to install packages:

    pip install --target=lib requests

Even better though is to keep a ``requirements.txt`` file in our project.

    requests==2.4.0
    google-api-python-client==1.2

And then install them all in one command:

    pip install --target=lib -r requirements.txt

If you're using ``requirements.txt`` it's also a good idea to avoid adding your ``lib`` folder to your version control system. Add the ``lib`` folder to ``.gitignore`` (or similar) and be sure to let collaborators know that an additional step is required when cloning/pulling.

As of the time of writing there is currently an [issue with pip](https://github.com/pypa/pip/issues/1489) that's preventing the updating of packages. I have submitted a [pull request](https://github.com/pypa/pip/pull/2007) to fix this and it should hopefully make it into the next release.

Once this fix lands you can upgrade packages as expected:

    pip install --upgrade --target=lib requests

Until then you'll first need to remove any installed versions of the library as well as any ``egg-info`` or ``dist-info`` files.

### Using Packages

We've got the packages vendored into our application but how do we actually use them? If you were brave enough to try ``import requests`` at this point you would've been greeted with an ``ImportError``. With App Engine we need to do a bit of path manipulation to make things work correctly.

To setup our path manipulation we have to create (or modify) the ``appengine_config.py`` file in our application's root directory. The filename is important and it must also live in the same directory as your ``app.yaml``.

```python
"""
`appengine_config.py` gets loaded every time a new instance is started.

Use this file to configure app engine modules as defined here:
https://developers.google.com/appengine/docs/python/tools/appengineconfig
"""


def add_vendor_packages(vendor_folder):
    """
    Adds our vendor packages folder to sys.path so that third-party
    packages can be imported.
    """
    import site
    import os.path
    import sys

    # Use site.addsitedir() because it appropriately reads .pth
    # files for namespaced packages. Unfortunately, there's not an
    # option to choose where addsitedir() puts its paths in sys.path
    # so we have to do a little bit of magic to make it play along.

    # We're going to grab the current sys.path and split it up into
    # the first entry and then the rest. Essentially turning
    #   ['.', '/site-packages/x', 'site-packages/y']
    # into
    #   ['.'] and ['/site-packages/x', 'site-packages/y']
    # The reason for this is we want '.' to remain at the top of the
    # list but we want our vendor files to override everything else.
    sys.path, remainder = sys.path[:1], sys.path[1:]

    # Now we call addsitedir which will append our vendor directories
    # to sys.path (which was truncated by the last step.)
    site.addsitedir(os.path.join(os.path.dirname(__file__), vendor_folder))

    # Finally, we'll add the paths we removed back.
    sys.path.extend(remainder)

# Change 'lib' to whichever directory you use for your vendored packages.
add_vendor_packages('lib')
```

The code above is the result of a lot of fumbling. This is so easy to get wrong and it's easy to make it only work halfway. It probably still doesn't cover every edge case. If you find problems with it please let me know as I will gladly update this code to fix it. Big thanks again to [Michael](https://github.com/webmaven) for helping this work with namespaced packages.

### Conclusion

Vendoring with App Engine requires:

1. Installing your packages with ``pip install --target=lib``.
2. Using ``appengine_config.py`` to modify ``sys.path`` to include your vendor folder.

I've used the guidelines laid out here extensively in almost every project I've put together over the last few years. While I'm still waiting for true virtualenv support in App Engine I think that this setup works well enough for now.
