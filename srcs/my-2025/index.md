---
title: Reflecting on my 2025
date: 2026-01-02
description: A look back through my journey around the sun
preview_image: snail.jpg
---

Keeping the trend from the last three years ([2024][2024], [2023][2023], [2022][2022]), I wanted to take some time to reflect. I have notorious memory issues that are only getting worse with age, and writing out a reflection helps me remember the good times. As always, this article is less technical than my usual content, however, I hope it provides some entertainment if you read through it.

![Lily the cat](./lily.jpg)

[2022]: ../my-2022
[2023]: ../my-2023
[2024]: ../my-2024

## Opulo

I've spent most of my year on my still relatively new day job at [Opulo][opulo] working on the awesome [LumenPnP][lumenpnp], a fully open source pick and place machine. I'm working on new software for controlling the machine that should hopefully improve the user experience and make it easier to build new functionality (like [paste extrusion][paste] and [automated optical inspection][aoi]).

I'm working on this largely alone, so it's a bit of a slower process than usual but it's been fun to return to software engineering and deep dive into into things like machine vision. It's still not quite ready for users, but it has been incredible to start [dogfooding][dogfooding] and seeing everything come together to successfully execute an entire job of picking, aligning, and placing parts:

![fully placed board](./placed-board.jpg)

The journey to get to that point was so wild, here's some bits I've posted about:

