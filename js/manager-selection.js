const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const seededVariation=seed=>{const x=Math.sin(seed*12.9898)*43758.5453;return(x-Math.floor(x))*2-1;};

const positionGroup=p=>p==='GK'?'GK':['RB','LB','CB'].includes(p)?'DEF':['DM','CM','CAM','LM','RM'].includes(p)?'MID':'ATT';

export const FORMATIONS={
  '4-4-2':[
    ['GK','GK'],['RB','DEF'],['CB','DEF'],['CB','DEF'],['LB','DEF'],
    ['RM','MID'],['CM','MID'],['CM','MID'],['LM','MID'],['ST','ATT'],['ST','ATT']
  ],
  '4-3-3 DM':[
    ['GK','GK'],['RB','DEF'],['CB','DEF'],['CB','DEF'],['LB','DEF'],
    ['DM','MID'],['CM','MID'],['CM','MID'],['LW','ATT'],['ST','ATT'],['RW','ATT']
  ],
  '4-5-1 flat':[
    ['GK','GK'],['RB','DEF'],['CB','DEF'],['CB','DEF'],['LB','DEF'],
    ['LM','MID'],['CM','MID'],['CM','MID'],['CM','MID'],['RM','MID'],['ST','ATT']
  ],
  '4-1-4-1':[
    ['GK','GK'],['RB','DEF'],['CB','DEF'],['CB','DEF'],['LB','DEF'],
    ['DM','MID'],['LM','MID'],['CM','MID'],['CM','MID'],['RM','MID'],['ST','ATT']
  ],
  '4-4-1-1':[
    ['GK','GK'],['RB','DEF'],['CB','DEF'],['CB','DEF'],['LB','DEF'],
    ['RM','MID'],['CM','MID'],['CM','MID'],['LM','MID'],['CAM','MID'],['ST','ATT']
  ],
  '5-3-1-2':[
    ['GK','GK'],['RB','DEF'],['CB','DEF'],['CB','DEF'],['CB','DEF'],['LB','DEF'],
    ['DM','MID'],['CM','MID'],['CM','MID'],['CAM','MID'],['ST','ATT']
  ]
};

const formationForManager=manager=>{
  const preferred=manager?.preferredFormation;
  return FORMATIONS[preferred]?preferred:'4-4-2';
};

const FORMATION_COORDINATES={
  '4-4-2':[[50,88],[86,68],[62,68],[38,68],[14,68],[86,45],[62,47],[38,47],[14,45],[62,17],[38,17]],
  '4-3-3 DM':[[50,88],[86,68],[62,68],[38,68],[14,68],[50,53],[34,43],[66,43],[14,20],[50,14],[86,20]],
  '4-5-1 flat':[[50,88],[86,68],[62,68],[38,68],[14,68],[10,45],[32,43],[50,40],[68,43],[90,45],[50,16]],
  '4-1-4-1':[[50,88],[86,68],[62,68],[38,68],[14,68],[50,55],[12,41],[36,40],[64,40],[88,41],[50,15]],
  '4-4-1-1':[[50,88],[86,68],[62,68],[38,68],[14,68],[86,46],[62,46],[38,46],[14,46],[50,29],[50,14]],
  '5-3-1-2':[[50,88],[88,69],[69,69],[50,72],[31,69],[12,69],[50,53],[31,44],[69,44],[50,28],[50,14]]
};

export function formationCoordinates(state){
  const {name,slots}=formationSlots(state);
  const coords=FORMATION_COORDINATES[name]||FORMATION_COORDINATES['4-4-2'];
  return {name,slots:slots.map((slot,index)=>({...slot,x:coords[index]?.[0]||50,y:coords[index]?.[1]||50}))};
}

export function managerFormation(state){
  return formationForManager(state?.manager);
}

export function formationSlots(state){
  const name=managerFormation(state);
  return {name,slots:FORMATIONS[name].map(([position,group],index)=>({index,position,group}))};
}

function selectionScore(p,week,importance=1){
  const recent=Array.isArray(p.recentRatings)?p.recentRatings.slice(-3):[];
  const recentAvg=recent.length?recent.reduce((a,b)=>a+b,0)/recent.length:(Number(p.avgRating)||6.5);
  const trend=recent.length>=2?recent[recent.length-1]-recent[0]:0;
  const fatigue=Math.max(0,((Number(p.minutes)||0)/(Math.max(1,Number(p.appearances)||1))-68)/25);
  const form=clamp(Number(p.form)||65,35,100);
  const fitness=clamp(Number(p.fitness)||80,0,100);
  const morale=clamp(Number(p.morale)||70,0,100);
  const injury=(p.injuryWeeks||0)>0?-100:0;
  const ageLoad=Number(p.age)>=32?-.7:0;
  return(Number(p.overall)||50)*.72+fitness*.18+form*.08+morale*.025+recentAvg*1.8+trend*1.2-fatigue*3+injury+ageLoad+seededVariation(week+(p.id?.length||1))*1.2*importance;
}

function positionFit(player,target){
  if(player.position===target)return 4;
  if(player.backupPosition===target)return 3;
  if(positionGroup(player.position)===positionGroup(target))return 2;
  return 0;
}

export function managerSelection(state){
  const available=(state.players||[]).filter(p=>(p.injuryWeeks||0)<=0);
  const {name,slots}=formationSlots(state);
  const remaining=[...available];
  const selected=[];
  for(const slot of slots){
    remaining.sort((a,b)=>{
      const fitDiff=positionFit(b,slot.position)-positionFit(a,slot.position);
      if(fitDiff)return fitDiff;
      return selectionScore(b,state.week)-selectionScore(a,state.week);
    });
    const player=remaining.shift();
    if(player)selected.push({...player,formationPosition:slot.position,formationSlot:slot.index});
  }
  const leftovers=remaining.sort((a,b)=>selectionScore(b,state.week)-selectionScore(a,state.week));
  while(selected.length<11&&leftovers.length)selected.push({...leftovers.shift(),formationPosition:'CM',formationSlot:selected.length});
  const bench=leftovers.slice(0,7);
  return{selected,bench,formation:name,slots};
}
