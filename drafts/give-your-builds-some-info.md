---
title: "Where did this code come from?"
date: 2020-12-02
legacy_url: yes
description: A gentle introduction to build and runtime info
---

You're ready. You've just wrapped up the latest commit on your project and you're ready to send it out into the world. You build it, you upload it, and you're done. You kick back and wait for all of your users to install the new version.

Right?

Sure, but what happens when you or a user discovers a bug? How do you know for sure which version the bug appears in? You were probably smart enough to include some sort of version number like `1.4.3` but is that enough?

Often times, a simple version number isn't enough. For example, you could've made a build from a modified version of the source code but didn't update the version number- so now there's two builds out there with the version number `1.4.3` and there isn't an easy way to tell them apart. Ideally you'd be able to ask the code for the *context* needed to re-create it. For example, it could tell you the exact commit (or revision, or whatever your version control system calls it), the exact version of the compiler, the build flags, etc.

The solution here is to have the build include all of this context into the code. This goes by a few names, but you'll commonly see this referred to as **build info** or **build versioning**. It's also tied into the concept of [Reproducible Builds](https://reproducible-builds.org/), which is definitely a concept worthy of further reading.

You can see this concept used in all kinds of software. For example, Android is happy to tell you its build information:

#TODO: ANDROID SCREENSHOT

You can also see this pattern in databases. For example, Redis' [INFO command](https://redis.io/commands/info) will tell you some details about the build context:

```
redis_version:6.1.242
redis_git_sha1:00000000
redis_git_dirty:0
redis_build_id:37ac41a6208e1208
redis_mode:standalone
os:Linux 5.4.0-1017-aws x86_64
arch_bits:64
gcc_version:9.3.0
```

Video games also often contain very detailed build and runtime information for help diagnosing and reproducing bugs. Especially PC games where the runtime environment can contain a vast amount of different graphic cards, driver versions, CPUs, and memory configurations.

It's even around in web applications: it's common to include information about the commit, runtime environment, and server name in HTTP response headers (most limit these to only being visible for internal IP addresses).

## What information should be included

The information that should be included various based on the programming language, the deployment strategy, and where the code runs- a Python web application should probably include different information than firmware written in C.

The importance concept here is **context**. You should include:

1. All the information needed to find the exact source code used. This can be as simple as a git commit.
2. All of the information needed to build the source code in the same way. This can be stuff like compiler versions, dependency version information, build flags, etc.
3. Even though this is often called *"build info"*, you should also include all of the *runtime* context needed to run the code in the same way. This can be stuff like the Python version that's running a Python web application, the GPU driver version used by a game, etc.

Think about it this way: if a user sent you a bug report what information would you ask of them to be able to reproduce their report? That's the bare minimum you should include in your build info.

For example, if I were working with some firmware for an embedded device I'd want to include:

1. The designated version number, for example: `2020.2.9`
1. The git commit SHA for the code, for example: `0ab324a`
1. The state of the git repository - are there uncommitted modifications?
1. The build configuration - release or debug?
1. The compiler and version used, for example `arm-none-eabi-gcc 10.2.1`
1. Version numbers for any critical third-party libraries, for example: `Zephyr 1.14`
1. The date and time that the code was compiled.


But if I were making a Python web application I'd want to include:


1. The git commit SHA for the code, for example: `0ab324a`
1. The state of the git repository - are there uncommitted modifications?
1. The Python version running the application
1. Version numbers for any critical third-party libraries, for example: `Flask 1.1.2`
1. The date and time the application was deployed.
1. The hostname of the server that's running the application.


It's useful to distill most of this information into a single **build info string**. For example:

```
2021.2.9 (debug) on 02/10/2021 05:29 UTC with gcc 10.2.1
```

## Gathering this information at build time

Let's take a closer look at the firmware example. How would you go about getting the build information into the application?

You can use a script[^1] to gather all of the necessary data:

```python
import datetime
import subprocess

# This grabs the state of the git repository: it provides the most recent tag,
# the number of commits since that tag, the sha of the latest commit, and
# whether or not there are uncommitted modifications.
#
# For example: v2020.2.9-14-g2414721
#
# You can see other examples over at https://git-scm.com/docs/git-describe#_examples
revision = subprocess.run(
    ["git", "describe", "--always", "--tags", "--dirty"],
    capture_output=True,
    check=True,
    text=True,
).stdout.strip()

# This simply grabs the version number from GCC. For example: 10.2.1
gcc_version = subprocess.run(
    ["arm-none-eabi-gcc", "-dumpversion"],
    capture_output=True,
    check=True,
    text=True,
).stdout.strip()

# Generates a simple build date string, for example: 02/10/2021 05:29 UTC
build_date = datetime.datetime.utcnow().strftime("%m/%d/%Y %H:%M UTC")

# Combine the above into a build info string. It should look like:
# v2020.2.9-14-g2414721 on 02/10/2021 05:29 UTC with GCC 10.2.1
build_info_string = f"{revision} on {build_date} with GCC {gcc_version}"
```


Now that you've got the build context you can have the script generate a `build_info.c` file:


```python
with open("src/build_info.c", "w") as fh:
    fh.write(f"""
        static const char build_info[] = "{build_info}"
        static const char revision[] = "{revision}";
        static const char gcc_version[] = "{gcc_version}";
        static const char build_date[] = "{build_date}";

        const char* get_build_info() {
            return build_info;
        }

        ...
    """)
```

The final step is to make sure your build system re-runs the script on every build. For example, if you're using GNU Make:

```Makefile
# Phony forces Make to always re-build the target.
.PHONY: build_info.c

build_info.c:
    python3 generate_build_info.py
```

With all that in place the firmware can reference the build info. For example, it could print it over serial:

```c
serial_printf("Build info: %s", get_build_info);
```


[1]: You could also just do this directly in your Makefile, but the more a Makefile looks like Python the more I want to just write Python instead.

## Research

https://wiki.debian.org/ReproducibleBuilds/BuildinfoFiles
https://docs.mongodb.com/manual/reference/command/buildInfo/
https://source.android.com/reference/tradefed/com/android/tradefed/build/BuildInfo
https://crates.io/crates/build-info
https://interrupt.memfault.com/blog/release-versioning
https://interrupt.memfault.com/blog/gnu-build-id-for-firmware
https://interrupt.memfault.com/blog/gnu-build-id-for-firmware
https://embeddedartistry.com/blog/2016/12/21/giving-your-firmware-build-a-version/
https://gitlab.com/wolframroesler/version
