import { loadWorld, generatePlayers } from './data.js';
import { loadGame } from './storage.js';
import { previewMatchday } from './simulation.js?prematch=93';

let opening=false;
let allowAdvanceOnce=false;

const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function showPreMatch(state,world,players){
  const p=previewMatchday(state,world,'neutral',players);
  const club=world.clubs.find(c=>c.id===state.clubId);
  const home=p.home?(club?.name||'Home'): (p.opponent?.name||'League Opponent');
  const away=p.home?(p.opponent?.name||'League Opponent'):(club?.name||'Away');
  document.getElementById('prematch-gate')?.remove();
  const el=document.createElement('div');
  el.id='prematch-gate';
  el.innerHTML=`<div style="position:fixed;inset:0;background:rgba(3,6,10,.88);backdrop-filter:blur(8px);z-index:99998;display:grid;place-items:center;padding:18px"><div style="width:min(900px,100%);max-height:92vh;overflow:auto;background:linear-gradient(145deg,#151b25,#0b0f15);border:1px solid rgba(214,178,82,.25);border-radius:16px;box-shadow:0 30px 80px rgba(0,0,0,.55);color:#f4f5f7;padding:22px"><div style="font-size:11px;letter-spacing:.14em;text-transform:uppercase;opacity:.65">Matchday · Week ${p.week}</div><h2 style="margin:6px 0">Pre-match</h2><div style="display:grid;grid-template-columns:1fr auto 1fr;gap:14px;align-items:center;margin:26px 0"><div style="text-align:right;font-weight:900;font-size:18px">${esc(home)}</div><div style="font-size:24px;font-weight:900;opacity:.5">VS</div><div style="font-weight:900;font-size:18px">${esc(away)}</div></div><div style="padding:16px;border-radius:10px;background:rgba(214,178,82,.08);border:1px solid rgba(214,178,82,.16)"><strong>Manager's matchday preparation</strong><div style="opacity:.75;margin-top:6px">The manager selects the starting XI and bench using player ability, fitness, form, morale, fatigue and injuries. The manager also controls substitutions during the match.</div></div><div style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-top:16px"><div style="padding:14px;border:1px solid rgba(255,255,255,.08);border-radius:10px"><small style="opacity:.6;text-transform:uppercase;letter-spacing:.1em">Starting XI</small><strong style="display:block;margin-top:5px">Manager selection</strong></div><div style="padding:14px;border:1px solid rgba(255,255,255,.08);border-radius:10px"><small style="opacity:.6;text-transform:uppercase;letter-spacing:.1em">Bench</small><strong style="display:block;margin-top:5px">7 substitutes · max 5 used</strong></div></div><button type="button" data-prematch-start style="width:100%;margin-top:20px;padding:16px;border:1px solid rgba(214,178,82,.45);border-radius:10px;background:#b99645;color:#0b0f15;font-weight:900;font-size:16px;cursor:pointer;touch-action:manipulation">Start Match</button></div></div>`;
  document.body.appendChild(el);
}

document.addEventListener('click',async e=>{
  const start=e.target.closest?.('[data-prematch-start]');
  const advance=e.target.closest?.('[data-action="advance"]');
  if(advance&&!allowAdvanceOnce){
    e.preventDefault();
    e.stopImmediatePropagation();
    if(opening)return;
    opening=true;
    try{
      const world=await loadWorld();
      const state=loadGame();
      if(!state)throw new Error('Game state could not be loaded.');
      const players=generatePlayers(world.clubs);
      showPreMatch(state,world,players);
    }catch(err){console.error(err);alert('Pre-match failed to open: '+err.message);}finally{opening=false;}
    return;
  }
  if(start){
    e.preventDefault();
    e.stopImmediatePropagation();
    allowAdvanceOnce=true;
    document.getElementById('prematch-gate')?.remove();
    const b=document.querySelector('[data-action="advance"]');
    if(b)b.click();
    queueMicrotask(()=>{allowAdvanceOnce=false;});
  }
},true);
