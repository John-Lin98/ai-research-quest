#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,"..");
const skill=fs.readFileSync(path.join(root,"SKILL.md"),"utf8");
const policy=JSON.parse(fs.readFileSync(path.join(root,"references/quest-session-policy.json"),"utf8"));

function fail(m){ console.error("quest-session validation failed:",m); process.exit(1); }

if(policy.schema_version!=="1.0") fail("wrong schema version");
if(policy.quest_session?.default_state_on_trigger!=="active") fail("quest must start active");
if(policy.quest_session?.explicit_stop_required!==true) fail("quest must require explicit stop");
if(policy.quest_session?.ordinary_user_instruction_keeps_active!==true) fail("ordinary instructions must keep quest active");
if(policy.interface?.persistent_while_active!==true) fail("quest interface must persist");
for(const b of ["goal","confirmed","map_delta","progress","why_now","next_step"]){
  if(!policy.interface.required_blocks.includes(b)) fail(`missing interface block ${b}`);
}
if(policy.mvp_first?.default_change_scope!=="minimal_viable_delta") fail("MVP-first scope missing");
if(policy.mvp_first?.speculative_subsystems_forbidden!==true) fail("speculative subsystem guard missing");
if(policy.parallel_handoff?.main_quest_remains_active!==true) fail("parallel handoff must preserve quest");
for(const s of ["experiment-thread-handoff","task-thread-handoff"]){
  if(!policy.parallel_handoff.preferred_skills.includes(s)) fail(`missing handoff skill ${s}`);
}

const transition=(state,event)=>{
  if(event==="explicit_user_stop") return "stopped";
  if(state==="stopped") return "stopped";
  if(event==="pause_quest") return "paused";
  if(state==="paused" && event==="resume_quest") return "active";
  return state;
};
for(const t of policy.red_green_scenarios){
  const got=transition(t.start,t.event);
  if(got!==t.expected) fail(`scenario ${t.id}: expected ${t.expected}, got ${got}`);
}

for(const phrase of [
  "Persistent Quest Session",
  "MVP-first",
  "experiment-thread-handoff",
  "task-thread-handoff"
]){
  if(!skill.includes(phrase)) fail(`SKILL missing ${phrase}`);
}

console.log("QUEST_SESSION_POLICY_OK");
