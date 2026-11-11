# Owner requirements (verbatim intent, from the site owner)
Polish Quest is a website meant to earn money by helping indie game developers make their game better.
It takes a game .zip (read in the browser) and gives ordered prompts (26 + ground rules + Fix Kit) for an AI coding tool.

Owner complaints about the OLD site (see before screenshots):
- Not professional. A lot of trash text. Not concise. Not beginner friendly.
- Pixel-font text is hard to read.
- It presents everything at the front instead of one thing at a time, one whole screen each.
- Too many colors. It looks dead.
- Professional AI sites even use Three.js.

Owner wants:
- Rebuild freely: delete, add, change anything.
- Use a free AI API inside the website (so it will no longer work offline): Coarena, OpenAI-compatible,
  base https://coarena.ai/api/v1 , model id claude-fable-5-2 (called "Fable 5.2"). The key lives ONLY in a server function (env.COARENA_API_KEY). Never in browser code or the repo.
- Tutorial must be a VISUAL guide, not reading: a hand pointing at things, one by one.
- A talking character (mascot) as tutorial that does NOT pause the website; the user keeps going while it talks.
- Goal: make the first 25 US dollars. Think hard about what makes it appealing to indie devs who want everything STEP BY STEP.
- Three.js (a real 3D scene, light and tasteful, with a fallback when WebGL is missing).
