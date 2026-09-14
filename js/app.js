import { loadWorld, generatePlayers } from './data.js';
import { createCareer } from './state.js';
import { saveGame, loadGame, clearGame } from './storage.js';
import { advanceWeek } from './simulation.js';
import { renderShell, renderView, showModal, closeModal, money, esc } from './ui.js';

const root=document.querySelector('#app');
let world, allPlayers, state, club;

async function boot(){
  try {
    world=await loadWorld();
    allPlayers=generatePlayers(world.clubs);
    const saved=loadGame();
    if(saved){ club=world.clubs.find(c=>c.id===saved.clubId); state=saved; render(); }
    else renderStart();
  } catch(e) { root.innerHTML=`<div style="padding:40px;color:#fff"><h1>The Chairman</h1><p>${esc(e.message)}</p></div>`; }
}
function render(){ if(!state||!club)return renderStart(); renderShell(root,state,club); renderView(root,state,club,world); bind(); saveGame(state); }
function renderStart(){ root.innerHTML=`<main style="min-height:100vh;display:grid;place-items:center;padding:24px"><div style="width:min(1050px,100%)"><div class="hero"><div class="hero-content"><div class="eyebrow">Ownership simulation · 2026</div><h1>The Chairman</h1><p>Own the club. Set the ambition. Control the money. Appoint the people. Live with the consequences.</p><div class="actions"><button class="btn btn-primary" data-action="newCareer">Take control</button><button class="btn" data-action="continue">Continue saved career</button></div></div></div><div class="grid grid-3" style="margin-top:18px"><div class="card card-pad"><div class="eyebrow">01</div><h3>Own the institution</h3><p class="muted">The club is bigger than the first team. Shape its infrastructure, reputation and future.</p></div><div class="card card-pad"><div class="eyebrow">02</div><h3>Run the board</h3><p class="muted">Managers, directors, finance chiefs and supporters all have expectations.</p></div><div class="card card-pad"><div class="eyebrow">03</div><h3>Make the calls</h3><p class="muted">Every major decision trades ambition against risk.</p></div></div></div></main>`; bind(); }
function openClubPicker(){
  const grouped=world.leagues.map(l=>`<div style="margin-bottom:22px"><div class="section-title"><h2>${l.name}</h2><span>${l.country}</span></div><div class="club-grid">${world.clubs.filter(c=>c.leagueId===l.id).map(c=>`<button class="club-card" data-club="${c.id}" style="text-align:left;color:inherit"><div class="logo">${c.name.split(' ').map(x=>x[0]).slice(0,2).join('')}</div><h3>${c.name}</h3><p>Rep ${c.reputation} · Cash ${money(c.cash)}</p></button>`).join('')}</div></div>`).join('');
  showModal(`<div class="modal-head"><div><div class="eyebrow">New ownership</div><h2 style="margin:4px 0 0">Choose your club</h2></div><button class="btn" data-close>Close</button></div><div class="modal-body">${grouped}</div>`); document.querySelectorAll('[data-club]').forEach(b=>b.onclick=()=>startCareer(b.dataset.club));
}
function startCareer(id){club=world.clubs.find(c=>c.id===id); state=createCareer(club,world,allPlayers); closeModal(); render();}
function negotiate(name,value){showModal(`<div class="modal-head"><div><div class="eyebrow">Transfer room</div><h2 style="margin:4px 0 0">Negotiation: ${esc(name)}</h2></div><button class="btn" data-close>Exit</button></div><div class="modal-body"><div class="notice">The selling club knows your budget. The agent knows your ambition. Decide how hard you want to push.</div><div class="grid grid-2" style="margin-top:16px"><div class="card card-pad"><div class="stat-label">Opening fee</div><div class="stat-value">${money(value)}</div><div class="stat-note">Market expectation</div></div><div class="card card-pad"><div class="stat-label">Your budget</div><div class="stat-value">${money(state.transferBudget)}</div><div class="stat-note">Before deal structure</div></div></div><div class="actions" style="margin-top:18px"><button class="btn" data-deal="low">Test the market</button><button class="btn btn-primary" data-deal="fair">Make a fair offer</button><button class="btn" data-deal="aggressive">Overpay to close it</button></div></div>`); document.querySelectorAll('[data-deal]').forEach(b=>b.onclick=()=>deal(b.dataset.deal,name,value));}
function deal(type,name,value){const mult={low:.78,fair:1,aggressive:1.14}[type]; const fee=Math.round(value*mult); if(fee>state.transferBudget){alert('The club cannot fund this offer without breaking the current transfer budget.');return;} state.transferBudget-=fee; state.cash-=Math.round(fee*.35); state.boardConfidence= Math.max(0,Math.min(100,state.boardConfidence+(type==='aggressive'?-2:1))); state.news.unshift({week:state.week,title:`Transfer talks: ${name}`,text:type==='low'?'The selling club rejected the opening position.':`The chairman authorised a ${money(fee)} offer.`}); closeModal(); render();}
function bind(){
  document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{state.activeView=b.dataset.view;render();});
  document.querySelectorAll('[data-action]').forEach(b=>b.onclick=()=>action(b.dataset.action,b));
  document.querySelectorAll('[data-close]').forEach(b=>b.onclick=closeModal);
}
function action(a,b){
  if(a==='newCareer') return openClubPicker();
  if(a==='continue'){const saved=loadGame(); if(saved){state=saved;club=world.clubs.find(c=>c.id===state.clubId);render();}else alert('No saved career found.');return;}
  if(a==='advance'){state=advanceWeek(state,world);render();return;}
  if(a==='negotiate') return negotiate(b.dataset.player,Number(b.dataset.value));
  if(a==='protectCash'){state.cash+=5000000;state.transferBudget=Math.max(0,state.transferBudget-5000000);state.boardConfidence=Math.min(100,state.boardConfidence+2);state.news.unshift({week:state.week,title:'Cash protection plan approved',text:'The board welcomes a more conservative financial position.'});render();return;}
  if(a==='releaseFunds'){if(state.cash<10000000){alert('The balance sheet is not strong enough.');return;}state.transferBudget+=8000000;state.cash-=8000000;state.fanConfidence=Math.min(100,state.fanConfidence+3);state.boardConfidence=Math.max(0,state.boardConfidence-2);render();return;}
  if(a==='fireManager'){showModal(`<div class="modal-head"><h2>Manager decision</h2><button class="btn" data-close>Cancel</button></div><div class="modal-body"><div class="notice">Removing a manager costs money, damages continuity and creates a new recruitment process. This is intentionally consequential.</div><div class="actions" style="margin-top:18px"><button class="btn btn-primary" data-action="confirmFire">Dismiss ${esc(state.manager.name)}</button><button class="btn" data-close>Keep him</button></div></div>`); bind(); return;}
  if(a==='confirmFire'){state.manager={name:'Daniel Costa',reputation:state.reputation-5,contractYears:3};state.managerConfidence=60;state.boardConfidence=Math.max(0,state.boardConfidence-6);state.cash-=3500000;state.news.unshift({week:state.week,title:'Manager dismissed',text:'The chairman has made a decisive change in the dugout.'});closeModal();render();return;}
  if(a==='meeting'){showModal(`<div class="modal-head"><div><div class="eyebrow">Executive meeting</div><h2 style="margin:4px 0 0">The room is waiting.</h2></div><button class="btn" data-close>Leave</button></div><div class="modal-body"><div class="notice">The finance director wants restraint. The sporting director wants recruitment. The manager wants backing. You have to decide what the club can actually afford.</div><div class="actions" style="margin-top:18px"><button class="btn" data-meeting="finance">Back finance</button><button class="btn btn-primary" data-meeting="sporting">Back sporting ambition</button><button class="btn" data-meeting="manager">Back the manager</button></div></div>`);document.querySelectorAll('[data-meeting]').forEach(x=>x.onclick=()=>meeting(x.dataset.meeting));return;}
  if(a==='stadium'){state.cash-=500000;state.news.unshift({week:state.week,title:'Stadium feasibility study commissioned',text:'The board will receive an expansion report next month.'});render();}
}
function meeting(type){if(type==='finance'){state.boardConfidence=Math.min(100,state.boardConfidence+3);state.transferBudget=Math.max(0,state.transferBudget-2000000);}if(type==='sporting'){state.fanConfidence=Math.min(100,state.fanConfidence+3);state.boardConfidence=Math.max(0,state.boardConfidence-2);}if(type==='manager'){state.managerConfidence=Math.min(100,state.managerConfidence+6);}state.news.unshift({week:state.week,title:'Executive meeting concluded',text:`You chose to prioritise ${type} interests.`});closeModal();render();}
boot();
