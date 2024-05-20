# VSC Discord Bot

[VSC Blocks](https://vsc.techcoderx.com) but in a chat bot interface (currently on Discord) with notifications on various events.

## Docker Setup

```bash
git clone https://github.com/techcoderx/vsc-chatbot
cd vsc-chatbot
git submodule update --init --recursive
./scripts/build_instance.sh
```

Copy `.env.example` to `.env` and fill in the required environment variables. Then run `docker compose up -d` to start the bot.