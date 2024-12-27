---
title: Split tunneling using Wireguard and namespaces
date: 2024-11-17
description: Using Linux's fancy networking to keep torrent traffic private
---

Lately I've been working on improving my rag-tag [homelab] and I wanted to set up a [bittorrent] client on the homelab server. Most modern clients have web UIs so getting it running relatively easy, however, you **really** want use a privacy-focused [VPN] while seeding or downloading torrents. That makes things a little more complicated.

In my case, I wanted to be able to run [Transmission] on my homelab server and have it use [NordVPN] to talk to the outside world. In typical usage, you'd set up the VPN client and _all_ your outbound internet traffic would go through the VPN. In my case, I didn't want that- I wanted Transmission to be the only app that uses the VPN. This is called [split tunneling][split-tunneling] and there's a lot of ways to do it. After a lot of research, trial and error, and lots of swearing I figured out a method that I feel works well for my use case. This post walks through how I set everything up and hopefully it'll help someone.

[homelab]: https://www.reddit.com/r/homelab/
[bittorrent]: https://en.wikipedia.org/wiki/BitTorrent
[VPN]: https://en.wikipedia.org/wiki/VPN_service
[Transmission]: https://transmissionbt.com/
[NordVPN]: https://nordvpn.com/
[split-tunneling]: https://en.wikipedia.org/wiki/Split_tunneling


## Overview

The approach involves using a Linux [network namespace][network-namespace] along with [Wireguard] to connect to the VPN service. This basically creates an isolated network stack for torrent traffic, which leaves the rest of the host networking alone and makes sure that the only way for the torrent client to talk to the outside world is through the VPN connection. This sounds simple enough but there's enough Linux black magic here for anyone to get lost.

Let's start with some terminology and introduce some of the tools we'll be working with:

- Linux network namespaces (`netns`) are used to create isolated network stacks. Programs using this namespace can only see the devices that are explicitly setup and configured for the namespace. It's one of many Linux features used by tools like [Docker] to provide _isolation_.
- [Wireguard] (`wg`) is a modern, fast VPN protocol. It's used by a lot of services like [Tailscale] and [NordVPN], and it's what I'll be using to connect to NordVPN's servers. While I'm using NordVPN, this should work for any VPN service that allows you to connect using `wg`.
- [wg-netns] is a Python script that bridges the gap between Wireguard and network namespaces. It automates a great deal of the ritual required to get Wireguard running inside of a namespace.
- [systemd] is a system and service manager used by most of the common Linux distros these days. I'll be using it to manage the services that create the network namespace, connect via wireguard, and run Transmission.
- [Transmission] is a lightweight, simple, and powerful torrent client. I like it, but I know a lot of folks are more fond of other clients. This setup should work with any client that has a web interface/API.

[network-namespace]: https://www.man7.org/linux/man-pages/man7/network_namespaces.7.html
[Wireguard]: https://www.wireguard.com/
[Docker]: https://www.docker.com/
[Tailscale]: https://tailscale.com/
[systemd]: https://systemd.io/
[wg-netns]: https://github.com/dadevel/wg-netns


## NordVPN and Wireguard

The first challenge is getting a working Wireguard configuration for connecting to NordVPN. While NordVPN uses Wireguard under the covers for its [NordLynx] technology, it doesn't provide any direct support for connecting over bare Wireguard.

But they can't stop us! You need two things for Wireguard to work - your private key and a peer to connect to. Nord doesn't make these trivial to obtain, but you can get them through the Nord API, and some kind souls already figured all this out for us.

1. [Get an access token for NordVPN][nord-access-token]. You don't need to download the Nord client, just grab the private key.
1. Use the [nord config generator][nord-config-generator] and pick a server you want to connect to and download the config for it.
1. Use the [private key generator tool][private-key-generator] to turn your access token into a Wireguard private key.

After doing this, you should have a **private key** and a config file that looks like this:

```ini
[Interface]
PrivateKey = YOUR_PRIVATE_KEY_HERE
Address = 10.5.0.2/16
DNS = 103.86.96.100

[Peer]
PublicKey = 0/x2PdBGfcIGr0ayFPFFjxcEEyhrlBRjR4kMcfwXJTU=
AllowedIPs = 0.0.0.0/0, ::/0
Endpoint = 169.150.204.2:51820
PersistentKeepalive = 25
```

[NordLynx]: https://support.nordvpn.com/hc/en-us/articles/19564565879441-What-is-NordLynx
[nord-access-token]: https://support.nordvpn.com/hc/en-us/articles/20286980309265-How-to-use-a-token-with-NordVPN-on-Linux
[nord-config-generator]: https://wg-nord.pages.dev/
[private-key-generator]: https://wg-nord.pages.dev//key

