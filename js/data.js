export async function loadWorld() {
  const res = await fetch('./data/world.json');
  if (!res.ok) throw new Error('Could not load football world data.');
  return res.json();
}

const firstNames = ['Adrian','Milo','Leon','Jasper','Matteo','Luca','Theo','Noah','Elias','Ruben','Oscar','Felix','Nico','Arthur','Jonas','Sami','Kai','Hugo','Evan','Max'];
const lastNames = ['Vale','Mercer','Santos','Keller','Rossi','Bauer','Navarro','Duarte','Mills','Hart','Vega','Costa','Bennett','Fischer','Moreau','Silva','Reed','Laurent','King','Meyer'];
const positions = ['GK','CB','CB','LB','RB','DM','CM','AM','LW','RW','ST'];

function hash(n) { let x = Math.sin(n * 12.9898) * 43758.5453; return x - Math.floor(x); }
export function generatePlayers(clubs) {
  const players = [];
  clubs.forEach((club, ci) => {
    for (let i=0;i<22;i++) {
      const seed = ci*100+i;
      const ability = Math.round(62 + hash(seed+3)*31 - Math.max(0, club.tier-1)*3);
      const potential = Math.min(94, Math.max(ability, ability + Math.round(hash(seed+8)*18-2)));
      players.push({
        id:`${club.id}-p${i+1}`, clubId:club.id,
        name:`${firstNames[(seed*7)%firstNames.length]} ${lastNames[(seed*11)%lastNames.length]}`,
        age:18+Math.floor(hash(seed+12)*18), position:positions[i%positions.length],
        overall:ability, potential, value:Math.round((ability*ability*4200 + potential*18000) / 1000)*1000,
        wage:Math.round((ability*ability*1.9 + potential*20)*10)/10,
        morale:65+Math.round(hash(seed+16)*30), form:55+Math.round(hash(seed+20)*40),
        contractYears:1+Math.floor(hash(seed+24)*5), personality:['Leader','Professional','Ambitious','Loyal','Volatile'][i%5]
      });
    }
  });
  return players;
}