- [Testing board triangulation inside the simulator](https://bsky.app/profile/thea.codes/post/3lnxgijtye22g) and [visualizing it in fun ways](https://bsky.app/profile/thea.codes/post/3lfs7ulv4xc2z)
- [Testing board triangulation on the machine](https://bsky.app/profile/thea.codes/post/3lfnmolfauk2s)
- [Rendering a large portion of KiCAD's 3D models to 2D](https://bsky.app/profile/thea.codes/post/3lno7natyhc2r) and [using those in the simulator](https://bsky.app/profile/thea.codes/post/3lnv2j366ec22)
- [Testing part detection using the simulator](https://bsky.app/profile/thea.codes/post/3ll5peunocc2s)
- [Testing part detection against real images](https://bsky.app/profile/thea.codes/post/3liku64kkjs2l)
- [Testing part detection against varying lighting conditions](https://bsky.app/profile/thea.codes/post/3ljiu5alhw22m) and then [improving image processing to handle as much as possible](https://bsky.app/profile/thea.codes/post/3lk72didvik2q)
- [Quantifying part detection accuracy against human-annotated images](https://bsky.app/profile/thea.codes/post/3lizlehauwk2s)
- [So much maths](https://bsky.app/profile/thea.codes/post/3lluexrfbuc2p)
- [Testing part alignment using the simulator](https://bsky.app/profile/thea.codes/post/3llyps2lylc2v)
- [Aligning real parts for the first time](https://bsky.app/profile/thea.codes/post/3lmaozcv2uc2k)
- [Preforming a complete job inside the simulator](https://bsky.app/profile/thea.codes/post/3lojbxkluzc2n)
- [Grading the simulated work](https://bsky.app/profile/thea.codes/post/3lolxyfebh22w)
- [Fighting backlash](https://bsky.app/profile/thea.codes/post/3lgenj3kwls2f) and [compensating for it](https://bsky.app/profile/thea.codes/post/3lggzeabw6c27)
- [Dealing with the evil of rendering text](https://bsky.app/profile/thea.codes/post/3lhk7h6t6ws2n)
- [Fighting with Python's garbage collector](https://bsky.app/profile/thea.codes/post/3ls2flxun4c2n)
- [Doing evil things with CSS](https://bsky.app/profile/thea.codes/post/3lu766dwbek2m)
- [Writing lots of cursed code](https://bsky.app/profile/thea.codes/post/3lk2fltpwak2u)
- [Lots and lots of refactoring](https://bsky.app/profile/thea.codes/post/3lzlztdfin22h)
- [And so much more](https://bsky.app/profile/thea.codes/post/3luloeqbybc2k)

This project will be open source once it's released, and I'm really excited to share more with y'all in the next few months.

Oh yeah, Maggie and I also took a trip up to Pittsburgh to [haunt the Opulo office in person][office]. It was really cool to meet and hang out with everyone in person, and absolutely wild to see how much stuff goes on in that relatively tiny space!

![The office](./office.jpg)

[opulo]: https://www.opulo.io/
[lumenpnp]: https://www.opulo.io/products/lumenpnp
[dogfooding]: https://en.wikipedia.org/wiki/Eating_your_own_dog_food
[paste]: https://www.opulo.io/products/paste-extruder?variant=46362186842299
[aoi]: https://en.wikipedia.org/wiki/Automated_optical_inspection
[office]: https://bsky.app/profile/thea.codes/post/3lsbrzssj4c2w

## OSHWA

I once again continued my work with the [Open Hardware Association (OSHWA)][oshwa]. I'm somehow still serving as the president of the board while providing help with infrastructure and web design, including the [Open Hardware Summit 2026][ohs-2026] site.

Due in no part to my involvement, OSHWA has continue to do really [awesome stuff][oshwa-community-letter] - including getting to [3,000 certifications][certs], hosting the first [Open Healthware Conference][openhealthware], and landing an awesome [Open Hardware Month][ohm-livestream]. I definitely feel FOMO from not being able to attend the [Open Hardware Summit in Edinburgh][ohs-2025], but I'm really hoping I'll be able to make it to [Berlin in 2026][ohs-2026]!

Once again, I'm so honored to work with Alicia, Lee, Sid, and the OSHWA board. These are folks that genuinely care for the open hardware community and put in so much effort to help everyone they interact with.

[oshwa]: https://oshwa.org
[ohs-2025]: https://2025.oshwa.org/
[ohs-2026]: https://2026.oshwa.org/
[certs]: https://bsky.app/profile/oshwassociation.bsky.social/post/3lmka2ktavc22
[oshwa-community-letter]: https://oshwa.org/announcements/thank-you-for-an-amazing-year/
[openhealthware]: https://www.youtube.com/playlist?list=PLN2I5IwhHQ4qmQmIk_SmnVEbmxWtAtfwI
[ohm-livestream]: https://www.youtube.com/playlist?list=PLN2I5IwhHQ4pREAh4Qy89VRgUJo60Owh8

## Self hosting

My newest hobby was [self hosting][selfhosting], the absurd practice of trying to claw back ground for our tech feudal overlords. With the ongoing [enshittification][enshittification] of practically everything I've been paying money for, I finally felt it was time to start moving off these ["convenient"][reject-convenience] services and start doing things myself.

Some of my favorite self-hosted services and tools are:

- [Home Assistant][hass] which ties together all of the "smart" devices locally into a single app. It's awesome, if still a little rough around the edges- especially all the damn yaml.
- [Jellyfin][jellyfin] for streaming media, which has basically replaced all streaming services for us.
- [Immich][immich] for photo backup, which has been a great, non-shitty alternative to Google Photos.
- [Vaultwarden][vaultwarden] for passwords.
- [Adguard Home][adguard] for DNS and adblocking.
- [Syncthing][syncthing] as an alternative to Google Drive for just having a synced backup of a bunch of files.
- [Backrest][backrest] and [Restic][restic] for automated, incremental onsite and offsite backups with [Backblaze][backblaze] for the offsite storage.
- [Tailscale][tailscale] for remote access, so I don't have to expose anything directly to the internet. Tailscale is fucking awesome.
- [Starrs][starrs] and [Seerr][seerr] for managing media requests and downloads.
- [ProtonVPN][protonvpn] as a VPN provider.

[selfhosting]: https://en.wikipedia.org/wiki/Self-hosting_%28network%29
[enshittification]: https://en.wikipedia.org/wiki/Enshittification
[reject-convenience]: https://www.youtube.com/@rejectconvenience
[hass]: https://www.home-assistant.io/
[jellyfin]: https://jellyfin.org/
[immich]: https://immich.app/
[adguard]: https://adguard.com/en/adguard-home/overview.html
[vaultwarden]: https://github.com/dani-garcia/vaultwarden
[syncthing]: https://syncthing.net/
[backrest]: https://github.com/garethgeorge/backrest
[restic]: https://restic.net/
[backblaze]: https://www.backblaze.com/
[tailscale]: https://tailscale.com/
[starrs]: https://wiki.servarr.com/
[seerr]: https://seerr.dev/
[protonvpn]:  https://protonvpn.com/

My current ongoing self-hosting journey is moving off YouTube Music, that's right, we're listening to music like it's 2008 again! I still haven't fully settled on what this will be long term, but right now I'm using:

- [Navidrome][navidrome] as a music server, although I am interested in trying out [FunkWhale][funkwhale].
- [Picard][picard] for tagging and organization. It's an incredibly powerful tool, even if a bit rough, and I found it a bit easier to work with than [beets][beets].
- [slskd][slskd] as my gateway to the Soulseek network, although it's kinda rough around the edges.
- [Feishin][feishin] as my desktop client which works great and has a very active developer.
- [Symphonium][symphonium] as my Android client, which is proprietary but it's extremely well done.

I've also been meticulously ripping CDs and [DVDs][dvds], exhausting [vinyl download cards][vinyldl], and dumping money into my favorite artists on Bandcamp wherever possible.

<winter-carousel>
  <img src="./cds.jpg">
  <img src="./vinylcards.jpg">
</winter-carousel>

I've also got an adorable little [Tangara][tangara] music player that I'm excited to play around with:

![Tangara](./tangara.jpg)

[navidrome]: https://www.navidrome.org/
[funkwhale]: https://www.funkwhale.audio/
[picard]: https://picard.musicbrainz.org/
[beets]: https://github.com/beetbox/beets
[slskd]: https://github.com/slskd/slskd
[symphonium]: http://symfonium.app/
[dvds]: https://bsky.app/profile/thea.codes/post/3lxqad6mq6k2k
[vinyldl]: https://bsky.app/profile/thea.codes/post/3m5r2qjavak2q
[tangara]: https://bsky.app/profile/thea.codes/post/3lgy2dfmnfs2k
[feishin]: https://github.com/jeffvli/feishin

## Making

With a lot of my time taken up by my day job, I didn't do quite as much "making" this year as I've done in the past, but I still managed some fun stuff!

First, since I knew I'd be working from my computer more, I decided to really invest some time in getting my desk setup in a way that makes me enjoy being there:

<winter-carousel>
  <img src="./desk.webp">
  <img src="./carlyshelf.jpg">
</winter-carousel>

It's so worth it to invest in the space you spend the most time in. I really appreciate the conveniences and niceties like a thunderbolt hub (single cable to my laptop to connect *everything*), my favorite headphones ready to go in a [hanger I designed][headphone-hanger], an abundance of [writing utensils, surfaces, and fun stickers][labnotebook], and little mementos that remind me of my friends.

[headphone-hanger]: https://bsky.app/profile/thea.codes/post/3ll3tyx543s2r
[labnotebook]: https://bsky.app/profile/thea.codes/post/3lswoxwhfws2a

Next, I was delighted to collaborate with [Maggie][maggie] to do the graphic design and layout for [Vampire Step-Dad's NIGHT:SHIFT II][nightshift]:

![NIGHT:SHIFT II layout](./nightshift.webp)

It was so cool to see this on a physical [cassette][cassette]!

[maggie]: https://marms.art
[nightshift]: https://vampirestepdad.bandcamp.com/album/night-shift-ii-canine-cop
[cassette]: https://bsky.app/profile/vampirestepdad.com/post/3ljt2vr4at22b

Speaking of Vampire Step-Dad, I also helped him fixup an [old camcorder][camcorder1] which thankfully only required [replacing the capacitors][camcorder2].

<winter-carousel>
  <img src="./camcorder-board.jpg">
  <img src="./recap.jpg">
  <img src="./camcorder.jpg">
</winter-carousel>

Super neat to see this old beauty come back to life after having it seep electrolite onto my bench.

[camcorder1]: https://bsky.app/profile/vampirestepdad.com/post/3lglmunyuz22e
[camcorder2]: https://bsky.app/profile/thea.codes/post/3libd7fyuas2w

Another fun bit of (de)making was taking apart and putting away some of [Winterbloom]'s test rigs and such, like the venerable [Hubble][hubbleinsides] and its never used [replacement][hubble]:

![Hubble insides](./hubble-insides.jpg)

[winterbloom]: https://winterbloom.com
[hubble]: https://bsky.app/profile/thea.codes/post/3lgizilkcwc2n
[hubbleinsides]: https://bsky.app/profile/thea.codes/post/3li33rdmyk22x

I also found a little time for some creative writing, as I put together a little [altered item][altereditem] document for [Opulo's office gnome][gnome]

![gnome](./gnome.jpg)

[altereditem]: https://control.fandom.com/wiki/Altered_Item
[gnome]: https://bsky.app/profile/thea.codes/post/3lszsutxqz222

Speaking of creative writing, I also shared an overly snarky response to Prusa's so-called "Open Community License", the [Simplified Open Community License][socl].

[socl]: https://bsky.app/profile/thea.codes/post/3mameyd4dys22

## Games, music, movies, and more

This year was another incredible year for live music, as I was able to see some of my absolute favorite artists including [Rilo Kiley][rilokiley], [St Vincent][stvincent], [David Byrne][burger], [Garbage][garbage], Ginger Root, and [TWRP][twrp].

<winter-carousel>
  <img src="./stvincent.jpg" title="St Vincent">
  <img src="./gingerpoot.jpg" title="Ginger Root">
  <img src="./jennylewis.jpg" title="Rilo Kiley">
  <img src="./twrp.jpg" title="TWRP">
  <img src="./lapd.jpg" title="Los Angeles Power Disco">
  <img src="./byrne.jpg" title="David Byrne">
  <img src="./fox.jpg" title="Atlanta's Fox Theater">
</winter-carousel>

[stvincent]: https://bsky.app/profile/thea.codes/post/3lmlmvkndjc2j
[rilokiley]: https://bsky.app/profile/thea.codes/post/3lztaix6umc2m
[grouplove]: https://bsky.app/profile/marms.art/post/3lr25aottzc2h
[garbage]: https://bsky.app/profile/marms.art/post/3lyjlv7bwu22s
[twrp]: https://bsky.app/profile/marms.art/post/3lzup6nn4z22p
[burger]: https://bsky.app/profile/thea.codes/post/3m72kw4xem22v

Outside of live music, I've really been enjoying [Magdalena Bay][magbay], [Silversun Pickups][silversun], and [Karen O][kareno] this year. I'm also digging my way back into [city pop][citypop].

[magbay]: https://imaginaldisk.world/
[silversun]: https://bsky.app/profile/thea.codes/post/3lqww4p4yls2k
[kareno]: https://bsky.app/profile/thea.codes/post/3lyjgv4wb3s2a
[citypop]: https://bsky.app/profile/thea.codes/post/3lkwi5skww22o

I was no slouch when it comes to video games. My favorites this year were:

- [Hollow Knight Silksong][silksong] and [Hollow Knight][hollowknight]. I'd actually never played Hollow Knight before this year and after my [30 hour playthrough][hollowknight-done] I thought it was fantastic, but Silksong took it to a whole new level. It's a wonderful, beautiful, thoughtful game that is a truly a masterpiece. The gameplay is sublime and I adore Hornet as a protagonist. The visuals, the music, and the story are all just top notch. My playthrough took o[over 50 hours][silksong-done], which is incredible for a game priced at less than half of AAA titles! My only criticism is that Silksong's punishing difficulty combined with absolutely no accessibility options makes experiencing this game totally impossible for a significant amount of players. There are mods for PC players, but I really think Team Cherry should reconsider their stance on accessibility options. If Celeste can do it, so can you.
- [Ghost of Tsushima][tsushima] was a comfortable adventure. It doesn't stray far from the established formula of open world adventure games, but I enjoyed spending time in its world, the storytelling, and Jin's character growth throughout. The combat is probably its most unique aspect, asking the player to carefully consider blocking, parrying, and attacking with intent instead of button mashing, although it does relax a bit once you get more skills and weapons, allowing a more chaotic and fun approach. Also, the few bugs I ran into were [delightful][tsushima-bug].
- [Split Fiction][splitfiction] was a delightful adventure with an underwhelming ending. I played this with Maggie and we had a great time running around and just playing around in the worlds. The best parts of the games were honestly the side stories, where things get [weird][piggies] in the best way. The ending [leaves a bit to be desired][spitfict], and I honestly wish they'd taken a few more months to cook on the writing. Overall it's a really fun game to play with a friend.
- [Lies of P][liesofp] surprised me. I generally do not like soulslike games, as I find them more frustrating than I'm typically willing to put up with, but I gave this one a shot after hearing about their accessibility options. This game is great, the story is unique and familiar at the same time, the worldbuilding is great, the enemy designs are fantastic. I still found this game to be bastardly hard even with accessibility options on, but I did make it through and I really liked it.

I rolled credits on a few more games this year, including *Lorelei and the Laser Eyes*, *Blue Prince*, *Viewfinder*, *Far Cry 6* (which had the [best bugs][farcry-bug]), *Star Wars: Outlaws*, *Prince of Persia: The Lost Crown*, *Exit 8*, *Platform 8*, *THPS 3+4*, *Metal Eden*, and *Deliver us the Moon*. I cleaned up the platinum trophies for [Cyberpunk 2077][cyberpunk], [NieR: Automata][nier], and [Gravity Rush][gravityrush], and of course, [played too much Fortnite][fortnite].

[silksong]: https://hollowknightsilksong.com/
[silksong-done]: https://bsky.app/profile/thea.codes/post/3maovxplrwc2k
[hollowknight]: https://www.hollowknight.com/
[hollowknight-done]: https://bsky.app/profile/thea.codes/post/3m7db7ex57k2t
[tsushima]: https://www.playstation.com/en-us/games/ghost-of-tsushima/
[tsushima-bug]: https://bsky.app/profile/thea.codes/post/3ljtpmhehu22l
[splitfiction]: https://www.ea.com/en/games/split-fiction/split-fiction
[piggies]: https://bsky.app/profile/thea.codes/post/3lkp7fvdy322z
[spitfict]: https://bsky.app/profile/thea.codes/post/3lmdxp2yat226
[liesofp]: https://www.liesofp.com/en-us
[farcry-bug]: https://bsky.app/profile/thea.codes/post/3lofdj2ocas2h
[cyberpunk]: https://bsky.app/profile/thea.codes/post/3lfokaq7ti22d
[gravityrush]: https://bsky.app/profile/thea.codes/post/3lgoiaqott222
[nier]: https://bsky.app/profile/thea.codes/post/3lu7blcswgc2x
[fortnite]: https://bsky.app/profile/thea.codes/post/3m7dbayhxvs2t

Some of my favorite movies I saw this year in no specific order were *Marty Supreme*, *Wake Up Dead Man*, *Sinners*, *Companion*, *Windy City Heat*, *Superman*, *The Gorge*, and *KPop Demon Hunters*. I was also lucky to catch old favorites *Paranorman* and *Jennifer's Body* in theaters, which was awesome since I'm one of those freaks that love theaters.

My favorite shows of the year were *The Righteous Gemstones*, *PLUR1BUS*, and *Chiikawa*. The Righteous Gemstones really stands out as one of my favorite shows over the last few years, and they ended it so well.

I actually only managed to read one novel this year, Chuck Tingle's [*Lucky Day*][luckyday], which was honestly fucking awesome. Highly recommend.

[luckyday]: https://www.goodreads.com/book/show/217387953-lucky-day

## Friends

I am lucky in that I had no shortage of wonderful times with wonderful people, too many to list here. One of the highlights was taking a trip to California with Maggie and Alana, where we followed [Planet Booty][planet-booty] on their 3-day mini tour.

![Just a taste](./justataste.jpg){.medium}

Maggie did the [incredible tour poster][justataste] and it was a great excuse to go take a road trip through San Diego, Los Angeles, and Palm Springs and [spend time with awesome people][awesome].

There were so many good times, like [meeting Chuck Tingle][tingle], my sister [making the cake from Matilda][matilda] for our watch party, hosting our friend [Cody][cody], that time we all got [really into scrabble][scrabble], a bizarre visit to a [chain restuarant][longhorn], our annual ["Bitchmas" celebration][bitchmas], just [hanging out][facts], and closing out the year with New Year's Eve Karaoke.

[planet-booty]: https://www.planetbooty.org/
[justataste]: https://bsky.app/profile/marms.art/post/3m2pdu72yhc2j
[awesome]: https://bsky.app/profile/marms.art/post/3m5eoa23m5s27
[tingle]: https://bsky.app/profile/marms.art/post/3lxbcuaec222e
[matilda]: https://bsky.app/profile/thea.codes/post/3m7qv5uhdq22a
[cody]: https://bsky.app/profile/marms.art/post/3lpenn2o6xc2i
[scrabble]: https://bsky.app/profile/marms.art/post/3ljlllwvmpk2l
[longhorn]: https://bsky.app/profile/thea.codes/post/3lqxzjtdazk25
[bitchmas]: https://bsky.app/profile/thea.codes/post/3m7txqgb7k22c
[facts]: https://bsky.app/profile/marms.art/post/3liafvcg6k22r

## Looking ahead

![snow](./snow.jpg)

Despite all that I've accomplished and all of the good times, 2025 was still a [difficult year][joyless] for me. I hope that 2026 brings along less extreme lows, and I hope that I'm lucky enough to keep having wonderful times with my friends. I'd really like to exercise and write more in the new year, but I find forming new habits to be incredibly difficult. We'll see, yeah? 🙂

[joyless]: https://bsky.app/profile/thea.codes/post/3lz7ocogehc2r

## See you next year!


<script type="module" src="/static/winter.js"></script>
<link rel="stylesheet" type="text/css" href="/static/winter.css"></link>
