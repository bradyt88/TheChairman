import { loadWorld, generatePlayers } from './data.js';
import { createCareer, migrateCareer } from './state.js';
import { saveGame, loadGame } from './storage.js';
import { advanceWeek, previewMatchday } from './simulation.js';
import { renderShell, renderView, showModal, closeModal, money, esc } from './ui-production.js';

const root=document.querySelector('#app');
let world, allPlayers, state, club;

async function boot(){try{world=await loadWorld();allPlayers=generatePlayers(world.clubs);const saved=loadGame();if(saved){club=world.clubs.find(c=>c.id===saved.clubId);state=club?migrateCareer(saved,club,allPlayers,world):null;}if(state&&club)render();else renderStart();}catch(e){root.innerHTML=`<div style="padding:40px;color:#fff"><h1>The Chairman</h1><p>${esc(e.message)}</p></div>`;}}
