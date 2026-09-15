function seedFinance(club, players) {
  const weeklyWages = players.reduce((sum, player) => sum + (Number(player.wage) || 0), 0);
  return {
    seasonRevenue: 0,
    seasonCosts: 0,
    seasonNet: 0,
    weeklyWages,
    lastWeek: {
      revenue: 0,
      costs: 0,
      net: 0,
      breakdown: { matchday: 0, broadcast: 0, sponsorship: 0, commercial: 0, performanceBonus: 0, wages: 0, operations: 0, debtService: 0, transferInstallment: 0, travel: 0 }
    },
    history: [],
    reserveTarget: Math.max(5000000, Math.round((club.debt || 0) * 0.1)),
    transferCommitments: 0
  };
}

export function createCareer(club, world, players) {
  const clubPlayers = players.filter(p=>p.clubId===club.id);
  return {
    version:3,
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
    form:[],
    lastMatch:{opponent:'Eastport United',home:true,result:'2–1',headline:'Strong opening result'},
    players:clubPlayers,
    finance:seedFinance(club, clubPlayers),
    activeView:'hq',
    toast:''
  };
}

export function migrateCareer(state, club, players) {
  if (!state || !club) return null;
  const clubPlayers = state.players?.length ? state.players : players.filter(p=>p.clubId===club.id);
  const finance = state.finance || seedFinance(club, clubPlayers);
  finance.seasonRevenue ??= 0;
  finance.seasonCosts ??= 0;
  finance.seasonNet ??= finance.seasonRevenue - finance.seasonCosts;
  finance.weeklyWages ??= clubPlayers.reduce((sum,p)=>sum+(Number(p.wage)||0),0);
  finance.lastWeek ??= {revenue:0,costs:0,net:0,breakdown:{}};
  finance.lastWeek.breakdown ??= {};
  finance.history ??= [];
  finance.reserveTarget ??= Math.max(5000000, Math.round((club.debt || 0) * 0.1));
  finance.transferCommitments ??= 0;
  return {...state, version:3, players:clubPlayers, finance, form:Array.isArray(state.form)?state.form:[]};
}
