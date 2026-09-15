const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
const roundMoney=n=>Math.round(n/100)*100;

function seededVariation(seed) {
  const x=Math.sin(seed*12.9898)*43758.5453;
  return (x-Math.floor(x))*2-1;
}

function recentForm(state) {
  const form=Array.isArray(state.form)?state.form:[];
  if(!form.length)return 0;
  return form.reduce((sum,r)=>sum+(r==='W'?1:r==='L'?-1:0),0)/form.length;
}

function attendanceFor(state,club,opponent,home=true) {
  if(!home)return 0;
  const capacity=club?.stadiumCapacity||0;
  const fan=clamp(state.fanConfidence,0,100);
  const reputation=clamp(state.reputation,1,100);
  const opponentRep=opponent?.reputation||50;
  const form=recentForm(state);
  const positionFactor=((10-(state.leaguePosition||10))/10)*0.018;
  const opponentFactor=clamp((opponentRep-reputation)/100,-0.04,0.05);
  const formFactor=form*0.025;
  const marketFactor=seededVariation((state.week||1)*2.71+(club?.reputation||0))*0.018;
  const fill=clamp(0.43+(fan/100)*0.30+positionFactor+opponentFactor+formFactor+marketFactor,0.38,0.98);
  return Math.round(capacity*fill);
}

function transferSeedScore(player,week,index) {
  const base=(Number(player.overall)||50)*0.7+(Number(player.potential)||Number(player.overall)||50)*0.25+(Number(player.value)||0)/100000000;
  return base+seededVariation((week+1)*31+(index+1)*17+(Number(player.age)||20))*8;
}

export function refreshTransferMarket(state,world,force=false) {
  const allPlayers=world?.players||[];
  const existing=Array.isArray(state.transferMarket)?state.transferMarket:[];
  const unavailable=new Set((state.players||[]).map(p=>p.id));
  const availablePlayers=allPlayers.filter(p=>!unavailable.has(p.id));
  if(!availablePlayers.length)return existing;
  if(!force && state.week<=1 && existing.length)return existing;

  const ranked=availablePlayers
    .map((p,i)=>({p,score:transferSeedScore(p,state.week,i)}))
    .sort((a,b)=>b.score-a.score);
  const locked=existing.filter(x=>x.status==='negotiating').map(x=>x.playerId);
  const keepCount=Math.min(4,existing.length);
  const keep=existing.filter(x=>x.status==='available' || x.status==='negotiating').slice(0,keepCount);
  const used=new Set([...keep.map(x=>x.playerId),...locked]);
  const replacements=[];
  for(const item of ranked){
    if(used.has(item.p.id))continue;
    replacements.push({playerId:item.p.id,addedWeek:state.week,status:'available'});
    used.add(item.p.id);
    if(replacements.length>=Math.max(0,8-keep.length))break;
  }
  return [...keep,...replacements].slice(0,8);
}

export function calculateFinance(state,club,context={}) {
  const week=state.week||1;
  const opponent=context.opponent;
  const home=context.home!==false;
  const attendance=attendanceFor(state,club,opponent,home);
  const reputation=clamp(state.reputation,1,100);
  const fan=clamp(state.fanConfidence,0,100);
  const position=clamp(state.leaguePosition,1,20);
  const capacity=club?.stadiumCapacity||0;
  const weeklyWages=roundMoney(state.players.reduce((sum,player)=>sum+(Number(player.wage)||0),0));
  const ticketPrice=22+reputation*0.11+(position<=6?2:0);
  const matchday=home?roundMoney(attendance*(ticketPrice+5+reputation*0.02)):0;
  const broadcast=roundMoney((300000+Math.max(0,21-position)*14500+reputation*1700)*(0.94+fan/100*0.08));
  const sponsorCycle=0.90+0.07*Math.sin((week/4)*1.7+reputation/20);
  const sponsorshipBase=135000+reputation*6200+fan*850;
  const sponsorship=roundMoney(sponsorshipBase*sponsorCycle+(week%4===0?350000:0));
  const commercialCycle=0.90+0.10*Math.cos(week*0.8+fan/15);
  const commercial=roundMoney((65000+reputation*2200+attendance*0.72)*commercialCycle);
  const wagePressure=weeklyWages>(state.wageBudget||Infinity)?1.12:1;
  const operatingCycle=0.92+0.10*Math.sin(week*1.13+capacity/10000);
  const baseOperations=180000+capacity*3.2+weeklyWages*0.16;
  const matchOperations=home?roundMoney(70000+attendance*1.35):roundMoney(90000+capacity*0.25);
  const operations=roundMoney((baseOperations+matchOperations)*operatingCycle*wagePressure);
  const debtService=roundMoney((state.debt*0.045/52)+(state.debt*0.0007));
  const outstanding=state.finance?.transferCommitments||0;
  const transferInstallment=roundMoney(Math.min(outstanding,outstanding*0.03));
  const travel=home?0:roundMoney(45000+capacity*0.35);
  const performanceBonus=context.won?roundMoney(65000+reputation*1200):context.lost?0:roundMoney(15000);
  const revenue=matchday+broadcast+sponsorship+commercial+performanceBonus;
  const costs=weeklyWages+operations+debtService+transferInstallment+travel;
  return {
    revenue:roundMoney(revenue),costs:roundMoney(costs),net:roundMoney(revenue-costs),
    breakdown:{matchday,broadcast,sponsorship,commercial,performanceBonus,wages:weeklyWages,operations,debtService,transferInstallment,travel},
    attendance,ticketPrice:Math.round(ticketPrice*100)/100,home
  };
}

