const express = require('express');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('Hello Express app2!')
});

const snippets = {};
const snippetBaseUrl = 'https://SnippetNodejs.fanzy446.repl.co/snippets';

function checkAndClearName(name) {
  const snippet = snippets[name];
  if (!snippet) {
    return;
  }
  const curTime = new Date();
  if (snippet.expiresAt <= curTime) {
    delete snippets[name];
  }
}

app.post('/snippets', (req, res) => {
  const name = req.body.name;
  checkAndClearName(name);
  const snippet = req.body.snippet;
  const password = req.body.password;
  const expiresIn = req.body.expires_in;
  const expiresAt = new Date();
  expiresAt.setSeconds(expiresAt.getSeconds() + expiresIn);
  snippets[name] = {
    expiresAt,
    snippet,
    password,
  };
  res.status(201).send({
    url: snippetBaseUrl + '/' + name,
    name,
    expires_at: expiresAt,
    snippet: snippet,
    password: password,
  });
});

app.get('/list_snippets', (req, res) => {
  res.send(snippets);
});

app.get('/snippets/:name', (req, res) => {
  const name = req.params.name;
  checkAndClearName(name);
  const curTime = new Date();
  const snippet = snippets[name];
  if (!snippet) {
    res.sendStatus(404);
    return;
  }
  res.send({
    url: snippetBaseUrl + '/' + name,
    name,
    expires_at: snippet.expiresAt,
    snippet: snippet.snippet,
  });
});

app.put('/snippets/:name', (req, res) => {
  const name = req.params.name;
  checkAndClearName(name);
  const existingSnippet = snippets[name];
  if (!existingSnippet) {
    res.sendStatus(404);
    return;
  }
  const snippet = req.body.snippet;
  const password = req.body.password;
  const expiresIn = req.body.expires_in;
  
  const curTime = new Date();
  // Only check password when the snippet is protected by one.
  // Return 403 if the password isn't correct.
  if (existingSnippet.password && existingSnippet.password !== password) {
    res.sendStatus(403);
    return;
  }
  // If snippet is not specified. The user doesn't intend to update the snippet, but the expiration time.
  if (snippet !== undefined) {
    existingSnippet.snippet = snippet;
  }
  // Update expiration if specified, otherwise extend the expiration date by 30 secs.
  if (expiresIn === undefined) {
    existingSnippet.expiresAt.setSeconds(existingSnippet.expiresAt.getSeconds() + 30);
  } else {
    existingSnippet.expiresAt.setSeconds(existingSnippet.expiresAt.getSeconds() + expiresIn);
  }
  res.send({
    url: snippetBaseUrl + '/' + name,
    name,
    expires_at: existingSnippet.expiresAt,
    snippet: existingSnippet.snippet,
    password: existingSnippet.password,
  })
});

app.listen(3000, () => {
  console.log('server started');
});