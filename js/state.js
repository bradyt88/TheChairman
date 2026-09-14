export function createCareer(club, world, players) {
  return {
    version:1,
    clubId:club.id,
    week:1,
    year:2026,
    cash:club.cash,
    debt:club.debt,
    transferBudget:club.transferBudget,
    wageBudget:club.wageBudget,
    reputation:club.reputation,
    fanConfidence:club.fanConfidence,
    boardConfidence:club.boardConfidence,
    managerConfidence:club.managerConfidence,
    leaguePosition:Math.max(1, Math.min(20, club.tier*3+2)),
    manager:{name:'Marco Varela', reputation:club.reputation-8, contractYears:2},
    inbox:[{id:1,type:'BOARD',title:'Welcome to the club',text:'Your ownership era begins today. Expectations are already being set.',unread:true}],
    news:[{week:1,title:'New ownership era begins',text:`${club.name} has entered a new chapter under your leadership.`}],
    events:[],
    lastMatch:{opponent:'Eastport United',home:true,result:'2–1',headline:'Strong opening result'},
    players:players.filter(p=>p.clubId===club.id),
    activeView:'hq',
    toast:''
  };
}
