# dynastydestroyer

## OpenAI API key for keeper notes

This project uses Create React App, so local development reads OpenAI from:

```txt
.env.local
```

Add:

```txt
REACT_APP_OPENAI_API_KEY=your_api_key_here
```

Do not commit `.env.local`.

The current keeper notes integration calls OpenAI from the frontend for development. Before production, move this call to a backend or Firebase Cloud Function so the API key is not exposed to users.