export function estimatedClubValue(state,club) {
  const operatingStrength=Math.max(0,state.reputation*1800000+(club?.stadiumCapacity||0)*1400);
  const financialPosition=state.cash-(state.debt*0.85);
  const momentum=1+(recentForm(state)*0.08)+(state.fanConfidence-50)/1000;
  return Math.max(0,Math.round(((financialPosition+operatingStrength)*momentum)/100000)*100000);
}

export function advanceWeek(state,world) {
  const s=structuredClone(state);
  const club=world.clubs.find(c=>c.id===s.clubId);
  s.week+=1;
  const opponents=world.clubs.filter(c=>c.leagueId===club?.leagueId&&c.id!==s.clubId);
  const opp=opponents.length?opponents[(s.week*7)%opponents.length]:null;
  const power=s.players.reduce((a,p)=>a+p.overall,0)/Math.max(1,s.players.length);
  const opponentPower=opp?.reputation||50;
  const strengthGap=power-(opponentPower*0.72);
  const roll=Math.random();
  let result=roll<0.22?'0–1':roll>0.73?'2–0':'1–1';
  if(strengthGap>18&&roll>.52)result='2–1';
  if(strengthGap<-5&&roll<.45)result='0–2';
  const home=s.week%2===0;
  const won=['2–0','2–1'].includes(result);
  const lost=['0–1','0–2'].includes(result);
  const finance=calculateFinance(s,club,{opponent:opp,home,won,lost});
  s.cash+=finance.net;
  s.finance??={};
  s.finance.seasonRevenue=(s.finance.seasonRevenue||0)+finance.revenue;
  s.finance.seasonCosts=(s.finance.seasonCosts||0)+finance.costs;
  s.finance.seasonNet=s.finance.seasonRevenue-s.finance.seasonCosts;
  s.finance.weeklyWages=finance.breakdown.wages;
  s.finance.lastWeek=finance;
  s.finance.history=[...(s.finance.history||[]),{week:s.week,revenue:finance.revenue,costs:finance.costs,net:finance.net,breakdown:finance.breakdown,home,opponent:opp?.name||'League Opponent',attendance:finance.attendance}].slice(-12);
  if(s.finance.transferCommitments)s.finance.transferCommitments=Math.max(0,s.finance.transferCommitments-finance.breakdown.transferInstallment);
  s.form=[...(Array.isArray(s.form)?s.form:[]),won?'W':lost?'L':'D'].slice(-5);
  s.transferMarket=refreshTransferMarket(s,world);
  const reserveTarget=s.finance.reserveTarget||Math.max(5000000,Math.round(s.debt*0.1));
  const wageOverBudget=finance.breakdown.wages>(s.wageBudget||Infinity);
  const cashPressure=s.cash<0?-4:s.cash<reserveTarget?-1:0;
  const lossPressure=finance.net<0?-1:0;
  const wagePressure=wageOverBudget?-1:0;
  const financialSwing=finance.net>500000?1:finance.net<-500000?-1:0;
  s.fanConfidence=clamp(s.fanConfidence+(won?2:lost?-3:0)+(finance.attendance>club.stadiumCapacity*0.8?1:finance.attendance<club.stadiumCapacity*0.55?-1:0),0,100);
  s.managerConfidence=clamp(s.managerConfidence+(won?2:lost?-2:0),0,100);
  s.boardConfidence=clamp(s.boardConfidence+(won?1:lost?-1:0)+cashPressure+lossPressure+wagePressure+financialSwing,0,100);
  s.reputation=clamp(s.reputation+(won?0.2:lost?-0.1:0),1,100);
  s.leaguePosition=clamp(s.leaguePosition+(won?-1:lost?1:0),1,20);
  s.lastMatch={opponent:opp?.name||'League Opponent',home,result,headline:won?'Boardroom mood improves':lost?'Pressure rises around the club':'A balanced result'};
  s.news.unshift({week:s.week,title:`Matchday: ${result}`,text:`${home?'Home':'Away'} against ${s.lastMatch.opponent}. ${s.lastMatch.headline}. ${home?`${finance.attendance.toLocaleString()} attended. `:''}Financial result: ${finance.net>=0?'+':''}${moneyShort(finance.net)}.`});
  s.news=s.news.slice(0,8);
  if(s.week%4===0){
    const month=s.finance.history.slice(-4);const revenue=month.reduce((a,x)=>a+x.revenue,0);const costs=month.reduce((a,x)=>a+x.costs,0);const net=revenue-costs;
    s.inbox.unshift({id:Date.now(),type:'FINANCE',title:'Monthly financial review',text:`Revenue ${moneyShort(revenue)}; costs ${moneyShort(costs)}; net ${moneyShort(net)}. Cash ${moneyShort(s.cash)} after the month.`,unread:true});
  }
  return s;
}

function moneyShort(n){const sign=n<0?'-':'';const v=Math.abs(n||0);if(v>=1000000)return `${sign}£${(v/1000000).toFixed(1)}m`;if(v>=1000)return `${sign}£${Math.round(v/1000)}k`;return `${sign}£${Math.round(v)}`;}
