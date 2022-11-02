---
title: Docker, procfiles, and health checks
date: 2015-08-05
legacy_url: yes
---

*(full source code is available on [github](https://github.com/theacodes/docker-procfile))*

[Docker](https://docker.io) has an interesting best practice of only executing [one process per container](https://docs.docker.com/articles/dockerfile_best-practices/):

>In almost all cases, you should only run a single process in a single container. Decoupling applications into multiple containers makes it much easier to scale horizontally and reuse containers. If that service depends on another service, make use of container linking.

This is a great rule of thumb, but there are a few cases where running multiple processes *is* actually necessary. In fact, Docker acknowledges this in their tutorial on [running supervisord](https://docs.docker.com/articles/using_supervisord/) in Docker.

I came across one such case recently. I wanted to run an [rq](http://python-rq.org/) worker on [Google App Engine Managed VMs](). It's highly recommended to provide a simple HTTP health check. Usually this is trivial to provide as you are usually running an actual web application. But in the case of rq it's not that simple - rq is not a web application and there's no way to make it respond to these health checks by itself.

I needed to run two processes: the rq worker process and a simple web application that could respond to health checks.


### Running multiple processes
As mentioned above, [using supervisord](https://docs.docker.com/articles/using_supervisord/) is a completely valid solution. However, I wanted something that required a little less configuration. This is where I decided on using [foreman's](http://ddollar.github.io/foreman/) [procfile](http://ddollar.github.io/foreman/#PROCFILE). Foreman is an extremely lightweight process manager. An added bonus is that Foreman can export a supervisord config file if you decide to switch. For this project, I decided to use [Honcho](https://github.com/nickstenning/honcho) which is a python clone of Foreman primarily because it didn't require me to install ruby in my container.

With Honcho, our Procfile looks like this:

```
worker: rqworker
monitor: python monitor.py
```

Both processes can be started locally by executing ``honcho start``, but how do I get docker to start this? My first attempt was:

```
CMD /env/bin/honcho start
```

However, this created a small problem: when Honcho starts processes it uses the system Python and the system site-packages. This is unfortunate because my Dockerfile is set up to install all dependencies into a [virtualenv](http://docs.python-guide.org/en/latest/dev/virtualenvs/):

```
WORKDIR /app
RUN virtualenv /env
ADD requirements.txt /app/requirements.txt
RUN /env/bin/pip install -r /app/requirements.txt
ADD . /app
```

Thankfully, there's a small trick to execute honcho within the context of a virtualenv:

```
CMD . /env/bin/activate; /env/bin/honcho start
```

Running in docker now starts both the monitor and the worker:

<script type="text/javascript" src="https://asciinema.org/a/23417.js" id="asciicast-23417" async></script>

### Monitoring processes with Python, Flask, and psutil.

The monitoring application is a simple [Flask](http://flask.pocoo.org/) application that uses [psutil](https://github.com/giampaolo/psutil) to monitor the status of the worker process. Luckily, ``rqworker`` has a flag that will write its PID to a file that can be read by the monitor application. The full source is available on [github](https://github.com/theacodes/docker-procfile/blob/master/monitor.py).
