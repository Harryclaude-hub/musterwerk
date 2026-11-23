/* Musterwerk: Navigation, Fussbereich und Generator. Alles laeuft im Browser, nichts wird gesendet. */
const PAGES=[["index.html","Start"],["generator.html","Generator"],["preise.html","Preise"],["faq.html","FAQ"],["bedingungen.html","Bedingungen"]];
const here=location.pathname.split("/").pop()||"index.html";
document.querySelector("#nav")&&(document.querySelector("#nav").outerHTML=
`<header class="nav"><a class="skip" href="#main">Zum Inhalt</a><a class="logo" href="index.html">Muster<b>werk</b></a>`+
PAGES.map(([h,t])=>`<a class="l" href="${h}"${h===here?' aria-current="page"':''}>${t}</a>`).join("")+
`<a class="cta" href="generator.html">Generator starten</a></header>
<div class="banner">Alle Muster tragen ein festes Wasserzeichen und sind kein gueltiges Dokument. Missbrauch ist verboten. <a href="bedingungen.html" style="color:inherit">Bedingungen</a></div>`);
document.querySelector("#foot")&&(document.querySelector("#foot").outerHTML=
`<footer><div><a href="bedingungen.html">Bedingungen</a><a href="datenschutz.html">Datenschutz</a><a href="impressum.html">Impressum</a></div><p>Musterwerk, Vorlagen und Muster. Keine Rechtsberatung.</p></footer>`);

const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const $=id=>document.getElementById(id);

/* ---------- Tabs ---------- */
function tabs(){
  const btns=document.querySelectorAll("[role=tab]");
  btns.forEach(b=>b.addEventListener("click",()=>{
    btns.forEach(x=>{x.setAttribute("aria-selected",x===b);$(x.dataset.p).hidden=x!==b});
  }));
}

/* ---------- Muster-Karte (immer mit Wasserzeichen) ---------- */
function drawCard(f){
  const c=$("card"),g=c.getContext("2d"),W=c.width,H=c.height;
  const val=id=>f?f[id]:$(id).value;
  const v=id=>(val(id)||"").trim().slice(0,28);
  const theme=val("theme");
  const cols={blau:["#dbe9ff","#9fc0f5","#1c3b7a"],gruen:["#dff5e6","#a5d8b5","#1d5a36"],rot:["#fde2e2","#efb0b0","#7a1c1c"]}[theme];
  const gr=g.createLinearGradient(0,0,W,H);gr.addColorStop(0,cols[0]);gr.addColorStop(1,cols[1]);
  g.fillStyle=gr;g.fillRect(0,0,W,H);
  g.fillStyle=cols[2];g.fillRect(0,0,W,70);
  g.fillStyle="#fff";g.font="bold 26px sans-serif";g.fillText("REPUBLIK MUSTERLAND",24,32);
  g.font="16px sans-serif";g.fillText(val("kind")+" (Muster, fiktiv)",24,56);
  /* Foto-Platzhalter */
  g.fillStyle="#c9d2e2";g.fillRect(24,100,190,240);
  g.fillStyle="#8a96ad";g.beginPath();g.arc(119,185,42,0,7);g.fill();
  g.beginPath();g.ellipse(119,320,80,70,0,Math.PI,0);g.fill();
  const rows=[["Nachname",v("sn")],["Vorname",v("gn")],["Geburtsdatum",v("bd")],["Gueltig bis",v("ex")],["Nummer","MUSTER-0000"]];
  rows.forEach(([k,val],i)=>{const y=110+i*50;
    g.fillStyle="#44506b";g.font="13px sans-serif";g.fillText(k.toUpperCase(),240,y);
    g.fillStyle="#111";g.font="bold 24px monospace";g.fillText(val||"-",240,y+26);});
  g.fillStyle=cols[2];g.font="bold 15px monospace";
  g.fillText("SPECIMEN<<NICHT<<GUELTIG<<KEIN<<AUSWEIS<<<<<<<<<<",24,H-54);
  g.fillText("MUSTER0000<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<",24,H-30);
  /* festes Wasserzeichen, absichtlich nicht abschaltbar */
  g.save();g.translate(W/2,H/2);g.rotate(-0.42);
  g.font="bold 64px sans-serif";g.textAlign="center";g.fillStyle="rgba(200,20,40,.28)";
  for(let y=-420;y<=420;y+=110){g.fillText("MUSTER · SPECIMEN",0,y)}
  g.restore();
  g.fillStyle="rgba(200,20,40,.9)";g.fillRect(0,H-12,W,12);
}
function cardInit(){
  ["kind","theme","sn","gn","bd","ex"].forEach(id=>$(id).addEventListener("input",drawCard));
  $("dl").addEventListener("click",()=>{$("card").toBlob(b=>{const a=document.createElement("a");a.href=URL.createObjectURL(b);a.download="muster-karte.png";a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)})});
  drawCard();
}

