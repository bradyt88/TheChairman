const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
export function advanceWeek(state, world) {
  const s = structuredClone(state);
  s.week += 1;
  const opponents = world.clubs.filter(c=>c.leagueId===world.clubs.find(x=>x.id===s.clubId)?.leagueId && c.id!==s.clubId);
  const opp = opponents[(s.week*7)%opponents.length];
  const power = s.players.reduce((a,p)=>a+p.overall,0)/Math.max(1,s.players.length);
  const roll = Math.random();
  let result = roll < 0.22 ? '0–1' : roll > 0.73 ? '2–0' : '1–1';
  if (power > 80 && roll > .52) result='2–1';
  if (power < 69 && roll < .45) result='0–2';
  const income = 750000 + Math.round(s.reputation*5500);
  const costs = 520000 + Math.round(s.players.reduce((a,p)=>a+p.wage,0)*520);
  s.cash += income-costs;
  const won = ['2–0','2–1'].includes(result);
  const lost = ['0–1','0–2'].includes(result);
  s.fanConfidence = clamp(s.fanConfidence + (won?2:lost?-3:0),0,100);
  s.managerConfidence = clamp(s.managerConfidence + (won?2:lost?-2:0),0,100);
  s.boardConfidence = clamp(s.boardConfidence + (won?1:lost?-1:0) + (s.cash<0?-4:0),0,100);
  s.reputation = clamp(s.reputation + (won?0.2:lost?-0.1:0),1,100);
  s.leaguePosition = clamp(s.leaguePosition + (won?-1:lost?1:0),1,20);
  s.lastMatch = {opponent:opp?.name || 'League Opponent',home:s.week%2===0,result,headline:won?'Boardroom mood improves':lost?'Pressure rises around the club':'A balanced result'};
  s.news.unshift({week:s.week,title:`Matchday: ${result}`,text:`${s.lastMatch.home?'Home':'Away'} against ${s.lastMatch.opponent}. ${s.lastMatch.headline}.`});
  s.news=s.news.slice(0,8);
  if (s.week%4===0) s.inbox.unshift({id:Date.now(),type:'FINANCE',title:'Monthly financial review',text:`Operating income £${income.toLocaleString()} versus costs £${costs.toLocaleString()}.`,unread:true});
  return s;
}
