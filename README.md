# Flashcards Web

A static browser-based flashcard quiz that can be hosted free on GitHub Pages.

## Features

- Open a local `.tsv` question file
- Filename becomes the deck title
- Ordered or random question mode
- Previous / Next navigation
- Answers are preserved while navigating
- Shows correct/wrong feedback
- Shows the correct answer after a wrong selection
- Results screen
- Review wrong answers
- No backend/server/database required
- TSV file stays on the user's device

## TSV format

### Simple six- to eight-column format

No header is required:

```tsv
Question	Answer A	Answer B	Answer C	Answer D	Correct	Comment	Author
```

`Comment` and `Author` are optional. The comment is revealed after the question is answered; the author is shown with the question.

The `Correct` value can be:

- `A`, `B`, `C`, or `D`
- `1`, `2`, `3`, or `4`
- the exact answer text

A header row is also supported. Recognized headings include:

- `question` or `prompt`
- `a`, `answer_a`, `option_a`
- `b`, `answer_b`, `option_b`
- `c`, `answer_c`, `option_c`
- `d`, `answer_d`, `option_d`
- `correct`, `answer`, or `correct_answer`
- `comment`, `comments`, `explanation`, or `note`
- `author`, `autor`, or `created_by`

## Run locally

You can simply open `index.html` in a modern browser.

For a more realistic local test, run a local static server from the project directory, for example:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Publish with GitHub Pages

1. Put `index.html`, `style.css`, and `app.js` in the root of your GitHub repository.
2. Push the files to GitHub.
3. Open the repository on GitHub.
4. Go to **Settings → Pages**.
5. Under **Build and deployment**, choose **Deploy from a branch**.
6. Select your main branch and `/ (root)`.
7. Save.

## Contributions are welcome.

You can:
- report bugs
- suggest new features
- improve the interface
- improve TSV support
- submit pull requests

Please open an issue first for major changes.
GitHub will provide the public Pages address after deployment.
