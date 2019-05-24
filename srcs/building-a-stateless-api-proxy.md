---
title: Building a stateless API proxy
date: 2019-05-23
legacy_url: yes
description: How to make an access-limiting proxy for any API
hidden: true
---

> WHOA. THIS POST IS A WORK IN PROGRESS. PLEASE DON'T SHARE YET.

Web APIs are lots of fun. However, things can get tricky when it comes to granting *other* applications access to your data on a specific service.

I ran into this trickiness with the GitHub API. In Google Cloud we have client libraries for about 40 products across 8 programming languages. In order to manage and release these things, we need bots. An army of bots. These bots need access to do things on our repositories.

We want some of these bots to only be able to write comments on things. We want others to be able to create commits, but only on certain branches. We need others to be able to create releases, but nothing else, and so on. This is where things get interesting.

It turns out GitHub's API has extremely coarse access control on API tokens. For example, imagine if you wanted to write an editor plug-in to turn your [Gists](https://gist.github.com/) into easily-accessible snippets in your editor. People would have to grant your plug-in *write* access even though it only really needs *read* access. There's a big [Dear GitHub post](https://github.com/dear-github/dear-github/issues/113) on the subject, but this is not uncommon - many APIs have permissions systems that don't quite always fit the needs of users.

Back to our army of bots - we'd need to give basically every bot full access to our repositories to do their work. That's a problem! Each token floating around out there represents an attack vector.

So how do you fix this? This is where my idea for a *stateless*, *transparent* proxy comes into play. I like to call it a **✨magic✨** proxy. Let's talk a bit about it. This post uses GitHub as an example but you can apply this concept to any web API.


## What's a proxy?

Okay but first - what even is a proxy?

Well, a proxy is something that sits between you (or your application) and the thing you're trying to talk to. In this case, an API proxy sits between some program you're writing and the upstream API the application is accessing.

Basically, instead of you (or your application) talking directly to GitHub like this:

> examples are using [httpie](https://httpie.org)

```bash
$ http GET https://api.github.com/gists "Authorization: token OAUTH-TOKEN"
HTTP/1.1 200 OK

[
    {
        "public": true,
        "url": "https://api.github.com/gists/f108864f81aa385a6ab034d15d416328",
        ...
    }
    ...
]
```

You would instead talk to GitHub *through* the proxy:

```bash
$ http GET https://github-proxy.thea.codes/gists "Authorization: token PROXY-TOKEN"
HTTP/1.1 200 OK

[
    {
        "public": true,
        "url": "https://api.github.com/gists/f108864f81aa385a6ab034d15d416328",
        ...
    }
    ...
]
```

Notice that while the request path is the same (`/gists`) and the response is
the same, the domains are different (`github-proxy.thea.codes` vs `api.github.com`) and the value in the `Authorization` header is different.

This is the proxy at work. The proxy's job is to talk to GitHub on your behalf and functionally *behave* just like the GitHub API - **but** - and this is an important but - it does **not** take your normal GitHub API token in the `Authorization` header. It takes its *own* token and uses that to figure out who you are what you can do with the API. The proxy makes these decisions *before* talking to the GitHub API.

The `Authorization` header is where the ✨magic✨ happens.


## Let's talk about tokens

So let's step back a second. A GitHub token is an opaque string that looks something like `7e096a6633471a2c967718d4b435f0ecdac5c426`. You can create one by following [these instructions](https://help.github.com/en/articles/creating-a-personal-access-token-for-the-command-line). When you create a token you assign permissions to that token:

![GitHub Token Scopes](../static/github_token_scopes.gif)

Going back to our examples about wanting just read-only access to public and private Gists, you'll notice that GitHub just gives you a single "Gists" permission that grants read **and write** access. No good.

So what we really want is a token that can *read* but not *write* gists. The proxy can issue its own token. It can keep track of the fact that the token is only allowed to *read* Gists and not write them. When it gets a request for the GitHub API it can check permissions before forwarding them. Something like:

```python
token_permissions = get_token_permissions(request.token)
# token_permissions = ["read"]

if "read" in token.permissions and request.method == "GET":
    return forward_request(request)
else:
    return reject_request(request)
```

## Creating and tracking of token for the proxy

Okay, so we know what we want our proxy to do:

1. Pretend to be the GitHub API.
2. **but** accept its own custom tokens that limit permissions.

The big questions now is how do we create our custom tokens and how do we keep track of what permissions they have?

We could create a database and start storing stuff into it. You could just generate a random string for the API key and then store stuff like the *real* GitHub API token and the permissions in a row in the database. Something like:

| Primary Key (Proxy Token) | Permissions | Real API Key |
| --- | --- | --- |
| c967718d | read | 7e096a6633471a2c967718d4b435f0ecdac5c426 |
| adf314bc | read,write  | 7e096a6633471a2c967718d4b435f0ecdac5c426 |


But databases are pricey and can require a lot of work. They also add latency - each request to the proxy needs to hit the database to find out about the token.

However, another interesting option is to use [public-key cryptography](https://en.wikipedia.org/wiki/Public-key_cryptography) to store all that information in *the token itself*.


## Let's talk about black magic - Cryptography

So before we get into how to use public-key cryptography for our proxy, let's me tell about some of the basic and important concepts.

From [wikipedia](https://en.wikipedia.org/wiki/Public-key_cryptography):

> Public-key cryptography is a cryptographic system that uses pairs of keys: public keys which may be disseminated widely, and private keys which are known only to the owner.

Okay - so we have **two** keys - public and private.

> In such a system, any person can encrypt a message using the receiver's public key, but that encrypted message can only be decrypted with the receiver's private key.

Okay - interesting. So stuff encrypted with the public key (so called *ciphertext*) can be sent *in the clear* and only the holder of the private key can decrypt it.

> Authentication is also possible. A sender can combine a message with a private key to create a short digital signature on the message. Anyone with the corresponding public key can combine a message, a putative digital signature on it, and the known public key to verify whether the signature was valid, i.e. made by the owner of the corresponding private key.

Okay - so this is super interesting. We could write a note and sign it and verify that no one messed with.

We have all the spells we need to cast to make our tokens. Let's talk about the right way to cast them.


## The format of a stateless token

Okay, so before we apply the cryptography spell we need to figure out the content of the token. The token basically needs to say "this token can do these things with this github account". Just like our database option, the token therefore needs this information *at minimum*:

1. The set of permissions.
2. The github token to use once permissions are validated.

So we could imagine writing a simple text document that looks like this:

```text
real token: 7e096a6633471a2c967718d4b435f0ecdac5c426
permissions: read
```

But let's make it machine readable and use JSON:

```json
{
    "real_token": "7e096a6633471a2c967718d4b435f0ecdac5c426",
    "permissions": ["read"]
}
```

Perfect. To make it easier to send over HTTP, we can base64 encode the whole thing - but we'll keep it as plaintext for the moment.

## Securing the real key

Cool. Of course we can't just hand this token as-is to the thing that's talking to our proxy. The real token is right there in *plaintext*. They could just use that and bypass the proxy! What we need to do is encrypt it so that only the proxy can read it.

Let's cast the first spell. ✨

Remember what Wikipedia taught us about public-key cryptography:

> In such a system, any person can encrypt a message using the receiver's public key, but that encrypted message can only be decrypted with the receiver's private key.

Perfect!

In preparation, we'll need a public/private key pair. You can make one with [openssl](https://www.openssl.org/):

```bash
$ openssl genpkey -algorithm RSA -out private.pem -pkeyopt rsa_keygen_bits:2048
$ openssl req -batch -subj /C=US/CN=github-proxy.thea.codes -new -x509 -key private.pem -out public.cert -days 1825
```

> You can read more about generating RSA pairs [here](https://en.wikibooks.org/wiki/Cryptography/Generate_a_keypair_using_OpenSSL).

Okay. Now that we have a private and public key for the proxy we can secure our real token. We'll do this by encrypting the real token with the **public key**. This means only the **private key** can decrypt it. Since the proxy keeps the private key, well, private, only the proxy itself can decrypt the real API token.

Here's what encrypting the key looks like with OpenSSL on the command-line:

```bash
$ echo "REAL_TOKEN" | openssl rsautl -encrypt -inkey public.pem -pubin | base64
aR5PGrONkL8gCnymVu/JpbGFr6LySmkfP5XwTdjSqvM7rPKKh8kBY0CV4KPGq1Axf77AinNGrNrwGq85VRkK96v7vZHBFR23qD1xVflm+BksFAeFmakgMb0XoqFLVtEQEJ6r8Iw8f8D0dInSJ7al3ZILntslVInTNmKBwYo5pJebq41TLd7HPUVsDxw6KbULl/TGeOA79BW9E3DzWX60linHb0UTE+SFuHPDJxMXUL8YXBav/+8OrRmH3n4CJIEmjhQd4GoZ2pUtjfzMCXGIikpZ3qld2/KWazoh6mghxz5RNRbKcGhJSWAz4+JHu0712UEWmk7qeS9n98VvU8lQKA==
```

> The output of openssl is binary data, so we pipe it into base64 so that it's more easy to deal with.

Okay. So we have an encrypted real token. We can update our proxy token to include that instead of the plaintext real token.

```json
{
    "enc_real_token": "aR5PGrONkL8gCnymVu/JpbGFr6LySmkfP5XwTdjSqvM7rPKKh8kBY0CV4KPGq1Axf77AinNGrNrwGq85VRkK96v7vZHBFR23qD1xVflm+BksFAeFmakgMb0XoqFLVtEQEJ6r8Iw8f8D0dInSJ7al3ZILntslVInTNmKBwYo5pJebq41TLd7HPUVsDxw6KbULl/TGeOA79BW9E3DzWX60linHb0UTE+SFuHPDJxMXUL8YXBav/+8OrRmH3n4CJIEmjhQd4GoZ2pUtjfzMCXGIikpZ3qld2/KWazoh6mghxz5RNRbKcGhJSWAz4+JHu0712UEWmk7qeS9n98VvU8lQKA==",
    "permissions": ["read"]
}
```

When our proxy gets the proxy token it can use its **private** key to decrypt the token. Here's an example using the command-line:

```bash
$ echo "ENCODED_TOKEN" | base64 -D | openssl rsautl -decrypt -inkey private.pem
REAL_TOKEN
```

> Once again we're using base64 here - but in reverse to decode the encoded token before passing its binary data to openssl.

Great. Okay - so at this point we have the ability to create a proxy token that holds the real API token but makes it inaccessible to anyone but the proxy. However, there's a problem. The permissions are part of the token, too! Someone could just edit our token and add new permissions. Yikes!


## Preventing tampering

Let's once again remember what our wise teacher, Wikipedia, told us about public-key cryptography:

> A sender can combine a message with a private key to create a short digital signature on the message. Anyone with the corresponding public key can combine a message, a putative digital signature on it, and the known public key to verify whether the signature was valid, i.e. made by the owner of the corresponding private key.

So we could *sign* the proxy token with our **private key** and if anyone messed with the contents then the signature would be invalid. This is perfect.

Let's take our token and send it through OpenSSL to get a signature for it.

It's easier to do this on the command-line if the thing you're trying to sign is in a file. So I just saved the token above as `unsigned.json`.

```bash
openssl dgst -sha256 -sign keys/private.pem unsigned.json | base64
Tq5G2ZRfxy9+TiVcHU5+RY48CW43UyEDuc2RUtDpUZa16oae0zYXDplwnprqgbZfISs2EC7yCONdFfzdatGpc2Ks4sOmccZhqyUTqmNPADRQVfldawn/GymxviLLbwxHf3hML3KtP/tpEMC2zuygGmnnddbYsTBHy9/TkZFouUSH33CJbVcy4X7S1wtdTiaB7Wsp4ukcd486QXoDWngWKwpu77+uSU9aGAGNvRm2+pqiAih2UxV12FpsJrIQo2y7nMPaNd8CE1ClTt7bsIHp96qHoIE4azWvyuEPy4SfBUHcZS6XiQ/ogYs2iSYryiWdB8OxZdR4YB2QWRQXyNicZw==
```

So the base64 data it spits out is the signature. So now we can send *both* our proxy token and its signature to our proxy and our proxy can ensure that it's the one that generated the token. Something like this would work:

```bash
$ http GET https://github-proxy.thea.codes/gists "Authorization: token PROXY-TOKEN sig PROXY-SIGNATURE"
```

But it turns out there's already a well-defined standard for this - [JSON Web Tokens](https://jwt.io/)!

## JWTs for proxy tokens

JWT can sound scary but we're basically already doing 90% of it at this point. A JWT is just a way of encapsulating some data so that it can be verified. It's made of three parts: a *header*, a *payload*, and a *signature*. We've already got the *payload* and most of *signature* part down. We just need to put it all in the right format. Luckily we don't have to do all this ourselves, we can use a library like [PyJWT](https://pyjwt.readthedocs.io/en/latest/usage.html#encoding-decoding-tokens-with-rs256-rsa):

```python
import pathlib
import jwt

private_key = pathlib.Path("keys/private.pem").read_text()
payload = {
    "enc_real_token": "aR5PGrONkL8gCnymVu/JpbGFr6LySmkfP5XwTdjSqvM7rPKKh8kBY0CV4KPGq1Axf77AinNGrNrwGq85VRkK96v7vZHBFR23qD1xVflm+BksFAeFmakgMb0XoqFLVtEQEJ6r8Iw8f8D0dInSJ7al3ZILntslVInTNmKBwYo5pJebq41TLd7HPUVsDxw6KbULl/TGeOA79BW9E3DzWX60linHb0UTE+SFuHPDJxMXUL8YXBav/+8OrRmH3n4CJIEmjhQd4GoZ2pUtjfzMCXGIikpZ3qld2/KWazoh6mghxz5RNRbKcGhJSWAz4+JHu0712UEWmk7qeS9n98VvU8lQKA==",
    "permissions": ["read"]
}

token = jwt.encode(payload, private_key, algorithm='RS256')

print(token.decode("utf-8"))
```

You should get something like this:

```
eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJlbmNfcmVhbF90b2tlbiI6ImFSNVBHck9Oa0w4Z0NueW1WdS9KcGJHRnI2THlTbWtmUDVYd1RkalNxdk03clBLS2g4a0JZMENWNEtQR3ExQXhmNzdBaW5OR3JOcndHcTg1VlJrSzk2djd2WkhCRlIyM3FEMXhWZmxtK0Jrc0ZBZUZtYWtnTWIwWG9xRkxWdEVRRUo2cjhJdzhmOEQwZEluU0o3YWwzWklMbnRzbFZJblRObUtCd1lvNXBKZWJxNDFUTGQ3SFBVVnNEeHc2S2JVTGwvVEdlT0E3OUJXOUUzRHpXWDYwbGluSGIwVVRFK1NGdUhQREp4TVhVTDhZWEJhdi8rOE9yUm1IM240Q0pJRW1qaFFkNEdvWjJwVXRqZnpNQ1hHSWlrcFozcWxkMi9LV2F6b2g2bWdoeHo1Uk5SYktjR2hKU1dBejQrSkh1MDcxMlVFV21rN3FlUzluOThWdlU4bFFLQT09IiwicGVybWlzc2lvbnMiOlsicmVhZCJdfQ.GAxcONwT7M4Gvk_OGEuQKHqMlRDGOxDixkEMlC-tYlDIJEjkDkW_YLY4oBiKEtGwmn97wdvXsnds9eheFt3SO4oOPfkYYHbJRQxRZnhhDRgY_CkX9_uYjeaLB-ttNoiSTYYMGaCcxP8VsNc06jS5S7-1RXGJ30gK_gwwhSNHexn5tppAFDDzoD4g-0vWXBx3i1mLanyFQvY1iMGV0JYg1Y48M6Bx8wClYeGGq6lXy6h7H-NgisJDl8pr-C_hOu_mmsLhgM2fEiDKa_2JE9ToWtv2v9inZ4YbiAmJJd-6TIv1jeLJinzVjxgEMesiDBVm1l0pSZ7R2c5tgOxkrvGE4g
```

You can drop that into the debugger at [jwt.io](https://jwt.io) to see your token's content. This example one looks like this:

```javascript
header = {
  "typ": "JWT",
  "alg": "RS256"
}

payload = {
  "enc_real_token": "aR5PGrONkL8gCnymVu/JpbGFr6LySmkfP5XwTdjSqvM7rPKKh8kBY0CV4KPGq1Axf77AinNGrNrwGq85VRkK96v7vZHBFR23qD1xVflm+BksFAeFmakgMb0XoqFLVtEQEJ6r8Iw8f8D0dInSJ7al3ZILntslVInTNmKBwYo5pJebq41TLd7HPUVsDxw6KbULl/TGeOA79BW9E3DzWX60linHb0UTE+SFuHPDJxMXUL8YXBav/+8OrRmH3n4CJIEmjhQd4GoZ2pUtjfzMCXGIikpZ3qld2/KWazoh6mghxz5RNRbKcGhJSWAz4+JHu0712UEWmk7qeS9n98VvU8lQKA==",
  "permissions": [
    "read"
  ]
}
```

Which is *exactly* what we put in. :)

This is **really cool**. We now have a token that:

1. Contains the real API token, but only the proxy can read it.
2. Contains the permissions, but they can't be tampered with.
3. Can be verified using the proxy's public key if someone wanted to.
4. Can even be introspected by users of the proxy to see what permissions it has.

Seems pretty magical to me! ✨
