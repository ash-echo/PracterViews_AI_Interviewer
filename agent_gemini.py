from dotenv import load_dotenv

from livekit import agents, rtc
from livekit.agents import AgentServer, AgentSession, Agent, room_io
from livekit.plugins import (
    google,
    noise_cancellation,
)
from prompts import SYSTEM_PROMPT

load_dotenv(".env")

class Assistant(Agent):
    def __init__(self) -> None:
        super().__init__(instructions=SYSTEM_PROMPT)

server = AgentServer()

@server.rtc_session()
async def my_agent(ctx: agents.JobContext):
    session = AgentSession(
        llm=google.realtime.RealtimeModel(
            voice="Puck",  
            model="gemini-2.0-flash-exp"
        )
    )

    @session.on("conversation_item_added")
    def on_item_added(event: agents.ConversationItemAddedEvent):
        item = event.item
        if item.type == "message":
            if item.role == "assistant" and item.text_content:
                print(f"Agent: {item.text_content}")
            elif item.role == "user" and item.text_content:
                print(f"User: {item.text_content}")

    await session.start(
        room=ctx.room,
        agent=Assistant(),
        room_options=room_io.RoomOptions(
            audio_input=room_io.AudioInputOptions(
                noise_cancellation=lambda params: noise_cancellation.BVCTelephony() if params.participant.kind == rtc.ParticipantKind.PARTICIPANT_KIND_SIP else noise_cancellation.BVC(),
            ),
        ),
    )

    await session.generate_reply(
        instructions="Greet the user and offer your assistance. You should start by speaking in English."
    )


if __name__ == "__main__":
    agents.cli.run_app(server)
