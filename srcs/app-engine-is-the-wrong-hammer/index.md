---
title: App Engine is (sometimes) the wrong hammer.
date: 2014-09-25
legacy_url: yes
---

I **love** Google App Engine. I've spent over 3 years working with the platform - building apps inside of App Engine's limitations long before the rest of the Cloud Platform had come to light. Because I've been working with App Engine so long it's become my hammer of choice, my *Mjolnir*.

We all know the problem with hammers. If you have a hammer, every problem looks like a nail. If you have the hammer of the Gods, you just keep hammering until it works.

### Syncing Users

I found myself recently tied up in this madness. We've created various applications that utilize information from the [Google Directory API](https://developers.google.com/admin-sdk/directory/). We use it for enterprise applications to be able to gather information about the logged-in user such their real name, group memberships, photos, etc.

The task of syncing the directory is where my hammer logic became a folly.

Because the Google Directory API imposes some rather low quotas it's impractical for us to fetch the information for the users on-demand. What we do instead is sync an entire copy of the directory's users and groups on a regular (such as nightly) basis. There are also provisions in the API to get [push notifications for users](https://developers.google.com/admin-sdk/directory/v1/guides/push) which we take advantage of.

The first iteration of this sync is fairly straightforward:

 1. Fetch all of the users in the domain and save them to the datastore.
 2. Fetch all of the groups in the domain and save them to the datastore.

We implemented this via the task queue- which is a fantastic choice for this kind of work. We spin off two tasks and they churn through the API and save their respective data models.

### Problem one - group membership
At this point my hammer served me well- but then we had an application that required us to determine group membership. Our task pipeline immediately became more complex:

 1. Fetch all of the users in the domain and save them to the datastore.
 2. Fetch all of the groups in the domain and save them to the datastore.
 3. When the users are done syncing, go through each user in the datastore and query for the groups that they belong to and update the user's record.

We could've fetched the groups while fetching all of the users, but we found it faster to do is this way because it's more parallelizable. This also worked well enough in the task queue - sure, it tended to have to retry due to either quota issues or 5xx errors from the Directory API, but none of the directories we worked with so far had any issues. It was clear to me at this point that our approach was beginning to smell.

### Problem two - nested groups

Surprisingly you can nest a Google group within another group. This means you can have a relationship like this:

    - all-hr@domain.com
        - hr-admins@domain.com
            - susie@domain.com
        - hr-counselors@domain.com
            - george@domain.com

We came across an application that used groups to determine access control to items. For example, you could have *Ticket 102* with access granted only to ``hr-admins@domain.com``. This means that ``susie`` above would be able to see it where ``george`` wouldn't.

During testing of this application it was brought to our attention that it was desired to give ``all-hr@domain.com`` access to an item and implicitly grant ``susie`` and ``george`` access. When we ask the API which groups a user is in it only tells us their *immediate* groups. We have to go and figure out the group-parent relationship ourselves.

This caused huge problems with our task pipeline, because now we have this monstrosity:

 1. Fetch all of the users in the domain and save them to the datastore.
 2. Fetch all of the groups in the domain and save them to the datastore.
 3. When the groups are done syncing, go through each group and determine all of the direct members of that group.
 4. When the users, groups, and group members are done syncing, go through each user and query each group that they're a direct member of. Then, for each of these direct groups do a recursive lookup to determine all ancestors.

Expressing that last step with the task queue and datastore is very difficult. Not having all of the data in memory means lots of RPCs and look ups to make it happen. There's no practical way to keep it all in memory as App Engine's instance classes aren't particularly suited for this workload. The code was complex and hard to understand but worked for the most part.

### Problem three - scale changes everything

This worked for smaller domains (around 10,000 users and 200-300 groups). But we came across a domain with daunting size: 250,000 users and 10,000 groups.

This caused a host of problems:

 1. As mentioned above, the code was complex and hard to work with.
 2. Task queue would get clogged with retries from failed calls to the API or RPCs that took too long. We'd often get an incomplete sync.
 3. Debugging issues by trying to work through all of the logs from the various tasks and retries was more or less impossible.
 4. When it did succeed, it would take more than 6 hours.
 5. We quickly hit the courtesy API quota. We asked Google for more. They obliged. We hit it again because of retries and other issues.
 6. Our datastore writes and reads were insane. It sometimes cost nearly $6 to do the sync *in datastore writes and read alone*.

The result was not pretty. We have incomplete and partial data almost always. The nested group logic was particular sensitive to this- one broken link and access control falls apart. This wasn't the solution we needed - our hammer had failed us.

### Keep it simple, stupid

Despite being difficult to implement using the task queues this sync is actually easily suited to a simple, straightforward python program:

 1. Get all users in the domain into a list called ``users``.
 2. Get all groups in the domain into a list called``groups``.
 3. Get the members for each group into a dictionary of ``group email:[member emails]`` called ``member_map``.
 4. Use the ``member_map`` to populate the members property for each ``user`` in ``users``. The recursive lookup for nested groups is trivial here because we have the whole map in memory.
 5. Finally, store the users and groups in some database.

I took the code we have for the task queues and simplified it into a linear program with appropriate retries, error handling, and logging. For testing purposes I output the results to ``users.json`` and ``groups.json`` files.

After a bit of tweaking, it worked. It did in one hour on my laptop what took App Engine six. Having all of the data in memory at once makes the logic to expand the nested groups trivial and drastically reduces cost.

The last remaining piece was persistence. I wanted something faster and cheaper than the datastore but I couldn't use memcache because of its eviction policy. So I made the code write its output to [redis](http://redis.io/) and deployed it on to a compute engine instance.

I then set up the sync script to run on a crontab on that instance. I adapted the rest of the application code to read the user info from redis instead of the datastore. It was all too easy from this point. It costs on average $1-$2 a day depending on the instance class used.

### Conclusion

App Engine is great for so many things and it's served me so well over the years, however, the lesson learned here is **not to be afraid of hybrid solutions**. We can sometimes get scared of IaaS over PaaS because of the looming threat of complexity and maintenance but if it makes your solution much easier and much cheaper to implement it can be worth the small trade-off. **Don't forget that you have more than one tool in your toolbox**.
