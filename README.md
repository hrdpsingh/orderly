# Orderly

**Orderly** is a tool that automatically prioritizes GitHub issues by urgency, helping maintainers and teams focus on what matters most.

🔗 **Live demo:** [orderly-theta-five.vercel.app](https://orderly-theta-five.vercel.app/)

## Overview

Triaging a growing backlog of GitHub issues is time-consuming and subjective. Orderly analyzes the text of each issue, estimates the likelihood that it falls into each urgency category (**Low**, **Medium**, or **High**), and sorts the issues so the most urgent ones appear first.

## How It Works

1. **Fetch:** Issues are pulled from a GitHub repository via the GitHub API.
2. **Embed:** Each issue's title and body are converted into semantic embeddings using Sentence Transformers.
3. **Classify:** The model assigns a probability to each urgency category (Low, Medium, High).
4. **Rank:** Issues are sorted by urgency so the most critical ones surface at the top.

## Features

- Automatic urgency scoring for GitHub issues
- Probability-based classification across three urgency levels
- Issues sorted by priority
- Clean, responsive UI

## Tech Stack

| Layer      | Technology |
|------------|------------|
| Backend    | [FastAPI](https://fastapi.tiangolo.com/) |
| Frontend   | [React](https://react.dev/) |
| Styling    | [Tailwind CSS](https://tailwindcss.com/) |
| Data Source| [GitHub API](https://docs.github.com/en/rest) |
| NLP / ML   | [Sentence Transformers](https://www.sbert.net/) |

## Getting Started

```bash
# Clone the repository
git clone https://github.com/hrdpsingh/orderly.git
cd orderly

# Backend
cd backend
uv sync
uvicorn main:app --reload

# Frontend
cd ../frontend
npm install
npm run dev
```

## Usage

1. Open the app.
2. Enter a GitHub repository (e.g., `owner/repo`).
3. View the issues ranked by urgency, along with their predicted probabilities.

## Future Improvements

- Custom urgency labels and thresholds
- More advanced model if compute allows

## License

Distributed under the [MIT License](LICENSE).