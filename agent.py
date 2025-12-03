from dotenv import load_dotenv

from livekit import agents, rtc
from livekit.agents import AgentServer, AgentSession, Agent, room_io
from livekit.plugins import (
    google,
    noise_cancellation,
)
from prompts import INTERVIEW_PROMPTS
from livekit.plugins import tavus, bey
import os
import json
import asyncio

load_dotenv(".env")

class Assistant(Agent):
    def __init__(self, interview_type="default") -> None:
        instructions = INTERVIEW_PROMPTS.get(interview_type, INTERVIEW_PROMPTS["default"])
        super().__init__(instructions=instructions)

server = AgentServer()

@server.rtc_session()
async def my_agent(ctx: agents.JobContext):
    session = AgentSession(
        llm=google.realtime.RealtimeModel(
            voice="Aoede",  # Female voice
            model="gemini-2.5-flash-native-audio-preview-09-2025"
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

    # Determine interview type from ROOM NAME!
    # Room names are like "devops-interview", "frontend-interview", etc.
    room_name = ctx.room.name
    print(f"[AGENT] Connected to room: {room_name}")
    
    # Extract type from room name (e.g., "devops-interview" -> "devops")
    if "-interview" in room_name:
        interview_type = room_name.replace("-interview", "")
        print(f"[AGENT] Extracted interview type from room name: {interview_type}")
    else:
        interview_type = "default"
        print(f"[AGENT] Could not extract type from room name, using default")
    
    # Validate that this type exists in our prompts
    if interview_type not in INTERVIEW_PROMPTS:
        print(f"[AGENT] Interview type '{interview_type}' not found in prompts, falling back to default")
        interview_type = "default"
    
    print(f"[AGENT] Final interview type: {interview_type}")
    
    # Create assistant with the correct type
    assistant = Assistant(interview_type=interview_type)

    # Initialize Tavus session
    avatar = tavus.AvatarSession(
        replica_id=os.environ.get("REPLICA_ID"),
        persona_id=os.environ.get("PERSONA_ID"),
        api_key=os.environ.get("TAVUS_API_KEY"),
    )
    
    # Fallback logic
    try:
        print("[AGENT] Attempting to start Tavus avatar...")
        await avatar.start(session, room=ctx.room)
        print("[AGENT] Tavus avatar started successfully.")
    except Exception as e:
        error_msg = str(e).lower()
        print(f"[AGENT] Tavus failed to start: {e}")
        
        # Check for specific failure conditions to trigger fallback
        fallback_triggers = [
            "credits", "limit", "fallback triggered", "quota", 
            "provider unavailable", "payment required", "avatar error"
        ]
        
        # Check if error message contains any trigger words OR if we want to be safe and fallback on any start error
        if any(trigger in error_msg for trigger in fallback_triggers) or True: # Using True to ensure fallback on ANY error for now
            print("[AGENT] Triggering fallback to Beyond Presence...")
            try:
                # Initialize Beyond Presence session
                # Using default or placeholder ID if not specified in env
                bey_avatar = bey.AvatarSession(
                    api_key=os.environ.get("BEY_API_KEY"),
                    avatar_id=os.environ.get("BEY_AVATAR_ID"), 
                )
                await bey_avatar.start(session, room=ctx.room)
                print("[AGENT] Beyond Presence avatar started successfully (Fallback).")
            except Exception as fallback_error:
                print(f"[AGENT] Fallback to Beyond Presence also failed: {fallback_error}")
        else:
            print("[AGENT] Tavus error did not trigger fallback criteria.")

    print(f"[AGENT] Starting session with interview type: {interview_type}")
    
    await session.start(
        room=ctx.room,
        agent=assistant,
        room_options=room_io.RoomOptions(
            audio_input=room_io.AudioInputOptions(
                noise_cancellation=lambda params: noise_cancellation.BVCTelephony() if params.participant.kind == rtc.ParticipantKind.PARTICIPANT_KIND_SIP else noise_cancellation.BVC(),
            ),
        ),
    )
    
    print(f"[AGENT] Generating greeting for interview type: {interview_type}")
    
    await session.generate_reply(
        instructions="Follow your system instructions exactly. Start with the OPENING statement defined in your instructions."
    )


if __name__ == "__main__":
    agents.cli.run_app(server)