---
title: My Python testing style guide
date: 2017-07-15
legacy_url: yes
---

This post is an attempt to catalog some of my practices around testing Python projects. It's not meant to be treated as dogma- I anticipate I'll update this significantly over time.

### Some terminology

* A **target** is a single that that you are currently testing. It can be a function, a method, or a behavior that's formed by a set of items.
* A **collaborator** is any object used by the *target* subject under test. Generally, collaborators should be inputs to the target (either function arguments or instance variables), but sometimes the collaborators are deeper objects like sockets.
* I do not make a distinction between **unit tests** and **integration tests**. I generally refer to these types of tests as unit tests. I do not go out of my way to isolate a single unit of code and test it without consideration of the rest of the project. I do try to isolate a single unit of *behavior*.
* **System tests** are tests that interact with real external systems. This is in contrast to unit tests, which should not do anything that leaves the local machine.

### Test names, functions, and classes

Follow [pytest's recommendations here](https://docs.pytest.org/en/latest/goodpractices.html#conventions-for-python-test-discovery). Test files should be named according to their module they test, for example, `transport.py` should be tested by `test_transport.py`.

General rule of thumb is to match the name of the tests to the name of the test's target:

```python
def refresh(...):
    ...

def test_refresh():
    ...
```

For testing different behaviors, failure modes, and edge cases, add additional tests with a brief explanation added to the test name:

```python
def test_refresh_failure():
    ...

def test_refresh_with_timeout():
    ...
```

In general, functions should be tested with a test suite containing just functions whereas classes can be tested with either a suite of functions or those functions can be organized into a class. Organizing into a test class can be useful for modules that have more than one class:

```python
def Thing(object):
   ...

def TestThing(object):
   test_something(self):
       ...
```

Class instance creation tests should be named `test_constructor` and it's also useful to have tests such as `test_default_state`:

```python
def test_default_state(self):
    credentials = self.make_credentials()
    # No access token, so these shouldn't be valid.
    assert not credentials.valid
    # Expiration hasn't been set yet
    assert not credentials.expired
    # Scopes aren't required for these credentials
    assert not credentials.requires_scopes
```

### Assert results and outcome, not the steps needed to get there

Aim to test a *single thing* at a time. Tests should follow the same rule of thumb as functions: it should do (in this case *test*) one thing and one thing well. Don't obsess over only calling one function at at time or only calling it once. Sometimes testing the outcome involves issuing multiple invocations. Your assertions should test that the state of the world matches the outcome you expected, not that the code took any particular path to get there.

For example, this test knows too much about how the outcome is obtained and is brittle in the face of implementation changes:

```python
test_payload = {'test': 'value'}
encoded = jwt.encode(signer, test_payload)
expected_header = {'typ': 'JWT', 'alg': 'RS256', 'kid': signer.key_id}
expected_call = json.dumps(expected_header) + '.' + json.dumps(test_payload)
singer.sign.assert_called_once_with(expected_call)
```

This test is much better, it just checks that the outcome was as anticipated:

```python
test_payload = {'test': 'value'}
encoded = jwt.encode(signer, test_payload)
header, payload, _, _ = jwt._unverified_decode(encoded)
assert payload == test_payload
assert header == {'typ': 'JWT', 'alg': 'RS256', 'kid': signer.key_id}
```

In general, I see an abundance of `assert_call*` invocations as a code smell that the tests are doing too much mocking or demonstrating too much knowledge about the internals. Unless the point of the test to is to make sure that the target calls a collaborator a specific way, ask yourself if you need the assertion to confirm the target worked as expected. It's also useful to pretend you can't look at the implementation of the target (so called *black-box testing*).

### Use real objects for collaborators whenever possible

Sure, unit test purists may balk at this, but being able to use a collaborator directly catches bugs and encourages you to implement functions and classes in a way that their logic can be used without unintended side-effects. If you're having a really hard time using collaborators without side-effects, it might be useful to consider how you can refactor and simplify it.

Here's an example of making a mock of a collaborator (re-using a previous example):

```python
signer = mock.make_autospec(crypt.Signer, instance=True)
signer.key_id = 1

test_payload = {'test': 'value'}
encoded = jwt.encode(signer, test_payload)

expected_header = {'typ': 'JWT', 'alg': 'RS256', 'kid': signer.key_id}
expected_call = json.dumps(expected_header) + '.' + json.dumps(test_payload)
singer.sign.assert_called_once_with(expected_call)
```

When using the real thing allows you to verify the outcome instead of the steps:

```python
signer = crypt.RSASigner.from_string(PRIVATE_KEY_BYTES, '1')
test_payload = {'test': 'value'}
encoded = jwt.encode(signer, test_payload)
header, payload, _, _ = jwt._unverified_decode(encoded)
assert payload == test_payload
assert header == {'typ': 'JWT', 'alg': 'RS256', 'kid': signer.key_id}
```

If you notice your tests are essentially re-implementing a target's logic, it might be useful to re-think how you're testing.

### A mock must always have a spec

When you have to mock avoiding using the `Mock` object directly. Either use [`mock.create_autospec()`](https://docs.python.org/3/library/unittest.mock.html#unittest.mock.create_autospec) or [`mock.patch(autospec=True)`](https://docs.python.org/3/library/unittest.mock.html#autospeccing) if at all possible. Autospeccing from the real collaborator means that if the collaborator's interface changes, your tests will fail. Manually speccing or not speccing at all means that changes in the collaborator's interface will not break your tests that use the collaborator: you could have 100% test coverage and your library would fall over when used!

For example, this is **very bad** as it allows your target to call pretty much any method on the collaborator, whether it exists or not:

```python
signer = mock.Mock()

encoded = jwt.encode(signer, test_payload)
...
singer.sign.assert_called_once_with(expected_call)
```

Manually specifying a `spec` is slightly better but still bad because it's disconnected from the real collaborator's interface. This opens the door to a refactor breaking your library but not your tests:

```python
signer = mock.Mock(spec=['sign', 'key_id'])

encoded = jwt.encode(signer, test_payload)
...
singer.sign.assert_called_once_with(expected_call)
```

The *right* way to do this is to use `mock.create_autospec()` or `mock.patch(..., autospec=True)`. This ensures there's some connection between your mock and the real collaborator's interface. If you change the collaborator's interface in a way that breaks downstream targets, those targets tests will rightfully fail:

```python
signer = mock.create_autospec(crypt.Signer, instance=True)

encoded = jwt.encode(signer, test_payload)
...
singer.sign.assert_called_once_with(expected_call)
```

In some cases it's just not feasible to use autospec, such as if you're mocking a import module that is otherwise unavailable in your environment. This rule can be relaxed in those circumstances.

### Consider using a stub or fake

Mock is extremely powerful, but if you find yourself bending over backwards to get a mock to behave how you expect, consider creating a stub. A **stub** has a few canned responses or behavior useful for unit tests and a **fake** has essentially a working implementation but takes shortcuts that wouldn't happen with a real collaborator (like an in-memory database).

Here's a simple stub that implements an abstract class for the purposes of testing:

```python
class CredentialsStub(google.auth.credentials.Credentials):
    def __init__(self, token='token'):
        super(CredentialsStub, self).__init__()
        self.token = token

    def apply(self, headers, token=None):
        headers['authorization'] = self.token

    def before_request(self, request, method, url, headers):
        self.apply(headers)

    def refresh(self, request):
        self.token += '1'
```

Here's a simple fake of an in-memory Memcache client:

```python
class MemcacheFake(object):
    def __init__(self):
        self._data = {}

    def set(self, key, value):
        self._data[key] = value

    def get(self, key):
        return self._data.get(key)
```

Whenever possible the stub or fake should subclass the collaborator. This allows tools like pylint to check if you're implementing the interface correctly and helps catch bugs when the collaborator's interface changes.

### Consider using a spy

If you find yourself using a mock just so you can make assertions about calls, consider using a spy. A **spy** is an object that forwards and records interactions. Mock has built-in support for spying using `wraps`:

```python
credentials = mock.Mock(wraps=CredentialsStub())
...
assert credentials.refresh.called
```

### Don't give mock/stubs/fakes special names

Mocks should be named just the same as if they were a real collaborator. Don't use `mock_x`, `x_mock`, `mocked_x`, `fake_x`, etc., just use `x`. The reasoning for this is that it encourages you to think of the mocks as the same as real collaborators and makes the intent of the test clearer. For example, this is unnecessary:

```python
mock_signer = mock.create_autospec(crypt.Signer, instance=True)
```

Just call it `signer`:

```python
signer = mock.create_autospec(crypt.Signer, instance=True)
```

Same with patching, don't do this:

```python
@mock.patch('google.auth._helpers.utcnow')
def test_refresh_success(mock_utcnow):
    mock_utcnow.return_value = datetime.datetime.min
    ...
```

Just call it `utcnow`:

```python
@mock.patch('google.auth._helpers.utcnow')
def test_refresh_success(utcnow):
    utcnow.return_value = datetime.datetime.min
    ...
```

If you're using `patch` as a context manager, it's fine to give the patch a name like `x_patch`:

```python
utcnow_patch = mock.patch('google.auth._helpers.utcnow')
with utcnow_patch as utcnow:
    utcnow.return_value = datetime.datetime.min
    ...
```

Note the `utcnow_patch as utcnow:` makes it even clearer why this recommendation makes sense: you are creating a substitute, a stand-in, call it the same name.

Also, if you using a patch decorator and not using the mock it's fine to name it `unused_x`:

```python
@mock.patch('google.auth._helpers.utcnow')
def test_refresh_success(unused_utcnow):
    ...
```

### Use factory helpers to create complex collaborators

Tests sometimes need complex setup. In general, favor helper methods and factories to create collaborators. For example, this factory creates a mock http object that returns a specific response:

```python
def make_http(data, status=http_client.OK, headers=None):
    response = mock.create_autospec(transport.Response, instance=True)
    response.status = status
    response.data = _helpers.to_bytes(data)
    response.headers = headers or {}

    http = mock.create_autospec(transport.Request)
    http.return_value = response

    return request
```

This can be used from multiple tests to verify behavior:

```python
def test_refresh_success():
    http = make_http('OK')
    assert refresh(http)

def test_refresh_failure():
    http = make_http('Not Found', status=http_client.NOT_FOUND)
    with pytest.raises(exceptions.TransportError):
        refresh(http)
```

### Use fixtures sparingly
[pytest's fixtures](https://docs.pytest.org/en/latest/fixture.html) are a great feature for re-using setup and teardown logic. In general, prefer factory and helper methods over fixtures as it's easier to reason about and pass arguments into helper methods. Fixtures are great for things that are largely identical across tests and require both setup and teardown logic, for example, this is a fixture that starts a web server in the background for each test and shuts it down after the test is complete:

```python
@pytest.fixture()
def server():
    server = WSGIServer(application=TEST_APP)
    server.start()
    yield server
    server.stop()
```

Fixtures can also be useful in system tests for injecting complex dependencies that may require cleanup, for example, this is a fixture that returns a database client and deletes all items in the database once the test is complete:

```python
@pytest.fixture()
def database():
    db = database.Client()
    yield db
    db.delete(db.list_all())
```

Another good reason to use a fixture is for *dependency injection*, such as if you want to ensure you test multiple implementations of an abstract class. Again, this is more useful in system tests. For example, this fixture makes sure all tests are run with the urllib3 and requests transports:

```python
@pytest.fixture(params=['urllib3', 'requests'])
def http_request(request):
    if request.param == 'urllib3':
        yield google.auth.transport.urllib3.Request(URLLIB3_HTTP)
    elif request.param == 'requests':
        yield google.auth.transport.requests.Request(REQUESTS_SESSION)
```
