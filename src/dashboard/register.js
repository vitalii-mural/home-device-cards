if(!customElements.get('home-dashboard'))customElements.define('home-dashboard',HomeDashboard);
window.customCards=window.customCards||[];
if(!window.customCards.some(card=>card.type==='home-dashboard'))window.customCards.push({type:'home-dashboard',name:'Домашня панель',description:'Бойлер, клімат, EcoFlow та енергія.'});
