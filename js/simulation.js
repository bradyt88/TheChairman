const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
const roundMoney=n=>Math.round(n/100)*100;

function attendanceFor(state, club) {
  const capacity=club?.stadiumCapacity||0;
  return Math.round(capacity*(0.58+(state.fanConfidence/100)*0.30));
}

export function calculateFinance(state, club) {
  const attendance=attendanceFor(state,club);
  const reputation=clamp(state.reputation,1,100);
  const capacity=club?.stadiumCapacity||0;
  const weeklyWages=roundMoney(state.players.reduce((sum,p)=>sum+(Number(p.wage)||0),0));
  const ticketPrice=22 + reputation*0.12;
  const matchday=roundMoney(attendance*(ticketPrice+5));
  const broadcast=roundMoney(360000 + Math.max(0,21-state.leaguePosition)*12000 + reputation*1800);
  const sponsorship=roundMoney(150000 + reputation*6500 + state.fanConfidence*900);
  const commercial=roundMoney(90000 + reputation*2500 + attendance*0.6);
  const operations=roundMoney(250000 + capacity*4 + weeklyWages*0.18);
  const debtService=roundMoney((state.debt*0.055/52) + (state.debt*0.001));
  const revenue=matchday+broadcast+sponsorship+commercial;
  const costs=weeklyWages+operations+debtService;
  const net=revenue-costs;
  return {
    revenue:roundMoney(revenue), costs:roundMoney(costs), net:roundMoney(net),
    breakdown:{matchday,broadcast,sponsorship,commercial,wages:weeklyWages,operations,debtService},
    attendance, ticketPrice:Math.round(ticketPrice*100)/100
  };
}

export function estimatedClubValue(state, club) {
  const operatingStrength=Math.max(0, state.reputation*2000000 + (club?.stadiumCapacity||0)*1200);
  return Math.max(0, Math.round((state.cash + operatingStrength - state.debt)/100000)*100000);
}

export function advanceWeek(state, world) {
  const s = structuredClone(state);
  const club = world.clubs.find(c=>c.id===s.clubId);
  s.week += 1;
  const opponents = world.clubs.filter(c=>c.leagueId===club?.leagueId && c.id!==s.clubId);
  const opp = opponents.length ? opponents[(s.week*7)%opponents.length] : null;
  const power = s.players.reduce((a,p)=>a+p.overall,0)/Math.max(1,s.players.length);
  const roll = Math.random();
  let result = roll < 0.22 ? '0–1' : roll > 0.73 ? '2–0' : '1–1';
  if (power > 80 && roll > .52) result='2–1';
  if (power < 69 && roll < .45) result='0–2';

  const finance=calculateFinance(s,club);
  s.cash += finance.net;
  s.finance ??= {};
  s.finance.seasonRevenue=(s.finance.seasonRevenue||0)+finance.revenue;
  s.finance.seasonCosts=(s.finance.seasonCosts||0)+finance.costs;
  s.finance.seasonNet=s.finance.seasonRevenue-s.finance.seasonCosts;
  s.finance.weeklyWages=finance.breakdown.wages;
  s.finance.lastWeek=finance;
  s.finance.history=[...(s.finance.history||[]),{week:s.week,revenue:finance.revenue,costs:finance.costs,net:finance.net,breakdown:finance.breakdown}].slice(-12);

  const won = ['2–0','2–1'].includes(result);
  const lost = ['0–1','0–2'].includes(result);
  const reserveTarget=s.finance.reserveTarget||Math.max(5000000,Math.round(s.debt*0.1));
  s.fanConfidence = clamp(s.fanConfidence + (won?2:lost?-3:0),0,100);
  s.managerConfidence = clamp(s.managerConfidence + (won?2:lost?-2:0),0,100);
  const cashPressure=s.cash<0?-4:s.cash<reserveTarget?-1:0;
  const lossPressure=finance.net<0?-1:0;
  s.boardConfidence = clamp(s.boardConfidence + (won?1:lost?-1:0) + cashPressure + lossPressure,0,100);
  s.reputation = clamp(s.reputation + (won?0.2:lost?-0.1:0),1,100);
  s.leaguePosition = clamp(s.leaguePosition + (won?-1:lost?1:0),1,20);
  s.lastMatch = {opponent:opp?.name || 'League Opponent',home:s.week%2===0,result,headline:won?'Boardroom mood improves':lost?'Pressure rises around the club':'A balanced result'};
  s.news.unshift({week:s.week,title:`Matchday: ${result}`,text:`${s.lastMatch.home?'Home':'Away'} against ${s.lastMatch.opponent}. ${s.lastMatch.headline}. Financial result: ${finance.net>=0?'+':''}${moneyShort(finance.net)}.`});
  s.news=s.news.slice(0,8);

  if (s.week%4===0) {
    s.inbox.unshift({id:Date.now(),type:'FINANCE',title:'Monthly financial review',text:`Revenue ${moneyShort(s.finance.history.slice(-4).reduce((a,x)=>a+x.revenue,0))}; costs ${moneyShort(s.finance.history.slice(-4).reduce((a,x)=>a+x.costs,0))}; net ${moneyShort(s.finance.history.slice(-4).reduce((a,x)=>a+x.net,0))}.` ,unread:true});
  }
  return s;
}

function moneyShort(n){
  const sign=n<0?'-':'';
  const v=Math.abs(n);
  if(v>=1000000) return `${sign}£${(v/1000000).toFixed(1)}m`;
  if(v>=1000) return `${sign}£${Math.round(v/1000)}k`;
  return `${sign}£${Math.round(v)}`;
}
