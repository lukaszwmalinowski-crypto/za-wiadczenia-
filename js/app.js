const $=id=>document.getElementById(id);
const signatureLines=[
  'Zastępca Dyrektora',
  'Wojewódzkiego Urzędu Pracy w Katowicach'
];
const signatureCaption='Podpisano elektronicznie';

const defaults={
 front:{
  heading:{x:50,y:21.2,w:82,s:39,b:true,f:'Georgia,serif'},
  name:{x:50,y:34.3,w:86,s:48,b:true,i:true,f:'Georgia,serif'},
  intro:{x:50,y:39.1,w:82,s:17,f:'Georgia,serif'},
  training:{x:50,y:47.1,w:82,s:23,b:true,i:true,f:'Georgia,serif'},
  trainingDate:{x:50,y:51.4,w:82,s:17,f:'Georgia,serif'},
  hours:{x:50,y:53.1,w:82,s:15,f:'Georgia,serif'},
  extra:{x:50,y:56.6,w:78,s:17,b:true,f:'Georgia,serif'},
  trainers:{x:30,y:67,w:40,s:16,a:'left',f:'Georgia,serif'},
  number:{x:30,y:84,w:40,s:15,a:'left',f:'Georgia,serif'},
  placeDate:{x:30,y:87,w:40,s:15,a:'left',f:'Georgia,serif'},
  signature:{x:72.1,y:79.2,w:34,h:16}
 },
 back:{program:{x:50,y:47.97528728530829,w:81,s:27,f:'Georgia,serif'}}
};
const paperDefaults={
  front:{
    ...defaults.front,
    heading:{...defaults.front.heading,y:26,s:36,b:false},
    name:{...defaults.front.name,y:41,s:51,b:false},
    intro:{...defaults.front.intro,y:48.5,i:true},
    training:{...defaults.front.training,y:53.5,s:25},
    trainingDate:{...defaults.front.trainingDate,y:57.5},
    hours:{...defaults.front.hours,y:59.5},
    extra:{...defaults.front.extra,y:63.5,s:15,b:false},
    trainers:{...defaults.front.trainers,y:72}
  },
  back:defaults.back
};
const templates={
  doradcy:{layout:defaults,background:certificateBackground},
  paper:{layout:paperDefaults,background:paperCertificateBackground},
  modern:{layout:defaults,background:modernCertificateBackground}
};

let side='front',selected=null,drag=null;
let previewPersonIndex=0;
const state={template:'doradcy',layouts:structuredClone(defaults)};
const layoutsByTemplate=Object.fromEntries(
  Object.entries(templates).map(([key,{layout}])=>[key,structuredClone(layout)])
);
layoutsByTemplate.doradcy=state.layouts;
const page=$('page'),bg=$('background');
function currentLayout(){return state.layouts[side]}
function selectedBackground(){
  return templates[state.template].background;
}
function setBackground(){bg.src=selectedBackground();page.classList.toggle('paper-template',state.template==='paper');page.classList.toggle('back',side==='back');$('pageLabel').textContent=side==='front'?'Przód zaświadczenia':'Tył zaświadczenia (opcjonalnie)';renderFields()}
function getPeople(){return ($('peopleList').value||'').split(/\r?\n/).map(v=>v.trim()).filter(Boolean)}
function padNumber(n,w){return String(n).padStart(Math.max(1,+w||1),'0')}
function buildCertNo(index){const n=(+$('startN').value||0)+index;return ($('certPattern').value||'{N}').replace(/\{N\}/g,padNumber(n,$('padN').value))}
function updatePeopleCount(){const n=getPeople().length;$('peopleCount').textContent=n+(n===1?' osoba':(n>=2&&n<=4?' osoby':' osób'));if(previewPersonIndex>=n)previewPersonIndex=0}
function fieldText(key){
  const trainers=$('trainersList').value.trim();
  const map={
    heading:'ZAŚWIADCZENIE',
    intro:'Potwierdza się udział wymienionej wyżej osoby w szkoleniu pt.',
    name:getPeople()[previewPersonIndex]||'Imię i nazwisko',
    training:$('trainingName').value,
    trainingDate:$('date').value?'w dniu: '+$('date').value:'',
    hours:$('hours').value?'w wymiarze '+$('hours').value:'',
    extra:$('extraText').value,
    trainers:trainers?'Prowadzący:\n'+trainers:'Prowadzący:',
    placeDate:[$('place').value,$('issueDate').value||$('date').value].filter(Boolean).join(', '),
    number:'Nr '+buildCertNo(previewPersonIndex),
    program:$('programText').value
  };
  return map[key]||'';
}
function renderFields(){document.querySelectorAll('.editable').forEach(el=>{const key=el.dataset.key;const cfg=currentLayout()[key];const text=fieldText(key);el.style.display=cfg&&text?'block':'none';if(!cfg)return;el.textContent=text;el.style.left=cfg.x+'%';el.style.top=cfg.y+'%';el.style.width=cfg.w+'%';el.style.fontSize=cfg.s+'px';el.style.fontWeight=cfg.b?'700':'400';el.style.fontStyle=cfg.i?'italic':'normal';el.style.fontFamily=cfg.f||'Arial,sans-serif';el.style.textAlign=cfg.a||'center'});renderAssets()}

