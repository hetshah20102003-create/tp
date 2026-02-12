#!/usr/bin/env python3
"""LinkedIn Auto-Poster — generates and publishes daily LinkedIn posts using Claude."""

import argparse
import logging
import sys

import config
from content_generator import (
    generate_post,
    load_post_history,
    load_topics,
    pick_topic,
    save_to_history,
)
from linkedin_client import post_to_linkedin

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


def main():
    parser = argparse.ArgumentParser(description="LinkedIn Auto-Poster")
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Generate a post but don't publish it to LinkedIn",
    )
    args = parser.parse_args()

    # Validate config
    if not config.ANTHROPIC_API_KEY:
        logger.error("ANTHROPIC_API_KEY not set. Check your .env file.")
        sys.exit(1)

    if not args.dry_run and (not config.LINKEDIN_ACCESS_TOKEN or not config.LINKEDIN_PERSON_ID):
        logger.error("LinkedIn credentials not set. Run 'python setup_linkedin.py' first.")
        sys.exit(1)

    # Load topics
    topics = load_topics()
    if not topics:
        logger.error("No topics found. Add topics to content/topics.txt")
        sys.exit(1)

    history = load_post_history()

    # Pick a topic
    topic = pick_topic(topics, history)
    logger.info(f"Selected topic: {topic}")

    # Generate post
    logger.info("Generating post with Claude...")
    post_content = generate_post(topic, history)
    logger.info(f"Generated post ({len(post_content)} chars):\n\n{post_content}\n")

    if args.dry_run:
        logger.info("DRY RUN — post was NOT published to LinkedIn.")
        save_to_history(topic, post_content, posted=False)
        return

    # Post to LinkedIn
    logger.info("Publishing to LinkedIn...")
    success, response = post_to_linkedin(post_content)

    if success:
        logger.info("Post published successfully!")
        save_to_history(topic, post_content, posted=True)
    else:
        logger.error(f"Failed to post: {response}")
        save_to_history(topic, post_content, posted=False)
        sys.exit(1)


if __name__ == "__main__":
    main()
