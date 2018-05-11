---
title: Fixing the wrong bug to discover the right one
date: 2014-09-14
legacy_url: yes
---

Recently I was pulled in to help troubleshoot a issue with an application. The bug report stated that users were not able to load the home page. The application is an intranet that contains a couple hundred pages and a small amount of other content.

Luckily, we were easily able to reproduce the issue. We tried loading up the home page and we eventually hit [App Engine's 60 second deadline](https://developers.google.com/appengine/articles/deadlineexceedederrors) resulting in a 500 error.

Digging into the logic for the home page we found a likely culprit. The application displays a different home page based on which group the current user is in. This bit of logic determines which page to display:

```python

def find_home_page_for_user(user):
    for group in user.groups:
        query = Page.query()
        query = query.filter(Page.home_page_for_groups == group)
        page = query().get()
        if page:
            return page
```

It's relatively straightforward but it's easy to guess what might be eating all of our time. We're making a synchronous RPC call (``query.get()``) for every group the user is in. This had been working fine up to this point but we assumed some RPC latency was dragging the application down.

Because of my assumption, my first instinct was to go ahead and optimize this. Since there's only about 6 or so pages that operate as the home page for any group it makes sense to grab all those ahead of time and cache them.

```python
@caching.cache('home-pages')
def get_home_pages():
    return Page.query().filter(Page.is_a_home_page == True).fetch(20)


def find_home_page_for_user(user):
    pages = get_home_pages()
    for group in user.groups:
        for page in pages:
            if set(user.groups) & set(page.home_page_for_groups):
                return page
```

This optimization turned out to be fantastic. We reduced the response time from over 60s to 100-300ms dependening on cache. At this point we thought we were heroes and that we'd fixed the issue, however, just as I was ready to call it a day my colleague said "Wait- I'm getting the wrong home page. Did we mess up something?"

We tried with a couple of other users. We tried without caching. No matter what we did, users were going to the wrong home page and not the one their group membership said they should go to. At this point we think we're crazy- until we added some logging:

```python
def find_home_page_for_user(user):
    pages = get_home_pages()
    logging.info(user.groups)
    for group in user.groups:
        for page in pages:
            if set(user.groups) & set(page.home_page_for_groups):
                return page
```

It's at this point that we see something is very wrong. According to the Google Admin Console our test user is in two groups, but, according to the logging statement our user is in about 100 groups. This doesn't add up. Why does our application believe the user is in these groups?

We tried with other users and it turns out our application seems to think that every user is a member of every group in the domain. "Ah ha", we thought, "we probably somehow messed up and we're making the API call to the Google directory incorrectly". We assumed we'd left out the parameter to filter the returned groups by the user.

But much to our dismay, our client call seemed correct:

```python
groups = directory.groups().list(userKey=user.email()).execute()
```

We then verified the call and parameters in the documentation and the [APIs Explorer](https://developers.google.com/apis-explorer/#p/) and it appeared we were doing things the right way and that Google hadn't changed anything. However, our test with the API Explorer revealed something strange: no matter which email we passed in it returned the same results. For some reason, the API was ignoring the parameter and returning all groups.

We reported the issue to Google and they had it resolved within a few hours.

At this point we realize our original bug wasn't quite what we thought. It was not the system being fundamentally broken but rather the system failing under certain circumstances. If we look back at our original code:

```python
for group in user.groups:
    query = Page.query()
    query = query.filter(Page.home_page_for_groups == group)
    page = query().get()
    if page:
        return page
```

We can now see that the issue would've rarely, if ever, presented itself if our users are only in 3-4 groups on average. However, when the system believes the user to be in over 100 groups there's no way this will finish in 60 seconds as it will try to issue a query for every group in the domain (in the worst case). We optimized and fixed the wrong bug to find the right one.

I've heard "premature optimization is the root of all evil". Had we taken the time to add logging and make sure our assumptions were correct we would've fixed the right bug first and then optimized. However, we still had the luck of stumbling into discovering the real issue and making the system faster and more predictable in the process.
