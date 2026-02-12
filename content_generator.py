import json
import random
from datetime import datetime

import anthropic

import config


def load_topics():
    """Read topics from topics.txt, ignoring comments and blank lines."""
    if not config.TOPICS_FILE.exists():
        return []
    lines = config.TOPICS_FILE.read_text().strip().splitlines()
    return [line.strip() for line in lines if line.strip() and not line.strip().startswith("#")]


def load_post_history():
    """Load previously posted content to avoid repetition."""
    if not config.POST_HISTORY_FILE.exists():
        return []
    try:
        return json.loads(config.POST_HISTORY_FILE.read_text())
    except (json.JSONDecodeError, FileNotFoundError):
        return []


def pick_topic(topics, history):
    """Pick a topic that hasn't been used recently."""
    recent_topics = {entry.get("topic", "") for entry in history[-30:]}
    unused = [t for t in topics if t not in recent_topics]
    if not unused:
        # All topics used recently — reset and pick any
        unused = topics
    return random.choice(unused) if unused else None


def generate_post(topic, history):
    """Use Claude to generate a LinkedIn post about the given topic."""
    recent_posts = [entry.get("content", "") for entry in history[-5:]]
    recent_posts_text = "\n---\n".join(recent_posts) if recent_posts else "None yet."

    prompt = f"""Write a LinkedIn post about: {topic}

Requirements:
- 150-300 words
- Professional but conversational tone
- Include a hook in the first line to grab attention
- Add 2-3 relevant hashtags at the end
- Use short paragraphs and line breaks for readability
- End with a question or call-to-action to drive engagement
- Do NOT use emojis excessively (1-2 max if any)
- Make it feel authentic and personal, not corporate or generic

Here are the last few posts (avoid repeating similar angles):
{recent_posts_text}

Write ONLY the post content. No preamble, no explanation."""

    client = anthropic.Anthropic(api_key=config.ANTHROPIC_API_KEY)
    message = client.messages.create(
        model="claude-sonnet-4-5-20250929",
        max_tokens=1024,
        messages=[{"role": "user", "content": prompt}],
    )
    return message.content[0].text.strip()


def save_to_history(topic, content, posted):
    """Append this post to the history log."""
    history = load_post_history()
    history.append(
        {
            "date": datetime.now().isoformat(),
            "topic": topic,
            "content": content,
            "posted": posted,
        }
    )
    config.POST_HISTORY_FILE.write_text(json.dumps(history, indent=2))
