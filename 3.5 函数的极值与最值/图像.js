"use strict";
document.querySelectorAll(".curve").forEach((svg) => {
  const closed = svg.dataset.kind === "closed";
  const maximum = svg.dataset.kind === "max";
  const kind = svg.dataset.kind;
  const f = closed ? x => x*x*x-3*x : kind === "quartic-min" ? x => x**4 : kind === "quartic-max" ? x => -(x**4) : kind === "cubic" ? x => x**3 : x => (maximum ? -1 : 1)*x*x;
  const bound = closed ? 3 : ["quartic-min","quartic-max","cubic"].includes(kind) ? 1.4 : 2;
  const X = x => 300+x*(closed ? 80 : 115);
  const Y = y => 175-y*(closed ? 7.5 : 31);
  svg.setAttribute("viewBox", "0 0 600 350");
  const axisX = (kind === 'max' || kind === 'min') ? 220 : 300;
  let content = '<g stroke="#a1adba" fill="none"><path d="M25 175H575 M'+axisX+' 15V330"/></g>';
  content += '<g fill="#17365d" font-family="Cambria,serif" font-size="22"><text x="578" y="166">x</text><text x="'+(axisX+10)+'" y="23">y</text></g>';
  let path = "";
  for (let i=0; i<=300; i++) {
    const x = -bound+2*bound*i/300;
    path += (i ? "L" : "M")+X(x)+","+Y(f(x))+" ";
  }
  content += '<path d="'+path+'" stroke="#17365d" stroke-width="4" fill="none"/>';
  for (const x of (closed ? [-3,-1,1,3] : [0])) {
    const y = f(x), endpoint = closed && Math.abs(x) === 3;
    content += '<path d="M'+X(x)+' 175V'+Y(y)+'" stroke="#a1adba" stroke-dasharray="4 5"/>';
    content += endpoint
      ? '<rect x="'+(X(x)-6)+'" y="'+(Y(y)-6)+'" width="12" height="12" fill="#17365d"/>'
      : '<circle cx="'+X(x)+'" cy="'+Y(y)+'" r="6" fill="#b26936"/>';
    content += '<text x="'+X(x)+'" y="'+(closed && x===1 ? 224 : 204)+'" text-anchor="middle" fill="#17365d" font-size="22" font-family="Cambria,serif">'+(closed ? x : ["quartic-min","quartic-max","cubic"].includes(kind) ? "0" : "x₀")+'</text>';
    if(endpoint && svg.dataset.showValues === "yes") content += '<text x="'+(X(x)+(x<0?14:-14))+'" y="'+(Y(y)-12)+'" text-anchor="'+(x<0?'start':'end')+'" fill="#17365d" font-size="22">'+y+'</text>';
  }
  svg.innerHTML = content;
});



