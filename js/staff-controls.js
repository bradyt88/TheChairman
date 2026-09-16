(() => {
  const KEY = 'the-chairman-save-v1';
  const ROLE_META = {
    manager: { label: 'Manager', area: 'First-team football' },
    coach: { label: 'Coach / Assistant Manager', area: 'Coaching & first-team support' },
    youthCoach: { label: 'Youth Coach', area: 'Academy development' },
    commercialDirector: { label: 'Commercial Director', area: 'Sponsorship & revenue' },
    physio: { label: 'Physio', area: 'Player welfare & recovery' },
    scout: { label: 'Scout', area: 'Recruitment intelligence' }
  };
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const money = n => `£${Math.round(Number(n)||0).toLocaleString('en-GB')}`;
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)); } catch { return null; } };
  const save = state => localStorage.setItem(KEY, JSON.stringify(state));
  const currentClubStaff = state => (state.staffDatabase || []).filter(s => s.clubId === state.clubId);
  const staffForRole = (state, role) => currentClubStaff(state).find(s => s.role === role) || null;
  const candidates = (state, role) => (state.staffDatabase || []).filter(s => s.role === role && s.status === 'freeAgent');
  function stat(label, value) { return `<div class="card stat"><div class="stat-label">${label}</div><div class="stat-value">${value}</div></div>`; }
  function button(label, action, id, primary=false) { return `<button class="btn ${primary?'btn-primary':''}" data-staff-action="${action}" data-staff-id="${esc(id||'')}">${label}</button>`; }

  function renderStaff() {
    const view = document.querySelector('#view');
    const state = load();
    if (!view || !state || !state.clubId || state.activeView !== 'staff') return;
    const roles = ['manager','coach','youthCoach','commercialDirector','physio','scout'];
    const cards = roles.map(role => {
      const s = staffForRole(state, role);
      const meta = ROLE_META[role];
      if (!s) return `<section class="card card-pad" style="min-height:230px"><div class="eyebrow">${meta.area}</div><h3 style="margin:8px 0 4px">${meta.label}</h3><div class="pill" style="margin:10px 0">Vacant</div><p class="muted">No ${meta.label.toLowerCase()} is currently appointed.</p><div class="actions" style="margin-top:16px">${button('Hire Staff','hire',role,true)}</div></section>`;
      const rating = s.managerRating ?? s.coachingRating ?? s.youthDevelopmentRating ?? s.commercialRating ?? s.medicalRating ?? s.scoutingRating ?? s.reputation;
      return `<section class="card card-pad" style="min-height:230px"><div class="eyebrow">${meta.area}</div><div style="display:flex;justify-content:space-between;gap:10px;align-items:start"><div><h3 style="margin:8px 0 4px">${esc(s.name)}</h3><p class="muted" style="margin:0">${meta.label} · ${esc(s.nationality||'')}</p></div><span class="pill">OVR ${Math.round(rating||0)}</span></div><div class="grid grid-2" style="margin-top:16px">${stat('Age',s.age)}${stat('Reputation',`${Math.round(s.reputation||0)}%`)}${stat('Experience',`${Math.round(s.experience||0)}%`)}${stat('Wage',`${money(s.wage)}/wk`)}</div><div class="actions" style="margin-top:16px">${button('View Profile','profile',s.id,true)}${button('Talk to Staff','talk',s.id)}${button(role==='manager'?'Change Manager':'Replace','replace',s.id)}</div></section>`;
    }).join('');
    view.innerHTML = `<div class="page-head"><div><div class="eyebrow">People · Chairman control</div><h1>Staff</h1><p>Appoint the people around the club. Their performance will matter as the wider staff systems develop.</p></div><div class="pill">${currentClubStaff(state).length}/6 positions filled</div></div><div class="grid grid-3">${cards}</div>`;
  }

  function modal(html) {
    let m = document.querySelector('#staff-modal');
    if (!m) { m = document.createElement('div'); m.id='staff-modal'; m.className='modal'; document.body.appendChild(m); }
    m.innerHTML = `<div class="modal-panel">${html}</div>`;
    m.classList.add('open');
  }
  function closeModal() { document.querySelector('#staff-modal')?.classList.remove('open'); }

  function profile(id) {
    const state = load(); const s = (state?.staffDatabase||[]).find(x=>x.id===id); if(!s)return;
    const meta=ROLE_META[s.role];
    const specialist = s.managerRating ?? s.coachingRating ?? s.youthDevelopmentRating ?? s.commercialRating ?? s.medicalRating ?? s.scoutingRating;
    modal(`<div class="modal-head"><div><div class="eyebrow">Staff profile</div><h2 style="margin:4px 0 0">${esc(s.name)}</h2></div><button class="btn" data-staff-close>Close</button></div><div class="modal-body"><div class="pill">${meta.label} · ${meta.area}</div><div class="grid grid-3" style="margin-top:16px">${stat('Age',s.age)}${stat('Nationality',esc(s.nationality||'—'))}${stat('Reputation',`${Math.round(s.reputation||0)}%`)}${stat('Experience',`${Math.round(s.experience||0)}%`)}${stat('Specialist rating',`${Math.round(specialist||0)}`)}${stat('Wage',`${money(s.wage)}/wk`)}</div><div class="notice" style="margin-top:16px"><strong>${esc(s.personality||'Professional')}</strong> personality · ${s.contractYears||0} year contract. This profile is the foundation for deeper staff performance and relationship systems later in the Chairman roadmap.</div></div>`);
  }

  function talk(id) {
    const state=load(); const s=(state?.staffDatabase||[]).find(x=>x.id===id); if(!s)return;
    const meta=ROLE_META[s.role];
    const lines={manager:'The manager wants clarity on your expectations for the first team and the season ahead.',coach:'The coach is ready to discuss training standards and first-team support.',youthCoach:'The youth coach wants to discuss academy development and player progression.',commercialDirector:'The commercial director wants to discuss commercial priorities and potential revenue opportunities.',physio:'The physio wants to discuss player welfare, recovery and medical priorities.',scout:'The scout wants to discuss recruitment priorities and the players the club should be watching.'};
    modal(`<div class="modal-head"><div><div class="eyebrow">Chairman meeting</div><h2 style="margin:4px 0 0">Talk to ${esc(s.name)}</h2></div><button class="btn" data-staff-close>Close</button></div><div class="modal-body"><div class="pill">${meta.label}</div><p style="font-size:17px;line-height:1.6;margin:18px 0">${lines[s.role]||'The staff member is ready to discuss their role at the club.'}</p><div class="notice">Conversation choices and persistent staff relationships will be expanded in the later staff/personality systems. For J2.1, the Chairman can enter the conversation point without altering game logic.</div></div>`);
  }

  function chooseCandidate(role, replacingId=null) {
    const state=load(); if(!state)return; const list=candidates(state,role).slice().sort((a,b)=>(b.reputation||0)-(a.reputation||0)).slice(0,8);
    const meta=ROLE_META[role];
    const rows=list.length?list.map(s=>`<div class="list-row"><div><strong>${esc(s.name)}</strong><small>${meta.label} · ${esc(s.nationality||'')} · Rep ${Math.round(s.reputation||0)} · ${money(s.wage)}/wk</small></div><button class="btn btn-primary" data-staff-action="appoint" data-staff-id="${esc(s.id)}" data-staff-role="${role}" data-staff-replacing="${esc(replacingId||'')}">${replacingId?'Replace':'Hire'}</button></div>`).join(''):`<div class="notice">No available ${meta.label.toLowerCase()} candidates are currently in the staff market.</div>`;
    modal(`<div class="modal-head"><div><div class="eyebrow">${replacingId?'Replace staff':'Staff market'}</div><h2 style="margin:4px 0 0">${replacingId?'Choose replacement':'Hire '+meta.label}</h2></div><button class="btn" data-staff-close>Cancel</button></div><div class="modal-body"><div class="list">${rows}</div></div>`);
  }

  function appoint(id, role, replacingId) {
    const state=load(); if(!state)return;
    const candidate=(state.staffDatabase||[]).find(s=>s.id===id && s.role===role && s.status==='freeAgent');
    if(!candidate)return;
    const current=replacingId?(state.staffDatabase||[]).find(s=>s.id===replacingId):null;
    if(role==='manager' && !current && state.managerId){return;}
    if(current){ current.clubId=null; current.status='freeAgent'; if(current.role==='manager') current.managerConfidence=50; }
    candidate.clubId=state.clubId; candidate.status='employed'; candidate.career={...(candidate.career||{}),clubs:(candidate.career?.clubs||0)+1};
    state.clubStaffIds=(state.staffDatabase||[]).filter(s=>s.clubId===state.clubId).map(s=>s.id);
    state.managerId=(state.staffDatabase||[]).find(s=>s.clubId===state.clubId && s.role==='manager')?.id||null;
    state.freeStaffCount=(state.staffDatabase||[]).filter(s=>s.status==='freeAgent').length;
    if(role==='manager'){
      state.manager=candidate;
      state.managerConfidence=candidate.managerConfidence ?? 50;
    }
    state.inbox=Array.isArray(state.inbox)?state.inbox:[];
    state.inbox.unshift({id:`staff-${Date.now()}`,type:'STAFF',title:`${replacingId?'New':'New'} ${ROLE_META[role].label} appointed`,text:`${candidate.name} has been appointed as ${ROLE_META[role].label}.`,unread:true});
    state.news=Array.isArray(state.news)?state.news:[];
    state.news.unshift({week:state.week,title:`Staff appointment: ${candidate.name}`,text:`The chairman appointed ${candidate.name} as ${ROLE_META[role].label}.`});
    save(state); closeModal(); location.reload();
  }

  document.addEventListener('click', e => {
    const close=e.target.closest('[data-staff-close]'); if(close){closeModal();return;}
    const b=e.target.closest('[data-staff-action]'); if(!b)return;
    const action=b.dataset.staffAction, id=b.dataset.staffId, role=b.dataset.staffRole, replacing=b.dataset.staffReplacing;
    if(action==='profile')profile(id);
    else if(action==='talk')talk(id);
    else if(action==='replace'){const s=(load()?.staffDatabase||[]).find(x=>x.id===id); if(s)chooseCandidate(s.role,id);}
    else if(action==='hire')chooseCandidate(id);
    else if(action==='appoint')appoint(id,role,replacing);
  });

  const observer = new MutationObserver(() => {
    const view=document.querySelector('#view');
    if(view && load()?.activeView==='staff' && !view.dataset.staffControlsRendered) {
      view.dataset.staffControlsRendered='1';
      renderStaff();
    }
  });
  observer.observe(document.body,{subtree:true,childList:true});
  setTimeout(() => { if(load()?.activeView==='staff') renderStaff(); }, 200);
})();
