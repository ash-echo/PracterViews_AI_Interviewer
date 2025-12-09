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
    gemini_model = google.realtime.RealtimeModel(
        voice="Puck",
        model="gemini-2.5-flash-native-audio-preview-09-2025"
    )

    session = AgentSession(
        llm=gemini_model
    )

    @session.on("conversation_item_added")
    def on_item_added(event: agents.ConversationItemAddedEvent):
        item = event.item
        if item.type == "message":
            if item.role == "assistant" and item.text_content:
                print(f"Agent: {item.text_content}")
            elif item.role == "user" and item.text_content:
                print(f"User: {item.text_content}")

    
    room_name = ctx.room.name
    print(f"[AGENT] Connected to room: {room_name}")
    
   
    if "-interview" in room_name:
        # Extract type from "fullstack-interview-abc123" -> "fullstack"
        interview_type = room_name.split("-interview")[0]
        print(f"[AGENT] Extracted interview type from room name: {interview_type}")
    else:
        interview_type = "default"
        print(f"[AGENT] Could not extract type from room name, using default")
    
 
    if interview_type not in INTERVIEW_PROMPTS:
        print(f"[AGENT] Interview type '{interview_type}' not found in prompts, falling back to default")
        interview_type = "default"
    
    print(f"[AGENT] Final interview type: {interview_type}")
    

    assistant = Assistant(interview_type=interview_type)

   
    avatar = tavus.AvatarSession(
        replica_id=os.environ.get("REPLICA_ID"),
        persona_id=os.environ.get("PERSONA_ID"),
        api_key=os.environ.get("TAVUS_API_KEY"),
    )
    
    # Fallback Beyond Presence avatar
    try:
        print("[AGENT] Attempting to start Tavus avatar...")
        await avatar.start(session, room=ctx.room)
        print("[AGENT] Tavus avatar started successfully.")
    except Exception as e:
        error_msg = str(e).lower()
        print(f"[AGENT] Tavus failed to start: {e}")
        
        
        fallback_triggers = [
            "credits", "limit", "fallback triggered", "quota", 
            "provider unavailable", "payment required", "avatar error"
        ]
        
       
        if any(trigger in error_msg for trigger in fallback_triggers) or True:
            print("[AGENT] Triggering fallback to Beyond Presence...")
            try:
                
                print("[AGENT] Switching Gemini voice to Male (Puck)...")
                gemini_model.voice = "Puck"
                
               
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
    
    # Data listener for receiving resume/GitHub data from frontend
    @ctx.room.on("data_received")
    def on_data_received(data: rtc.DataPacket):
        try:
            payload = json.loads(data.data.decode("utf-8"))
            data_type = payload.get("type", "")
            content = payload.get("content", "")
            
            print(f"[AGENT] Received data: type={data_type}, length={len(content)}")
            
            if data_type == "RESUME_DATA":
                print(f"[AGENT] Processing resume data...")
                # Inject resume context into the session
                asyncio.create_task(session.generate_reply(
                    instructions=f"""The candidate has shared their resume. Here is the content:

--- RESUME START ---
{content}
--- RESUME END ---

Acknowledge that you received their resume and ask a specific question about something mentioned in it (a technology, project, or experience). Be specific - reference actual content from the resume."""
                ))
                
            elif data_type == "GITHUB_DATA":
                print(f"[AGENT] Processing GitHub data...")
                # Inject GitHub context into the session
                asyncio.create_task(session.generate_reply(
                    instructions=f"""The candidate has shared their GitHub profile. Here is the summary:

--- GITHUB PROFILE ---
{content}
--- GITHUB END ---

Acknowledge that you reviewed their GitHub and ask about a specific repository or project mentioned. Be specific - reference actual repos or technologies from the data."""
                ))
                
        except Exception as e:
            print(f"[AGENT] Error processing received data: {e}")
    
    # Wait for a human participant to join before greeting
    print("[AGENT] Checking for human participants...")
    
    # Check existing participants
    human_present = False
    for p in ctx.room.remote_participants.values():
        if p.identity.startswith("user-"):
            human_present = True
            print(f"[AGENT] Found existing human participant: {p.identity}")
            break
            
    if not human_present:
        print("[AGENT] No human participant found. Waiting for user to join...")
        user_joined_event = asyncio.Event()
        
        @ctx.room.on("participant_joined")
        def on_participant_joined(participant: rtc.RemoteParticipant):
            if participant.identity.startswith("user-"):
                print(f"[AGENT] Human participant joined: {participant.identity}")
                user_joined_event.set()
        
        # Wait for the event
        await user_joined_event.wait()
    
    print(f"[AGENT] Generating greeting for interview type: {interview_type}")
    
    # Wait for session to stabilize before greeting
    await asyncio.sleep(2)
    
    # Retry greeting up to 3 times if it fails
    for attempt in range(3):
        try:
            print(f"[AGENT] Greeting attempt {attempt + 1}...")
            await session.generate_reply(
                instructions="Introduce yourself as the interviewer and start the interview."
            )
            print("[AGENT] Greeting sent successfully!")
            break
        except Exception as e:
            print(f"[AGENT] Greeting attempt {attempt + 1} failed: {e}")
            if attempt < 2:
                await asyncio.sleep(2)  # Wait before retry
            else:
                print("[AGENT] All greeting attempts failed. Agent will respond when user speaks.")


if __name__ == "__main__":
    agents.cli.run_app(server)