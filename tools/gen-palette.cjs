// Jamool design-token generator: official brand hex -> OKLCH scales (50..950) used by Tailwind via CSS variables.
const fs=require('fs');
const hex2rgb=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)/255);
const lin=c=>c<=0.04045?c/12.92:Math.pow((c+0.055)/1.055,2.4);
function toOklch(h){const [r,g,b]=hex2rgb(h).map(lin);
 const l=Math.cbrt(0.4122214708*r+0.5363325363*g+0.0514459929*b),m=Math.cbrt(0.2119034982*r+0.6806995451*g+0.1073969566*b),s=Math.cbrt(0.0883024619*r+0.2817188376*g+0.6299787005*b);
 const L=0.2104542553*l+0.793617785*m-0.0040720468*s,A=1.9779984951*l-2.428592205*m+0.4505937099*s,B=0.0259040371*l+0.7827717662*m-0.808675766*s;
 const C=Math.hypot(A,B);let H=Math.atan2(B,A)*180/Math.PI;if(H<0)H+=360;return [L,C,H];}
const f=(n,d=3)=>String(+n.toFixed(d));
const STEPS=[50,100,200,300,400,500,600,700,800,900,950];
// scale from a base colour placed at step 500
function scaleFrom(base,{lightTop=0.978,darkBottom=0.22}={}){const [L0,C0,H]=toOklch(base);const out={};
 STEPS.forEach((st,idx)=>{ let L,C;
  if(st===500){L=L0;C=C0;}
  else if(st<500){const t=(500-st)/450;L=L0+(lightTop-L0)*Math.pow(t,0.85);C=C0*(1-0.88*Math.pow(t,0.9));}
  else{const t=(st-500)/450;L=L0+(darkBottom-L0)*Math.pow(t,0.9);C=C0*(1-0.35*t);}
  out[st]=`${f(L)} ${f(C,3)} ${f(H,1)}`;});return out;}
// scale from an explicit hex list
function scaleHex(list){const out={};STEPS.forEach((st,i)=>{const [L,C,H]=toOklch(list[i]);out[st]=`${f(L)} ${f(C,3)} ${f(H,1)}`;});return out;}
const palettes={
 // cream = surfaces / foreground = navy text
 background:scaleHex(['#FFFBF3','#FFF4DE','#FBE8C4','#F2D8A8','#E3C189','#C9A46A','#A78450','#826640','#5E4A33','#3E3226','#271F18']),
 foreground:scaleHex(['#F3F5FB','#E4E8F5','#C9D0E8','#A3AECF','#7783AE','#55618F','#3E4A7A','#2F3A6B','#263161','#1F2A5C','#141C42']),
 primary:scaleFrom('#FFC43D'),      // saffron
 secondary:scaleFrom('#F0563A'),    // coral
 accent:scaleFrom('#1E9E96'),       // turquoise
 sky:scaleFrom('#2F7BEA'),          // blue
 violet:scaleFrom('#8D6BEB'),       // purple
 amber:scaleFrom('#F5A63A'),        // orange / Jamool warmth
 leaf:scaleFrom('#3E9E6A'),         // values / success (from the icon sheet in the brand PDF)
};
let css=':root{';
for(const [name,sc] of Object.entries(palettes))for(const st of STEPS)css+=`--${name}-${st}:${sc[st]};`;
css+='}';
fs.writeFileSync('tools/palette-vars.txt',css);
const tw=Object.keys(palettes).map(n=>`    ${n}: {${STEPS.map(s=>`'${s}': 'oklch(var(--${n}-${s}) / <alpha-value>)'`).join(', ')}}`).join(',\n');
fs.writeFileSync('tools/palette-tailwind.txt',tw);
console.log(css.length, Object.keys(palettes).join(','));
for(const n of ['primary','secondary','accent']) console.log(n, palettes[n][500], palettes[n][100], palettes[n][700]);