## Setting up wg-netns

The next task is to get both Wireguard and [wg-netns] installed and setup. These instructions work well for Debian bookworm, but might need to be adjusted if you're using a different distro. First, install the prerequisites:

```sh
sudo apt install python3 python3-toml iproute2 wireguard-tools wget
```

Then grab the `wg-netns` script. In this case I'm just grabbing it an putting it in `/usr/local/bin`, but you could do fancier stuff if you want.

```
wget -O wg-netns https://raw.githubusercontent.com/dadevel/wg-netns/main/wgnetns/main.py
sudo install wg-netns /usr/local/bin
rm wg-netns
```

You can verify that it's installed by running:

```
wg-netns -h
```

At this point you'll need to prepare a configuration file based on the one you generated in the previous step as [wg-netns] uses a slightly different format. In my case, it looked like this and I named it `nordvpn.json`:

```json
{
  "name": "nordvpn",
  "managed": true,
  "interfaces": [
    {
      "name": "nordvpn",
      "address": ["10.5.0.2/16"],
      "dns-server": ["103.86.96.100"],
      "private-key": "YOUR PRIVATE KEY",
      "peers": [
        {
          "public-key": "0/x2PdBGfcIGr0ayFPFFjxcEEyhrlBRjR4kMcfwXJTU=",
          "endpoint": "192.145.117.140:51820",
          "persistent-keepalive": 25,
          "allowed-ips": ["0.0.0.0/0"]
        }
      ]
    }
  ]
}
```

Note `"managed": true`, as I'll be using systemd to handle creating the namespace.

Once created, move it to `/etc/wireguard` and set permissions:

```sh
sudo install -m 0600 -D -t /etc/wireguard nordvpn.json
rm nordvpn.json
```

## Setting up systemd for netns

Now that `wg-netns` is ready, it's time to setup the systemd units for it. These will instruct systemd on how to create the namespace, startup the Wireguard connection, and route traffic.

Create all of these in `/usr/local/lib/systemd/system`- you can create the directory if you need to:

```
sudo mkdir -p /usr/local/lib/systemd/system
cd /usr/local/lib/systemd/system
```

First up is `wg-netns.target`, which creates a [target] that'll be used by the Transmission service.

```ini
[Unit]
Description=WireGuard in Network Namespaces
```

Next is `wg-netns@.service`, which actually runs `wg-netns` for a specific configuration:

```ini
[Unit]
Description=WireGuard in Network Namespace for %i
After=network-online.target nss-lookup.target
Wants=network-online.target nss-lookup.target
PartOf=wg-netns.target

[Service]
Type=oneshot
RemainAfterExit=yes
ExecStart=/usr/local/bin/wg-netns up %i
ExecStop=/usr/local/bin/wg-netns down %i
Environment=WG_ENDPOINT_RESOLUTION_RETRIES=infinity
Environment=WG_VERBOSE=1
WorkingDirectory=%E/wireguard
ConfigurationDirectory=wireguard

[Install]
WantedBy=multi-user.target
```

> If you're not a systemd expert like me, this might look kinda weird. This is a [template unit][template-unit]- it lets you use a single unit file to run multiple instances of a service based on the *instance name*, which you can use via `%i`. In this case, the instance name is used to pick which configuration file to use. If you ever wanna set up another Wireguard connection you can do it without having to duplicate and change this unit file.

At this point you should be able to enable and start an instance of the service:

```sh
sudo systemctl enable --now wg-netns@nordvpn
sudo systemctl status wg-netns@nordvpn
```

The `@nordvpn` part tells the service which configuration file to use. If you used a different name than `nordvpn.json` you'll need to make sure it matches.

If everything went okay, you should see good news from `systemctl status`. If not, run `sudo journalctl -eu wg-netns@nordvpn.service` to get a log and hopefully a clue as to what went wrong.

[target]: https://www.freedesktop.org/software/systemd/man/latest/systemd.target.html
[template-unit]: https://www.digitalocean.com/community/tutorials/understanding-systemd-units-and-unit-files#creating-instance-units-from-template-unit-files


## Testing the connection

If all went well, you should be able to test the connection within the namespace by pinging a known IP, like `8.8.8.8`:

```sh
sudo ip netns exec nordvpn ping 8.8.8.8
```

And if that works, you can verify the public IP address inside and outside of the namespace:

```sh
# Should return your real IP
wget -qO - icanhazip.com
# Should return your VPN IP
sudo ip netns exec nordvpn wget -qO - icanhazip.com
```