function renderAssets(){
  const area=$('signatureFallback');
  area.innerHTML=`<span>${signatureLines.join('<br>')}</span><em>${signatureCaption}</em>`;
  const {x,y,w,h}=state.layouts.front.signature;
  area.style.display=side==='front'?'flex':'none';
  area.style.left=x+'%';
  area.style.top=y+'%';
  area.style.width=w+'%';
  area.style.height=h+'%';
}
function syncInputs(){updatePeopleCount();renderFields()}
['peopleList','certPattern','startN','padN','trainingName','hours','date','issueDate','place','extraText','trainersList','programText'].forEach(id=>$(id).addEventListener('input',syncInputs));


$('templateSelect').addEventListener('change',e=>{
  state.template=e.target.value;
  state.layouts=layoutsByTemplate[state.template];
  selected=null;
  document.querySelectorAll('.selected').forEach(el=>el.classList.remove('selected'));
  updateTools();
  setBackground();
});

document.querySelectorAll('[data-side]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('[data-side]').forEach(x=>x.classList.remove('active'));b.classList.add('active');side=b.dataset.side;selected=null;updateTools();setBackground()}));
function selectField(el){document.querySelectorAll('.editable,.asset,.signature-fallback').forEach(x=>x.classList.remove('selected'));selected=el;el.classList.add('selected');updateTools()}
function updateTools(){const tools=$('fieldTools');if(!selected){tools.classList.add('disabled');$('selectedName').textContent='Kliknij pole lub podpis na dokumencie.';return}tools.classList.remove('disabled');const key=selected.dataset.key;const c=currentLayout()[key];$('selectedName').textContent=key==='signature'?'Wybrany element: miejsce na podpis elektroniczny':'Wybrane pole: '+key;$('fontSize').disabled=key==='signature';$('fontFamily').disabled=key==='signature';$('boldBtn').disabled=key==='signature';$('italicBtn').disabled=key==='signature';$('fontSize').value=c.s||12;$('fieldWidth').value=c.w;$('fontFamily').value=c.f||'Arial,sans-serif';$('boldBtn').classList.toggle('active',!!c.b);$('italicBtn').classList.toggle('active',!!c.i)}
document.querySelectorAll('.editable').forEach(el=>{el.addEventListener('pointerdown',e=>{selectField(el);const r=page.getBoundingClientRect();const c=currentLayout()[el.dataset.key];drag={id:e.pointerId,key:el.dataset.key,dx:e.clientX-(r.left+c.x/100*r.width),dy:e.clientY-(r.top+c.y/100*r.height)};el.setPointerCapture(e.pointerId);e.preventDefault()});el.addEventListener('dblclick',()=>{const key=el.dataset.key;const input={name:'peopleList',training:'trainingName',hours:'hours',extra:'extraText',trainingDate:'date',placeDate:'issueDate',trainers:'trainersList',number:'certPattern',program:'programText'}[key];if(input)$(input).focus()})});
{const el=$('signatureFallback');el.dataset.key='signature';el.addEventListener('pointerdown',e=>{if(side!=='front')return;selectField(el);const r=page.getBoundingClientRect();const c=state.layouts.front.signature;drag={id:e.pointerId,key:'signature',dx:e.clientX-(r.left+c.x/100*r.width),dy:e.clientY-(r.top+c.y/100*r.height)};el.setPointerCapture(e.pointerId);e.preventDefault()})}
page.addEventListener('pointermove',e=>{if(!drag)return;const r=page.getBoundingClientRect();let x=(e.clientX-r.left-drag.dx)/r.width*100,y=(e.clientY-r.top-drag.dy)/r.height*100;const snap=1.2;let snapX=false,snapY=false;if(Math.abs(x-50)<snap){x=50;snapX=true}if(Math.abs(y-50)<snap){y=50;snapY=true}x=Math.max(3,Math.min(97,x));y=Math.max(3,Math.min(97,y));Object.assign(currentLayout()[drag.key],{x,y});$('snapGuideV').style.display=snapX?'block':'none';$('snapGuideV').style.left=x+'%';$('snapGuideH').style.display=snapY?'block':'none';$('snapGuideH').style.top=y+'%';renderFields()});
page.addEventListener('pointerup',()=>{drag=null;$('snapGuideV').style.display=$('snapGuideH').style.display='none'});
$('fontSize').addEventListener('input',e=>{if(selected&&selected.dataset.key!=='signature'){currentLayout()[selected.dataset.key].s=+e.target.value;renderFields()}});$('fieldWidth').addEventListener('input',e=>{if(selected){currentLayout()[selected.dataset.key].w=+e.target.value;renderFields()}});$('fontFamily').addEventListener('change',e=>{if(selected&&selected.dataset.key!=='signature'){currentLayout()[selected.dataset.key].f=e.target.value;renderFields()}});$('boldBtn').addEventListener('click',()=>{if(selected&&selected.dataset.key!=='signature'){const c=currentLayout()[selected.dataset.key];c.b=!c.b;renderFields();updateTools()}});$('italicBtn').addEventListener('click',()=>{if(selected&&selected.dataset.key!=='signature'){const c=currentLayout()[selected.dataset.key];c.i=!c.i;renderFields();updateTools()}});document.querySelectorAll('[data-align]').forEach(b=>b.addEventListener('click',()=>{if(selected&&selected.dataset.key!=='signature'){currentLayout()[selected.dataset.key].a=b.dataset.align;renderFields()}}));$('centerField').addEventListener('click',()=>{if(selected){currentLayout()[selected.dataset.key].x=50;renderFields()}});$('resetLayout').addEventListener('click',()=>{state.layouts[side]=structuredClone(templates[state.template].layout[side]);selected=null;updateTools();renderFields()});


$('showCenter').addEventListener('change',e=>document.querySelectorAll('.guide').forEach(x=>x.style.display=e.target.checked?'block':'none'));$('showSafe').addEventListener('change',e=>$('page').querySelector('.safe-area').style.display=e.target.checked?'block':'none');$('showGrid').addEventListener('change',e=>$('page').querySelector('.grid-overlay').style.display=e.target.checked?'block':'none');
function projectData(){return{version:3,state,includeBack:$('includeBack').checked,fields:{peopleList:$('peopleList').value,certPattern:$('certPattern').value,startN:$('startN').value,padN:$('padN').value,trainingName:$('trainingName').value,hours:$('hours').value,date:$('date').value,issueDate:$('issueDate').value,place:$('place').value,extraText:$('extraText').value,trainersList:$('trainersList').value,programText:$('programText').value}}}
$('saveProject').addEventListener('click',()=>{const blob=new Blob([JSON.stringify(projectData(),null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=trainingAndDateFileName('projekt_certyfikatu','json');a.click();URL.revokeObjectURL(a.href)});
$('loadProject').addEventListener('change',async e=>{
  const input=e.target;
  const file=input.files[0];
  if(!file)return;
  try{
    const project=JSON.parse(await file.text());
    const importedTemplate=project.state?.template;
    state.template=Object.hasOwn(templates,importedTemplate)?importedTemplate:'doradcy';
    const layoutDefaults=templates[state.template].layout;
    const layouts=project.state?.layouts;
    state.layouts={
      front:{
        ...structuredClone(layoutDefaults.front),
        ...(importedTemplate===state.template?layouts?.front:{})
      },
      back:{...structuredClone(layoutDefaults.back),...layouts?.back}
    };
    state.layouts.front.signature={...layoutDefaults.front.signature,...(importedTemplate===state.template?layouts?.front?.signature:{})};
    layoutsByTemplate[state.template]=state.layouts;
    $('templateSelect').value=state.template;
    selected=null;
    document.querySelectorAll('.selected').forEach(el=>el.classList.remove('selected'));
    updateTools();
    for(const key of Object.keys(projectData().fields)){
      if(project.fields?.[key]!=null)$(key).value=project.fields[key];
    }
    if(project.fields?.issueDate==null)$('issueDate').value=project.fields?.date||'';
    $('includeBack').checked=project.includeBack===true;
    updatePeopleCount();
    setBackground();
  }catch{alert('Nie udało się wczytać projektu JSON.')}
  finally{input.value=''}
});



function cleanFileName(value){return String(value||'plik').replace(/[\\/:*?"<>|]+/g,'_').replace(/\s+/g,'_').replace(/^_+|_+$/g,'').slice(0,120)}
function currentDateLabel(){return cleanFileName(($('date')&&$('date').value)||'bez_daty')}
function trainingAndDateFileName(prefix,ext){const training=cleanFileName(($('trainingName')&&$('trainingName').value)||'szkolenie');return `${cleanFileName(prefix)}_${training}_${currentDateLabel()}.${ext}`}
function personPdfFileName(person){return `${cleanFileName(person||'uczestnik')}_${currentDateLabel()}.pdf`}
function combinedPdfFileName(){const place=cleanFileName(($('place')&&$('place').value)||'szkolenie');return `${place}_${currentDateLabel()}.pdf`}
function downloadBlob(name,blob){const a=document.createElement('a');const url=URL.createObjectURL(blob);a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500)}
function loadImg(src){return new Promise((resolve,reject)=>{const i=new Image();if(/^https?:/i.test(src))i.crossOrigin='anonymous';i.onload=()=>resolve(i);i.onerror=()=>reject(new Error('Nie udało się wczytać obrazu potrzebnego do PDF.'));i.src=src})}
function wrapCanvasText(ctx,text,maxWidth){const lines=[];String(text||'').split(/\n/).forEach(par=>{if(!par){lines.push('');return}const words=par.split(/\s+/);let line='';words.forEach(word=>{const test=line?line+' '+word:word;if(ctx.measureText(test).width>maxWidth&&line){lines.push(line);line=word}else line=test});if(line)lines.push(line)});return lines}
async function renderCertificateCanvas(personIndex,pageSide){
  const W=1655,H=2340,canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;const ctx=canvas.getContext('2d');
  const background=await loadImg(selectedBackground());ctx.drawImage(background,0,0,W,H);
  const oldSide=side,oldIndex=previewPersonIndex;side=pageSide;previewPersonIndex=personIndex;
  const layout=state.layouts[pageSide];
  for(const [key,cfg] of Object.entries(layout)){
    const text=fieldText(key);if(!text)continue;
    const scale=W/760;const size=(cfg.s||14)*scale;ctx.save();ctx.fillStyle='#1c2230';ctx.textAlign=cfg.a||'center';ctx.textBaseline='middle';ctx.font=`${cfg.i?'italic ':''}${cfg.b?'700':'400'} ${size}px ${String(cfg.f||'Arial').split(',')[0].replace(/["']/g,'')}`;
    const maxW=W*(cfg.w||70)/100;const lines=wrapCanvasText(ctx,text,maxW);const lh=size*1.22;const x=W*cfg.x/100;const y=H*cfg.y/100-(lines.length-1)*lh/2;
    lines.forEach((line,j)=>{let tx=x;if((cfg.a||'center')==='left')tx=x-maxW/2;if((cfg.a||'center')==='right')tx=x+maxW/2;ctx.fillText(line,tx,y+j*lh,maxW)});
    if(state.template==='paper'&&key==='name'){
      const underlineY=H*cfg.y/100+lines.length*lh/2+4*scale;
      ctx.fillStyle='#606068';
      ctx.fillRect(x-maxW/2,underlineY,maxW,scale);
    }
    ctx.restore();
  }
  if(pageSide==='front'){
    const {x,y,w,h}=layout.signature;
    ctx.fillStyle='#465d6b';
    ctx.textAlign='center';
    ctx.textBaseline='bottom';
    ctx.font=`400 ${12*W/760}px Arial`;
    const lineHeight=15*W/760;
    const bottom=H*(y+h/2)/100;
    signatureLines.forEach((line,index)=>{
      ctx.fillText(line,W*x/100,bottom-(signatureLines.length-index)*lineHeight,W*w/100);
    });
    ctx.font=`italic 400 ${10*W/760}px Arial`;
    ctx.fillText(signatureCaption,W*x/100,bottom,W*w/100);
  }
  side=oldSide;previewPersonIndex=oldIndex;return canvas;
}
function dataUrlBytes(dataUrl){const b=atob(dataUrl.split(',')[1]);const u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return u}
function concatBytes(parts){let len=parts.reduce((a,b)=>a+b.length,0),out=new Uint8Array(len),o=0;parts.forEach(p=>{out.set(p,o);o+=p.length});return out}
function textBytes(s){return new TextEncoder().encode(s)}
function buildJpegPdf(jpegs,pageW=595.28,pageH=841.89){
 const objs=[];const add=parts=>{objs.push(Array.isArray(parts)?parts:[textBytes(parts)]);return objs.length};
 add('<< /Type /Catalog /Pages 2 0 R >>\n');add('');const pageIds=[];
 jpegs.forEach((j,idx)=>{const bytes=dataUrlBytes(j.url);const img=add([textBytes(`<< /Type /XObject /Subtype /Image /Width ${j.w} /Height ${j.h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${bytes.length} >>\nstream\n`),bytes,textBytes('\nendstream\n')]);const content=`q\n${pageW} 0 0 ${pageH} 0 0 cm\n/Im${idx+1} Do\nQ\n`;const cont=add(`<< /Length ${content.length} >>\nstream\n${content}endstream\n`);const pg=add(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageW} ${pageH}] /Resources << /XObject << /Im${idx+1} ${img} 0 R >> >> /Contents ${cont} 0 R >>\n`);pageIds.push(pg)});
 objs[1]=[textBytes(`<< /Type /Pages /Kids [${pageIds.map(id=>id+' 0 R').join(' ')}] /Count ${pageIds.length} >>\n`)];
 const chunks=[textBytes('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n')],offsets=[0];let pos=chunks[0].length;
 objs.forEach((parts,i)=>{offsets[i+1]=pos;const h=textBytes(`${i+1} 0 obj\n`),f=textBytes('endobj\n');chunks.push(h,...parts,f);pos+=h.length+parts.reduce((a,b)=>a+b.length,0)+f.length});const xref=pos;let x=`xref\n0 ${objs.length+1}\n0000000000 65535 f \n`;for(let i=1;i<=objs.length;i++)x+=String(offsets[i]).padStart(10,'0')+' 00000 n \n';x+=`trailer\n<< /Size ${objs.length+1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;chunks.push(textBytes(x));return new Blob([concatBytes(chunks)],{type:'application/pdf'})
}
async function personJpegs(index){const canvases=[await renderCertificateCanvas(index,'front')];if($('includeBack').checked)canvases.push(await renderCertificateCanvas(index,'back'));return canvases.map(c=>({url:c.toDataURL('image/jpeg',.97),w:c.width,h:c.height}))}
function setBatchStatus(t){$('batchStatus').textContent=t}
async function generateCombined(){const people=getPeople();if(!people.length)return alert('Wpisz co najmniej jedną osobę.');try{setBatchStatus('Generowanie 0 z '+people.length+'…');const pages=[];for(let i=0;i<people.length;i++){pages.push(...await personJpegs(i));setBatchStatus(`Generowanie ${i+1} z ${people.length}…`)}downloadBlob(combinedPdfFileName(),buildJpegPdf(pages));setBatchStatus(`Gotowe: ${people.length} osób, ${pages.length} stron.`)}catch(e){console.error(e);alert('Nie udało się wygenerować PDF: '+e.message);setBatchStatus('Błąd generowania.') }}
async function generateSeparate(){const people=getPeople();if(!people.length)return alert('Wpisz co najmniej jedną osobę.');if(people.length>25&&!confirm(`Zostanie pobranych ${people.length} osobnych plików PDF. Kontynuować?`))return;try{for(let i=0;i<people.length;i++){setBatchStatus(`Plik ${i+1} z ${people.length}…`);const pages=await personJpegs(i);downloadBlob(personPdfFileName(people[i]),buildJpegPdf(pages));await new Promise(r=>setTimeout(r,180))}setBatchStatus(`Pobrano ${people.length} osobnych plików PDF.`)}catch(e){console.error(e);alert('Nie udało się wygenerować osobnych PDF-ów: '+e.message)}}
async function attendanceCanvas(people,start,totalPages,pageNo){
  const W=1655,H=1170,c=document.createElement('canvas');c.width=W;c.height=H;
  const x=c.getContext('2d');
  const bg=await loadImg(attendanceBackground);
  x.drawImage(bg,0,0,W,H);

  const title=$('trainingName').value||'Szkolenie';
  const place=$('place').value||'';
  const date=$('date').value||'';
  const trainers=($('trainersList').value||'').split(/\r?\n/).filter(Boolean).join(', ');

  // Nagłówek został przesunięty poniżej obszaru logotypów.
  x.fillStyle='#172033';
  x.textAlign='center';
  x.textBaseline='alphabetic';
  x.font='700 27px Arial';
  x.fillText('LISTA OBECNOŚCI',W/2,188);
  x.font='600 24px Arial';
  const titleLines=wrapCanvasText(x,title,1120).slice(0,2);
  titleLines.forEach((line,i)=>x.fillText(line,W/2,228+i*30));

  // Dane szkolenia.
  x.textAlign='left';
  x.font='19px Arial';
  x.fillText(`Data: ${date}`,90,300);
  x.fillText(`Miejsce: ${place}`,590,300);
  if(trainers)x.fillText(`Prowadzący: ${trainers}`,90,330);
  x.textAlign='right';
  x.fillText(`Strona ${pageNo} z ${totalPages}`,W-90,330);

  // Tabela: szersza kolumna Lp., prawidłowe wyrównanie tekstu i 10 równych wierszy.
  const cols=[90,180,805,1160,W-90];
  const top=358,rowH=58,rowsPerPage=10;
  const headers=['Lp.','Imię i nazwisko','E-mail','Podpis'];
  x.lineWidth=1.35;
  x.strokeStyle='#596273';
  x.textAlign='left';
  x.textBaseline='middle';
  x.font='700 20px Arial';
  x.fillStyle='rgba(233,238,246,.96)';
  x.fillRect(cols[0],top,cols[4]-cols[0],rowH);
  x.fillStyle='#172033';
  for(let i=0;i<4;i++){
    x.strokeRect(cols[i],top,cols[i+1]-cols[i],rowH);
    if(i===0){
      x.textAlign='center';
      x.fillText(headers[i],(cols[i]+cols[i+1])/2,top+rowH/2);
      x.textAlign='left';
    }else{
      x.fillText(headers[i],cols[i]+14,top+rowH/2);
    }
  }

  const subset=people.slice(start,start+rowsPerPage);
  x.font='20px Arial';
  for(let r=0;r<rowsPerPage;r++){
    const y=top+rowH*(r+1);
    x.fillStyle=r%2?'rgba(255,255,255,.94)':'rgba(248,250,252,.94)';
    x.fillRect(cols[0],y,cols[4]-cols[0],rowH);
    x.fillStyle='#172033';
    for(let i=0;i<4;i++)x.strokeRect(cols[i],y,cols[i+1]-cols[i],rowH);
    const person=subset[r];
    if(person){
      x.textAlign='center';
      x.fillText(String(start+r+1),(cols[0]+cols[1])/2,y+rowH/2);
      x.textAlign='left';
      x.fillText(person,cols[1]+14,y+rowH/2);
    }
  }

  // Stopka pozostaje poza tabelą i poza dekoracjami tła.
  x.textBaseline='alphabetic';
  x.textAlign='left';
  x.font='18px Arial';
  x.fillText(`Liczba uczestników: ${people.length}`,90,1082);
  x.textAlign='right';
  x.fillText('Podpis prowadzącego: ........................................................',W-90,1082);
  return c
}
async function generateAttendance(){const people=getPeople().slice().sort((a,b)=>a.localeCompare(b,'pl'));if(!people.length)return alert('Wpisz co najmniej jedną osobę.');try{setBatchStatus('Generowanie listy obecności…');const pages=[],count=Math.ceil(people.length/10);for(let p=0;p<count;p++){const c=await attendanceCanvas(people,p*10,count,p+1);pages.push({url:c.toDataURL('image/jpeg',.94),w:c.width,h:c.height});setBatchStatus(`Lista obecności: strona ${p+1} z ${count}…`)}downloadBlob(trainingAndDateFileName('lista_obecnosci','pdf'),buildJpegPdf(pages,841.89,595.28));setBatchStatus(`Lista obecności PDF gotowa (${count} ${count===1?'strona':'strony'}).`)}catch(e){console.error(e);alert('Nie udało się wygenerować listy obecności: '+e.message);setBatchStatus('Błąd generowania listy obecności.')}}
function csvEscape(v){return '"'+String(v??'').replace(/\r?\n/g,' ').replace(/"/g,'""')+'"'}
function buildCsvBlob(){
 const people=getPeople();
 const trainers=($('trainersList').value||'').split(/\r?\n/).filter(Boolean).join(' | ');
 const rows=[['Lp.','Nazwa szkolenia','Miejsce','Data','Uczestnik','Numer certyfikatu','Liczba godzin','Osoby prowadzące','Szablon']];
 people.forEach((p,i)=>rows.push([i+1,$('trainingName').value,$('place').value,$('date').value,p,buildCertNo(i),$('hours').value,trainers,$('templateSelect').selectedOptions[0].text]));
 const csv='\uFEFF'+rows.map(r=>r.map(csvEscape).join(';')).join('\r\n');
 return new Blob([csv],{type:'text/csv;charset=utf-8'});
}
function exportCsv(){const people=getPeople();if(!people.length)return alert('Wpisz co najmniej jedną osobę.');downloadBlob(trainingAndDateFileName('wykaz_certyfikatow','csv'),buildCsvBlob());setBatchStatus('Plik CSV gotowy.')}
async function buildAttendancePdfBlob(people){
 const sorted=people.slice().sort((a,b)=>a.localeCompare(b,'pl'));
 const pages=[],count=Math.ceil(sorted.length/10);
 for(let p=0;p<count;p++){
  const c=await attendanceCanvas(sorted,p*10,count,p+1);
  pages.push({url:c.toDataURL('image/jpeg',.94),w:c.width,h:c.height});
  setBatchStatus(`Paczka: lista obecności ${p+1} z ${count}…`);
 }
 return buildJpegPdf(pages,841.89,595.28);
}
async function buildCombinedPdfBlob(people){
 const pages=[];
 for(let i=0;i<people.length;i++){
  pages.push(...await personJpegs(i));
  setBatchStatus(`Paczka: certyfikat zbiorczy ${i+1} z ${people.length}…`);
 }
 return buildJpegPdf(pages);
}
async function prepareTrainingPackage(){
 const people=getPeople();
 if(!people.length)return alert('Wpisz co najmniej jedną osobę.');
 if(typeof JSZip==='undefined')return alert('Nie udało się uruchomić modułu ZIP. Otwórz generator ponownie po pełnym rozpakowaniu paczki.');
 try{
  const zip=new JSZip();
  const training=cleanFileName($('trainingName').value||'szkolenie');
  const date=currentDateLabel();
  const place=cleanFileName($('place').value||'miejsce');
  const root=zip.folder(`${training}_${place}_${date}`);

  const attendanceFolder=root.folder('01_Lista_obecnosci');
  const csvFolder=root.folder('02_Wykaz_CSV');
  const combinedFolder=root.folder('03_Certyfikaty_zbiorcze');
  const separateFolder=root.folder('04_Certyfikaty_osobne');
  const projectFolder=root.folder('05_Projekt');

  setBatchStatus('Paczka: przygotowywanie listy obecności…');
  attendanceFolder.file(trainingAndDateFileName('lista_obecnosci','pdf'),await buildAttendancePdfBlob(people));

  setBatchStatus('Paczka: przygotowywanie pliku CSV…');
  csvFolder.file(trainingAndDateFileName('wykaz_certyfikatow','csv'),buildCsvBlob());

  setBatchStatus('Paczka: przygotowywanie certyfikatów zbiorczych…');
  combinedFolder.file(`${place}_${date}.pdf`,await buildCombinedPdfBlob(people));

  for(let i=0;i<people.length;i++){
   setBatchStatus(`Paczka: certyfikat osobny ${i+1} z ${people.length}…`);
   const pages=await personJpegs(i);
   separateFolder.file(personPdfFileName(people[i]),buildJpegPdf(pages));
  }

  projectFolder.file(trainingAndDateFileName('projekt_certyfikatu','json'),new Blob([JSON.stringify(projectData(),null,2)],{type:'application/json'}));
  projectFolder.file('INFORMACJE.txt',new Blob([
   `Nazwa szkolenia: ${$('trainingName').value}\r\n`,
   `Miejsce: ${$('place').value}\r\n`,
   `Data: ${$('date').value}\r\n`,
   `Liczba godzin: ${$('hours').value}\r\n`,
   `Liczba uczestników: ${people.length}\r\n`,
   `Szablon: ${$('templateSelect').selectedOptions[0].text}\r\n`
  ],{type:'text/plain;charset=utf-8'}));

  setBatchStatus('Paczka: kompresowanie plików ZIP…');
  const blob=await zip.generateAsync({type:'blob',compression:'DEFLATE',compressionOptions:{level:6}},m=>setBatchStatus(`Paczka: kompresowanie ${Math.round(m.percent)}%…`));
  downloadBlob(`dokumentacja_szkolenia_${training}_${place}_${date}.zip`,blob);
  setBatchStatus(`Paczka gotowa: lista obecności, CSV, PDF zbiorczy, ${people.length} certyfikatów osobnych i projekt JSON.`);
 }catch(e){console.error(e);alert('Nie udało się przygotować paczki szkolenia: '+e.message);setBatchStatus('Błąd przygotowywania paczki.')}
}
$('pdfCombined').addEventListener('click',generateCombined);$('pdfSeparate').addEventListener('click',generateSeparate);$('attendancePdf').addEventListener('click',generateAttendance);$('csvExport').addEventListener('click',exportCsv);$('trainingPackage').addEventListener('click',prepareTrainingPackage);
setBackground();
