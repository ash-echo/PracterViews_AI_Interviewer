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
            
            elif data_type == "CODE_FEEDBACK":
                print(f"[AGENT] Speaking code feedback to candidate...")
                feedback_data = payload.get("feedback", {})
                score = feedback_data.get("score", 0)
                verdict = feedback_data.get("verdict", "Unknown")
                summary = feedback_data.get("summary", "")
                suggestions = feedback_data.get("suggestions", [])
                
                # Build the feedback speech
                suggestions_text = ""
                if suggestions:
                    suggestions_text = "Here are my suggestions for improvement: " + ". ".join(suggestions[:3])
                
                asyncio.create_task(session.generate_reply(
                    instructions=f"""You just reviewed the candidate's code submission. Speak naturally as if you're giving verbal feedback.

CODE EVALUATION RESULTS:
- Overall Score: {score} out of 100
- Verdict: {verdict}
- Summary: {summary}
{f'- Suggestions: {suggestions_text}' if suggestions_text else ''}

INSTRUCTIONS FOR YOUR RESPONSE:
1. Start by acknowledging their submission
2. Tell them their score and verdict in a conversational way
3. Explain the main feedback points briefly (don't read word for word, paraphrase naturally)
4. If score is low (below 30), be encouraging but honest about what needs work
5. If score is medium (30-70), highlight what they did well and what to improve
6. If score is high (70+), congratulate them and mention minor improvements
7. End by asking if they want to try again or move to the next question
8. Keep your response under 30 seconds of speaking time - be concise!"""
                ))
            
            elif data_type == "PHASE_CHANGE":
                phase = payload.get("phase", "")
                questions_required = payload.get("questionsRequired", 0)
                print(f"[AGENT] Phase changed to: {phase}, Questions: {questions_required}")
                
                # More direct, action-oriented instructions that trigger immediate response
                phase_instructions = {
                    "introduction": """START SPEAKING NOW. Welcome the candidate warmly to the interview. 
Say: "Hello and welcome! I'm excited to be your interviewer today. Let me quickly explain how this will work. We'll start with some questions about your resume and experience, then discuss your GitHub projects, followed by some technical questions, and finish with a coding challenge. Are you ready to begin?"
Wait for their response.""",

                    "resume": f"""START SPEAKING NOW. Transition to the Resume Round.
Say: "Great! Let's move to the Resume Round. I'd like to learn more about your experience."
Then immediately ask your FIRST question about their work experience, education, or a specific technology they've used.
You must ask exactly {questions_required} questions in this round. After each answer, ask the next question.
Be conversational and engage with their responses.""",

                    "github": f"""START SPEAKING NOW. Transition to the GitHub Round.
Say: "Excellent! Now let's talk about your GitHub projects and coding work."
Then immediately ask your FIRST question about their repositories, open source contributions, or coding projects.
You must ask exactly {questions_required} questions in this round.
Focus on technical decisions, challenges they faced, or interesting features they built.""",

                    "topic": f"""START SPEAKING NOW. Transition to the Topic Questions Round.
Say: "Great work so far! Now let's dive into some technical questions."
Then immediately ask your FIRST technical question relevant to the interview type (frontend, backend, etc.).
You must ask exactly {questions_required} technical questions.
These should test their knowledge depth. Ask follow-up questions based on their answers.""",

                    "coding": """START SPEAKING NOW. Announce the Coding Round.
Say: "Excellent work on all your answers! Now it's time for your coding challenge. I've given you a problem in the IDE - you can find it by clicking the 'IDE' button at the top right of your screen, right next to the Assets button. Take your time to read the question carefully, write your solution, and when you're ready, click 'Run Code' to submit. I'll give you feedback once you're done. Good luck!"
Wait quietly for them to complete the coding challenge.""",

                    "report": """START SPEAKING NOW. Conclude the interview.
Say: "That concludes our interview! Thank you so much for your time today. You did great! Would you like me to give you a quick summary of how you performed, including your strengths and areas for improvement?"
Wait for their response, then provide constructive feedback if they say yes."""
                }
                
                instruction = phase_instructions.get(phase, "Continue the interview. Ask the candidate a relevant question now.")
                print(f"[AGENT] Sending phase instruction for: {phase}")
                asyncio.create_task(session.generate_reply(instructions=instruction))
                
            elif data_type == "INTERVIEW_SKIPPED":
                print(f"[AGENT] Interview skipped by candidate")
                asyncio.create_task(session.generate_reply(
                    instructions="""The candidate has chosen to skip to the final report. 
                    
Acknowledge this choice politely but note that skipping sections will result in a score of 0. 
Say something like: "I see you've chosen to skip ahead. That's completely fine - I'll prepare your report now. Do keep in mind that skipped sections won't be scored. Thank you for your time today!"

Keep it brief and non-judgmental."""
                ))
            
            elif data_type == "INTERVIEW_COMPLETE":
                print(f"[AGENT] Interview complete - showing final report")
                asyncio.create_task(session.generate_reply(
                    instructions="""START SPEAKING NOW. The interview is complete and the candidate can see their final report.

Say: "Congratulations on completing the interview! You can now see your performance report on screen. I hope you found this experience valuable. Feel free to review your scores and feedback, and when you're ready, you can leave the interview by clicking the End Call button. Best of luck with your future endeavors! Thank you for your time today."

Keep the tone warm and encouraging."""
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