const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));

export function ensurePlayerModel(player){
  const p={...player};
  p.appearances=Number.isFinite(p.appearances)?p.appearances:0;
  p.minutes=Number.isFinite(p.minutes)?p.minutes:0;
  p.goals=Number.isFinite(p.goals)?p.goals:0;
  p.assists=Number.isFinite(p.assists)?p.assists:0;
  p.keyPasses=Number.isFinite(p.keyPasses)?p.keyPasses:0;
  p.avgRating=Number.isFinite(p.avgRating)?p.avgRating:6.5;
  p.fitness=Number.isFinite(p.fitness)?p.fitness:92;
  p.development=Number.isFinite(p.development)?p.development:developmentFromRatings(p.overall,p.potential);
  p.form=Number.isFinite(p.form)?p.form:65;
  p.morale=Number.isFinite(p.morale)?p.morale:70;
  p.contractYears=Number.isFinite(p.contractYears)?p.contractYears:2;
  p.value=calculatePlayerValue(p);
  return p;
}

function developmentFromRatings(overall,potential){
  if((potential||0)<=50)return 100;
  return clamp(Math.round((((overall||50)-50)/((potential||50)-50))*100),0,100);
}

export function calculatePlayerValue(player){
  const o=clamp(Number(player.overall)||50,1,99);
  const pot=clamp(Number(player.potential)||o,1,99);
  const age=Number(player.age)||25;
  const form=clamp(Number(player.form)||65,1,100);
  const contract=Math.max(0,Number(player.contractYears)||0);
  const demand=clamp(Number(player.transferInterest)||50,0,100);
  let ageFactor=1;
  if(age<21)ageFactor=1.12;
  else if(age<25)ageFactor=1.08;
  else if(age<29)ageFactor=1.04;
  else if(age<32)ageFactor=.96;
  else if(age<35)ageFactor=.84;
  else ageFactor=.65;
  const potentialPremium=Math.max(0,pot-o)*18000;
  const performanceFactor=.88+(form/100)*.24;
  const contractFactor=.86+Math.min(contract,5)*.04;
  const demandFactor=.90+(demand/100)*.20;
  return Math.max(25000,Math.round(((o*o*4200)+potentialPremium)*ageFactor*performanceFactor*contractFactor*demandFactor/1000)*1000);
}

function roleWeight(position){
  if(position==='ST'||position==='LW'||position==='RW')return 5;
  if(position==='AM'||position==='CM')return 3;
  if(position==='DM')return 2;
  return position==='GK'?0.3:0.8;
}

function seeded(seed){const x=Math.sin(seed*12.9898)*43758.5453;return x-Math.floor(x);}

export function simulatePlayerMatch(player,context={}){
  const seed=Number(context.seed)||1;
  const result=context.result||'D';
  const teamStrength=Number(context.teamStrength)||70;
  const opponentStrength=Number(context.opponentStrength)||70;
  const selected=context.selected!==false;
  if(!selected)return {...player,fitness:clamp(player.fitness+3,0,100)};
  const variation=(seeded(seed+player.id.length*13)-.5)*1.2;
  const resultImpact=result==='W'?.38:result==='L'?-.38:0;
  const qualityImpact=(teamStrength-opponentStrength)*.012;
  const rating=clamp(6.45+resultImpact+qualityImpact+variation+(Number(player.form||65)-65)*.006,5.5,9.4);
  const minutes=Number(context.minutes)||90;
  const appearance=minutes>0?1:0;
  const positionWeight=roleWeight(player.position);
  let goals=0,assists=0,keyPasses=0;
  if(appearance){
    if(positionWeight>=3&&seeded(seed+41)<positionWeight*.075)goals=1;
    if(positionWeight>=2&&seeded(seed+77)<.12)assists=1;
    keyPasses=Math.max(0,Math.floor(seeded(seed+103)*(positionWeight+2)));
  }
  const newForm=clamp(Math.round((player.form||65)*.72+rating*10*.28),1,100);
  const newFitness=clamp((player.fitness||92)-Math.max(4,minutes/15)+3,0,100);
  return {...player,appearances:(player.appearances||0)+appearance,minutes:(player.minutes||0)+minutes,goals:(player.goals||0)+goals,assists:(player.assists||0)+assists,keyPasses:(player.keyPasses||0)+keyPasses,avgRating:Number((((player.avgRating||6.5)*(player.appearances||0)+rating)/((player.appearances||0)+appearance)).toFixed(2)),form:newForm,fitness:newFitness};
}

export function applyPlayerDevelopment(player){
  const p={...player};
  const age=Number(p.age)||25,potential=Number(p.potential)||p.overall||50,overall=Number(p.overall)||50,rating=p.avgRating||6.5;
  const performance=(rating-6.5)*1.5+(Number(p.form||65)-65)*.025;
  let change=0;
  if(age<20)change=.22+performance*.08;
  else if(age<23)change=.16+performance*.06;
  else if(age<27)change=.08+performance*.04;
  else if(age<30)change=.02+performance*.02;
  else if(age<33)change=-.03+performance*.015;
  else change=-.10+performance*.01;
  if(overall<potential)p.overall=clamp(Math.round(overall+change),1,potential);
  else if(change<0)p.overall=clamp(Math.round(overall+change),1,99);
  p.development=developmentFromRatings(p.overall,potential);
  p.value=calculatePlayerValue(p);
  return p;
}

export function agePlayer(player){
  const p={...player,age:(Number(player.age)||18)+1};
  if(p.age>=37)return null;
  return applyPlayerDevelopment(p);
}

export function newGenerationPlayer(id,clubId,seed=1){
  const positions=['GK','CB','LB','RB','DM','CM','AM','LW','RW','ST'];
  const r=seeded(seed),potential=68+Math.floor(r*25),overall=Math.max(48,Math.min(62,potential-Math.floor(8+seeded(seed+4)*10))),age=15+Math.floor(seeded(seed+7)*3);
  const first=['Leo','Milo','Noah','Elias','Ruben','Theo','Luca','Kai','Oscar','Jonas'][Math.floor(seeded(seed+9)*10)];
  const last=['Vale','Mercer','Santos','Keller','Rossi','Bauer','Navarro','Mills','Hart','Meyer'][Math.floor(seeded(seed+11)*10)];
  return ensurePlayerModel({id,clubId,name:`${first} ${last}`,age,position:positions[Math.floor(seeded(seed+13)*positions.length)],overall,potential,value:0,wage:Math.round((overall*overall*.9+potential*12)),morale:70,form:62,contractYears:3,personality:'Ambitious'});
}
