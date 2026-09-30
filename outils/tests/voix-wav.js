const fs=require("fs");
const sr=44100, notes=[67,67,69,67,72,71,67,67,69,67,74,72], dur=[.45,.25,.6,.6,.6,1.0,.45,.25,.6,.6,.6,1.0];
const seg=[]; let t=0.6; notes.forEach((m,i)=>{seg.push([t,t+dur[i],m]); t+=dur[i]+0.09;});
const total=t+0.8, n=Math.floor(total*sr), d=new Int16Array(n);
let ph=0;
for(let i=0;i<n;i++){const tt=i/sr; const s=seg.find(x=>tt>=x[0]&&tt<x[1]); let v=(Math.random()-0.5)*0.004;
  if(s){const f=440*Math.pow(2,(s[2]-69)/12)*Math.pow(2,0.2*Math.sin(2*Math.PI*5.2*tt)/12); ph+=2*Math.PI*f/sr;
    const env=Math.min(1,(tt-s[0])/0.04,(s[1]-tt)/0.05); v+=env*0.35*(Math.sin(ph)+0.5*Math.sin(2*ph)+0.25*Math.sin(3*ph)+0.12*Math.sin(4*ph));}
  d[i]=Math.max(-32767,Math.min(32767,v*20000));}
const h=Buffer.alloc(44);h.write("RIFF",0);h.writeUInt32LE(36+n*2,4);h.write("WAVE",8);h.write("fmt ",12);h.writeUInt32LE(16,16);h.writeUInt16LE(1,20);h.writeUInt16LE(1,22);h.writeUInt32LE(sr,24);h.writeUInt32LE(sr*2,28);h.writeUInt16LE(2,32);h.writeUInt16LE(16,34);h.write("data",36);h.writeUInt32LE(n*2,40);
fs.writeFileSync(require("path").join(__dirname,"voix-test.wav"),Buffer.concat([h,Buffer.from(d.buffer)]));console.log("durée",total.toFixed(1),"s");
