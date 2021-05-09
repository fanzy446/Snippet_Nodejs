# Snippet_Nodejs

The implemention includes the basic requirements and the second extension of this exercise.

## Assumptions
* Snippets don't require persistence.
* The traffic is reasonable and doesn't require rate-limiting.
* The expire_in param is in a reasonable range.

## Design decisions
* Store snippets in an in-memory dictionary, to support fast lookup.
* Use a single endpoint to access the snippets. The endpoint logic parses the key from the url so the different snippet keys from request urls can be supported.
* Delete the expired snippets on the next access of the key, so the storage and the keys are not spammed and can be reused by other users. In actual production setup, I would add an additional component to purge snippets after they expire after a certain period of time.

## Addressed production concerns 
* When users try to update a snippet with a wrong password, the API rejects the request with error codes.

## Testing
The base url is https://SnippetNodejs.fanzy446.repl.co so you can create snippets at https://SnippetNodejs.fanzy446.repl.co/snippets

### MVP test cases
```
$ curl -X POST -H "Content-Type: application/json" -d '{"name":"recipe", "expires_in": 600, "snippet":"40 grapes"}' https://SnippetNodejs.fanzy446.repl.co/snippets
{"url":"https://SnippetNodejs.fanzy446.repl.co/snippets/recipe","name":"recipe","expires_at":"2021-05-09T01:33:55.543Z","snippet":"40 grapes"}

$ curl https://SnippetNodejs.fanzy446.repl.co/snippets/recipe
{"url":"https://SnippetNodejs.fanzy446.repl.co/snippets/recipe","name":"recipe","expires_at":"2021-05-09T01:33:55.543Z","snippet":"40 grapes"}
```

### Extension 2 test cases
```
$ curl -X POST -H "Content-Type: application/json" -d '{"name":"recipe", "expires_in": 600, "snippet":"40 grapes", "password": "1234"}' https://SnippetNodejs.fanzy446.repl.co/snippets
{"url":"https://SnippetNodejs.fanzy446.repl.co/snippets/recipe","name":"recipe","expires_at":"2021-05-09T01:23:34.729Z","snippet":"40 grapes","password":"1234"}
$ curl -X PUT -H "Content-Type: application/json" -d '{"password":"124", "snippet":"40 grapes and more and more", "expires_in": 50}' https://SnippetNodejs.fanzy446.repl.co/snippets/recipe
Forbidden
$ curl -X PUT -H "Content-Type: application/json" -d '{"password":"1234", "snippet":"40 grapes and more and more", "expires_in": 50}' https://SnippetNodejs.fanzy446.repl.co/snippets/recipe
{"url":"https://SnippetNodejs.fanzy446.repl.co/snippets/recipe","name":"recipe","expires_at":"2021-05-09T01:24:24.729Z","snippet":"40 grapes and more and more","password":"1234"}
$ curl -X PUT -H "Content-Type: application/json" -d '{"password":"1234"}' https://SnippetNodejs.fanzy446.repl.co/snippets/recipe
{"url":"https://SnippetNodejs.fanzy446.repl.co/snippets/recipe","name":"recipe","expires_at":"2021-05-09T01:24:54.729Z","snippet":"40 grapes and more and more","password":"1234"}
```