/* ---------- Dokumente ---------- */
const eur=n=>n.toLocaleString("de-AT",{style:"currency",currency:"EUR"});
function items(){
  return $("items").value.split("\n").map(l=>l.split(";").map(s=>s.trim())).filter(a=>a[0]).map(a=>({t:a[0],q:parseFloat((a[1]||"1").replace(",","."))||1,p:parseFloat((a[2]||"0").replace(",","."))||0}));
}
function renderDoc(){
  const k=$("dtype").value,from=esc($("from").value).replace(/\n/g,"<br>"),to=esc($("to").value).replace(/\n/g,"<br>");
  const nr=esc($("nr").value),dt=esc($("date").value),vat=parseFloat($("vat").value)||0,it=items();
  const net=it.reduce((s,i)=>s+i.q*i.p,0),tax=net*vat/100;
  let h=`<p>${from}</p><p><strong>An:</strong><br>${to}</p>`;
  if(k==="vertrag"){
    h+=`<h2>Dienstleistungsvertrag Nr. ${nr}</h2><p>Datum: ${dt}</p>
    <p><strong>1. Leistung.</strong> Der Auftragnehmer erbringt folgende Leistungen:</p><ul>${it.map(i=>`<li>${esc(i.t)}</li>`).join("")}</ul>
    <p><strong>2. Verguetung.</strong> Das Entgelt betraegt ${eur(net)} netto zuzueglich ${vat} % Umsatzsteuer (${eur(tax)}), gesamt ${eur(net+tax)}. Zahlbar binnen 14 Tagen nach Rechnungslegung.</p>
    <p><strong>3. Laufzeit.</strong> Der Vertrag beginnt am ${dt} und endet mit vollstaendiger Leistungserbringung.</p>
    <p><strong>4. Schlussbestimmungen.</strong> Aenderungen beduerfen der Schriftform. Es gilt das Recht des Sitzstaates des Auftragnehmers.</p>
    <p style="margin-top:50px">______________________ &nbsp;&nbsp;&nbsp;&nbsp; ______________________<br>Auftragnehmer &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Auftraggeber</p>`;
  }else{
    const titel=k==="rechnung"?"Rechnung":"Angebot";
    h+=`<h2>${titel} Nr. ${nr}</h2><p>Datum: ${dt}</p><table><tr><th>Position</th><th class="r">Menge</th><th class="r">Einzelpreis</th><th class="r">Summe</th></tr>`+
    it.map(i=>`<tr><td>${esc(i.t)}</td><td class="r">${i.q}</td><td class="r">${eur(i.p)}</td><td class="r">${eur(i.q*i.p)}</td></tr>`).join("")+
    `<tr><td colspan="3" class="r">Netto</td><td class="r">${eur(net)}</td></tr><tr><td colspan="3" class="r">USt ${vat} %</td><td class="r">${eur(tax)}</td></tr><tr><td colspan="3" class="r"><strong>Gesamt</strong></td><td class="r"><strong>${eur(net+tax)}</strong></td></tr></table>`+
    (k==="rechnung"?`<p>Zahlbar binnen 14 Tagen ohne Abzug. Bitte Rechnungsnummer angeben.</p>`:`<p>Dieses Angebot ist 30 Tage ab Datum gueltig.</p>`);
  }
  $("doc").innerHTML=h;
}
function docInit(){
  $("date").value=new Date().toISOString().slice(0,10);
  document.querySelectorAll("#dform input,#dform select,#dform textarea").forEach(e=>e.addEventListener("input",renderDoc));
  $("print").addEventListener("click",()=>window.print());
  renderDoc();
}
if($("kind")){tabs();cardInit();docInit()}
else if($("card")){drawCard({kind:"Personalausweis",theme:"blau",sn:"MUSTERMANN",gn:"MAX",bd:"01.01.1990",ex:"01.01.2030"})}