If that all checks out then you're good to go! Now you can set up Transmission.

## Running Transmission

Now that there's a whole network namespace with a VPN you can setup Transmission to run inside of it. First, install Transmission:

```sh
sudo apt install transmission-daemon
```

You'll probably need to disable the default systemd unit for `transmission-daemon`:

```sh
sudo systemctl disable --now transmission-daemon.service
```

Next, create a service file in `/usr/local/lib/systemd/system/transmission-nordvpn.service` to run Transmission within the network namespace:

```ini
[Unit]
Description=Transmission under NordVPN
Wants=wg-netns.target
After=wg-netns.target

[Service]
User=debian-transmission
Group=debian-transmission
UMask=0002
Type=notify
ExecStart=transmission-daemon --foreground --log-level=warn --config-dir=/opt/transmission/data --allowed=*.*.*.*
ExecStop=/bin/kill -s STOP $MAINPID
ExecReload=/bin/kill -s HUP $MAINPID
NoNewPrivileges=true
MemoryDenyWriteExecute=true
ProtectSystem=true
PrivateTmp=true
NetworkNamespacePath=/var/run/netns/nordvpn
BindReadOnlyPaths=/etc/netns/nordvpn/resolv.conf:/etc/resolv.conf:norbind

[Install]
WantedBy=multi-user.target
```

Note the use of `NetworkNamespacePath` this tells systemd to put Transmission in our network namespace. I also added `BindReadOnlyPaths` to that DNS resolution would work correctly.

Once created, you should be able to start Transmission:

```sh
sudo systemctl enable --now transmission-nordvpn
sudo systemctl status transmission-nordvpn
```

If all goes well Transmission should start up successfully. In normal setups you'd be able to browse to `{server-ip}:9091` to open the web interface, however, that requires a *little* more work.

## Accessing Transmission from the host

The reason you can't connect to the web interface is because all that work you did with network namespaces has isolated it from the system's network! Thankfully, systemd has a fantastic solution to this: [systemd-socket-proxyd]. This is a small tool similar to `socat` that handles proxying data across sockets. With systemd's built-in namespace support it can handle exposing Transmission's web UI socket to the host.

Once again, head over to `/usr/local/lib/systemd/system/` and start by creating `proxy-to-transmission-nordvpn.service`:

```ini
[Unit]
Description=Proxy to transmission within netns
Requires=transmission-nordvpn.service proxy-to-transmission-nordvpn.socket
After=transmission-nordvpn.service proxy-to-transmission-nordvpn.socket
JoinsNamespaceOf=transmission-nordvpn.service

[Service]
ExecStart=/usr/lib/systemd/systemd-socket-proxyd --exit-idle-time=5min 127.0.0.1:9091
PrivateNetwork=yes
```

And follow that up with the matching `proxy-to-transmission-nordvpn.socket`:

```ini
[Unit]
Description=Socket for Proxy to Transmission Daemon

[Socket]
ListenStream=9091

[Install]
WantedBy=sockets.target
```

The `.socket` file tells systemd to listen on `9091` and when a client connects systemd will automatically run the `.service` and create a proxy. Systemd will automatically stop the proxy when it's idle for 5 minutes, saving system resources. I think that's pretty neat!

You can enable the socket using:

```sh
sudo systemctl enable --now proxy-to-transmission-nordvpn.socket
```

At this point you should be able to browse to `{server-ip}:9091` and get to the Transmission web interface!

[systemd-socket-proxyd]: https://www.freedesktop.org/software/systemd/man/latest/systemd-socket-proxyd.html

## Closing thoughts

I'm happy with this setup but there's a lot of alternatives worth considering, such as running the VPN client in a Docker container ala [gluetun]. The Docker-centric setups can be a bit easier to wrap your head around and might work better for you.

There's a lot of projects and pages I looked at to get this all working, big thanks to these folks:

- [existentialtype/deluge-namespaced-wireguard](https://github.com/existentialtype/deluge-namespaced-wireguard)
- [mustafachyi/NordVPN-WireGuard-Config-Generator](https://github.com/mustafachyi/NordVPN-WireGuard-Config-Generator)
- [adombeck/nordvpn-netns](https://github.com/adombeck/nordvpn-netns/)
- [dadevel/wg-netns](https://github.com/dadevel/wg-netns)
- [Lagertonne/wireguard-on-namespaces](https://github.com/Lagertonne/wireguard-on-namespaces)
- [nurupo/pia-wg-netns-vpn](https://github.com/nurupo/pia-wg-netns-vpn)


[gluetun]: https://github.com/qdm12/gluetun
