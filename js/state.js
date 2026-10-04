import { ensurePlayerModel, newGenerationPlayer } from './player-model.js';
import { generateStaff, staffForClub, managerForClub, freeStaff } from './staff.js';

export const FIRST_TEAM_CAPACITY=25;
export const YOUTH_SQUAD_CAPACITY=6;

function seedFinance(club, players) {
  const weeklyWages = players.reduce((sum, player) => sum + (Number(player.wage) || 0), 0);
  return { seasonRevenue:0, seasonCosts:0, seasonNet:0, weeklyWages, transferSpend:0, transferIncome:0, lastWeek:{revenue:0,costs:0,net:0,breakdown:{matchday:0,broadcast:0,sponsorship:0,commercial:0,performanceBonus:0,wages:0,operations:0,debtService:0,transferInstallment:0,travel:0}},history:[],reserveTarget:Math.max(5000000,Math.round((club.debt||0)*.1)),transferCommitments:0 };
}
function marketEntry(p){return{playerId:p.id,name:p.name,position:p.position,age:p.age,overall:p.overall,potential:p.potential,value:p.value,wage:p.wage,personality:p.personality,clubId:p.clubId,addedWeek:1,status:'available'};}
function seedTransferMarket(players,clubId){return players.filter(p=>p.clubId!==clubId).slice(0,8).map(marketEntry);}
function preparePlayers(players){return players.map(ensurePlayerModel);}
function staffSnapshot(allStaff,clubId){const clubStaff=staffForClub(allStaff,clubId);return{allStaff,clubStaffIds:clubStaff.map(s=>s.id),managerId:managerForClub(allStaff,clubId)?.id||null,freeStaffCount:freeStaff(allStaff).length};}
export const FACILITY_SPECS={
  stadium:{name:'Stadium',maxLevel:4,baseUpgrade:7500000,maintenance:65000},
  training:{name:'Training Facilities',maxLevel:4,baseUpgrade:2500000,maintenance:30000},
  youth:{name:'Youth Facilities',maxLevel:4,baseUpgrade:2200000,maintenance:28000},
  medical:{name:'Medical Facilities',maxLevel:4,baseUpgrade:1800000,maintenance:24000}
};
export function facilityUpgradeCost(key,state){
  const f=state?.facilities?.[key]||{},spec=FACILITY_SPECS[key];
  if(!spec||Number(f.level||1)>=spec.maxLevel)return 0;
  const scale=key==='stadium'?Math.max(1,Number(f.capacity||0)/30000):1;
  return Math.round((spec.baseUpgrade*Math.pow(1.55,Math.max(0,Number(f.level||1)-1))*scale)/10000)*10000;
}
export function facilityMaintenanceCost(key,state){
  const f=state?.facilities?.[key]||{},spec=FACILITY_SPECS[key];
  if(!spec)return 0;
  return Math.round((spec.maintenance*Math.max(1,Number(f.level||1)))/1000)*1000;
}
export function facilityEffect(key,state){
  const f=state?.facilities?.[key]||{},level=Number(f.level||1),condition=Math.max(0,Math.min(100,Number(f.condition??100)));
  return (1+(level-1)*.08)*(.65+.35*(condition/100));
}
export function defaultFacilities(club){return{stadium:{id:'crown-arena',name:'The Crown Arena',capacity:Number(club?.stadiumCapacity)||0,level:1,condition:100},training:{level:1,condition:100},youth:{level:1,condition:100},medical:{level:1,condition:100}};}
function ensureFacilities(state,club){const defaults=defaultFacilities(club),existing=state?.facilities||{};return{stadium:{...defaults.stadium,...(existing.stadium||{}),capacity:Number(existing.stadium?.capacity||defaults.stadium.capacity)},training:{...defaults.training,...(existing.training||{})},youth:{...defaults.youth,...(existing.youth||{})},medical:{...defaults.medical,...(existing.medical||{})}};}
function ensureStaffState(state,players){const clubIds=[...new Set((players||[]).map(p=>p.clubId).filter(Boolean))];const generated=generateStaff(clubIds.map(id=>({id})));if(!Array.isArray(state.staffDatabase)||!state.staffDatabase.length)return staffSnapshot(generated,state.clubId);const byId=new Map(state.staffDatabase.map(s=>[s.id,s]));for(const s of generated)if(!byId.has(s.id))byId.set(s.id,s);const allStaff=[...byId.values()];return staffSnapshot(allStaff,state.clubId);}
export function createCareer(club,world,players){const clubPlayers=preparePlayers(players.filter(p=>p.clubId===club.id));const firstTeam=clubPlayers.filter(p=>p.age>=20),youthSquad=clubPlayers.filter(p=>p.age<20).slice(0,YOUTH_SQUAD_CAPACITY);const allStaff=generateStaff(world.clubs);const manager=managerForClub(allStaff,club.id);return{version:11,clubId:club.id,facilities:defaultFacilities(club),week:1,year:2026,cash:club.cash,debt:club.debt,transferBudget:club.transferBudget,wageBudget:club.wageBudget,reputation:club.reputation,fanConfidence:club.fanConfidence,boardConfidence:club.boardConfidence,managerConfidence:club.managerConfidence,leaguePosition:Math.max(1,Math.min(20,club.tier*3+2)),manager:manager||{name:'Marco Varela',reputation:club.reputation-8,contractYears:2},staffDatabase:allStaff,clubStaffIds:staffForClub(allStaff,club.id).map(s=>s.id),managerId:manager?.id||null,freeStaffCount:freeStaff(allStaff).length,inbox:[{id:1,type:'BOARD',title:'Welcome to the club',text:'Your ownership era begins today. Expectations are already being set.',unread:true}],news:[{week:1,title:'New ownership era begins',text:`${club.name} has entered a new chapter under your leadership.`}],events:[],form:[],lastMatch:{opponent:'Eastport United',home:true,result:'2–1',headline:'Strong opening result'},players:firstTeam,youthSquad,retiredPlayers:[],pendingRetirements:[],transferMarket:seedTransferMarket(players,club.id),finance:seedFinance(club,firstTeam),activeView:'hq',toast:''};}
export function migrateCareer(state,club,players){if(!state||!club)return null;const existingPlayers=state.players?.length?state.players:players.filter(p=>p.clubId===club.id&&p.age>=20);const clubPlayers=preparePlayers(existingPlayers);const youthSquad=(Array.isArray(state.youthSquad)?state.youthSquad:players.filter(p=>p.clubId===club.id&&p.age<20)).map(ensurePlayerModel).slice(0,YOUTH_SQUAD_CAPACITY);const finance=state.finance||seedFinance(club,clubPlayers);finance.seasonRevenue??=0;finance.seasonCosts??=0;finance.seasonNet??=finance.seasonRevenue-finance.seasonCosts;finance.weeklyWages??=clubPlayers.reduce((sum,p)=>sum+(Number(p.wage)||0),0);finance.transferSpend??=0;finance.transferIncome??=0;finance.lastWeek??={revenue:0,costs:0,net:0,breakdown:{}};finance.lastWeek.breakdown??={};finance.history??=[];finance.reserveTarget??=Math.max(5000000,Math.round((club.debt||0)*.1));finance.transferCommitments??=0;const existing=Array.isArray(state.transferMarket)?state.transferMarket:[];const transferMarket=existing.length&&existing[0].name?existing:seedTransferMarket(players,club.id);const staff=ensureStaffState(state,players);const manager=staff.allStaff.find(s=>s.id===staff.managerId)||state.manager||null;return{...state,version:11,facilities:ensureFacilities(state,club),players:clubPlayers,youthSquad,retiredPlayers:Array.isArray(state.retiredPlayers)?state.retiredPlayers:[],pendingRetirements:Array.isArray(state.pendingRetirements)?state.pendingRetirements:[],finance,transferMarket,form:Array.isArray(state.form)?state.form:[],staffDatabase:staff.allStaff,clubStaffIds:staff.clubStaffIds,managerId:staff.managerId,freeStaffCount:staff.freeStaffCount,manager};}
export function createYouthPlayer(clubId,seed){return newGenerationPlayer(`${clubId}-youth-${seed}`,clubId,seed);}
