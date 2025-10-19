const ADMIN_PASS = "#371a46";
const LS_KEY = "lod_lod_v3";
document.getElementById('year').textContent = new Date().getFullYear();

let adminMode = false;
let DATA = { news: [], scripts: [], executores: [], forms: [ {id: 'f_staff', name: 'Formulário Staff', link: 'https://forms.gle/vhf3V7RcqZE3nawA7', ts: new Date().toISOString()} ] };

function uid(p='id'){ return p + '_' + Math.random().toString(36).slice(2,9); }
function nowTS(){ return new Date().toISOString(); }
function save(){ try{ localStorage.setItem(LS_KEY, JSON.stringify(DATA)); }catch(e){ console.error(e); } }
function load(){ try{ const s = localStorage.getItem(LS_KEY); if(s){ DATA = Object.assign(DATA, JSON.parse(s)); } }catch(e){console.error(e);} }

// ===== render functions =====
function renderAll(){ renderNews(); renderThreads('scripts','threads-scripts'); renderThreads('executores','threads-executores'); renderForms(); }

function renderNews(){
  const box = document.getElementById('news-messages');
  box.innerHTML = '';
  DATA.news.slice().forEach(msg=>{
    const el = document.createElement('div'); el.className='msg';
    const bubble = document.createElement('div'); bubble.className='bubble';
    const txt = document.createElement('div'); txt.textContent = msg.text;
    if(adminMode){ txt.setAttribute('contenteditable','true'); txt.addEventListener('blur', ()=> { msg.text = txt.textContent.trim(); save(); renderNews(); }); }
    bubble.appendChild(txt);
    const meta = document.createElement('div'); meta.className='meta'; meta.textContent = new Date(msg.ts).toLocaleString();
    const right = document.createElement('div'); right.style.display='flex'; right.style.flexDirection='column'; right.style.alignItems='flex-end';
    if(adminMode){
      const del = document.createElement('button'); del.textContent='Excluir'; del.className='ghost'; del.style.marginTop='6px';
      del.addEventListener('click', ()=> { if(confirm('Excluir mensagem?')){ DATA.news = DATA.news.filter(n=>n.id!==msg.id); save(); renderNews(); }}); right.appendChild(del);
    }
    el.appendChild(bubble); el.appendChild(right); el.appendChild(meta);
    box.appendChild(el);
  });
  box.scrollTop = box.scrollHeight;
}

function renderThreads(key, containerId){
  const box = document.getElementById(containerId); box.innerHTML='';
  DATA[key].slice().reverse().forEach(thread=>{
    const t = document.createElement('div'); t.className='thread';
    const title = document.createElement('div'); title.className='title'; title.textContent=thread.title;
    if(adminMode){ title.setAttribute('contenteditable','true'); title.addEventListener('blur', ()=> { thread.title=title.textContent.trim(); save(); renderThreads(key,containerId); }); }
    const body = document.createElement('div'); body.textContent=thread.body; body.style.color='var(--muted)';
    if(adminMode){ body.setAttribute('contenteditable','true'); body.addEventListener('blur', ()=> { thread.body=body.textContent.trim(); save(); renderThreads(key,containerId); }); }
    const meta = document.createElement('div'); meta.className='meta'; meta.textContent=`Criado: ${new Date(thread.ts).toLocaleString()}`;
    const actions = document.createElement('div'); actions.className='actions';
    const open = document.createElement('button'); open.className='ghost'; open.textContent='Abrir';
    open.addEventListener('click', ()=> openThreadModal(key, thread.id)); actions.appendChild(open);
    if(adminMode){
      const del = document.createElement('button'); del.className='ghost'; del.textContent='Excluir'; del.style.background='#ff5c5c';
      del.addEventListener('click', ()=> { if(confirm('Excluir tópico?')){ DATA[key] = DATA[key].filter(t0=>t0.id!==thread.id); save(); renderThreads(key,containerId); }}); actions.appendChild(del);
    }
    t.appendChild(title); t.appendChild(body); t.appendChild(meta); t.appendChild(actions);
    box.appendChild(t);
  });
}

function renderForms(){
  const box = document.getElementById('forms-list'); box.innerHTML='';
  DATA.forms.forEach(f=>{
    const w = document.createElement('div'); w.className='form-item';
    const left = document.createElement('div'); left.textContent=f.name;
    if(adminMode){ left.setAttribute('contenteditable','true'); left.addEventListener('blur', ()=> { f.name=left.textContent.trim(); save(); renderForms(); }); }
    const right = document.createElement('div'); right.style.display='flex'; right.style.gap='8px';
    const a = document.createElement('a'); a.href=f.link; a.target='_blank'; a.className='btn small'; a.textContent='Abrir'; right.appendChild(a);
    if(adminMode){
      const edit = document.createElement('button'); edit.className='ghost'; edit.textContent='Editar Link';
      edit.addEventListener('click', ()=> { const nu=prompt('Cole o link do formulário:',f.link||''); if(nu){ f.link=nu.trim(); save(); renderForms(); } });
      const del = document.createElement('button'); del.className='ghost'; del.textContent='Excluir'; del.style.background='#ff5c5c';
      del.addEventListener('click', ()=> { if(confirm('Excluir formulário?')){ DATA.forms=DATA.forms.filter(x=>x.id!==f.id); save(); renderForms(); } });
      right.appendChild(edit); right.appendChild(del);
    }
    w.appendChild(left); w.appendChild(right); box.appendChild(w);
  });
}

// ===== modal =====
function openThreadModal(key, threadId){
  const thread = DATA[key].find(t=>t.id===threadId); if(!thread) return alert('Tópico não encontrado');
  const root = document.getElementById('modal-root'); root.innerHTML=''; root.style.display='flex'; root.style.alignItems='center'; root.style.justifyContent='center';
  const box = document.createElement('div'); box.style.width='90%'; box.style.maxWidth='800px'; box.className='card';
  const h = document.createElement('h3'); h.textContent=thread.title;
  const body = document.createElement('div'); body.textContent=thread.body; body.style.color='var(--muted)';
  const repliesWrap = document.createElement('div'); repliesWrap.style.marginTop='12px';
  const repliesTitle = document.createElement('div'); repliesTitle.textContent='Respostas:'; repliesWrap.appendChild(repliesTitle);
  (thread.replies||[]).forEach(r=>{
    const rp=document.createElement('div'); rp.className='reply';
    const txt=document.createElement('div'); txt.textContent=r.text;
    if(adminMode){ txt.setAttribute('contenteditable','true'); txt.addEventListener('blur',()=>{ r.text=txt.textContent.trim(); save(); }); }
    rp.appendChild(txt);
    if(adminMode){
      const del=document.createElement('button'); del.className='ghost'; del.textContent='Excluir'; del.style.background='#ff5c5c';
      del.addEventListener('click',()=>{ if(confirm('Excluir resposta?')){ thread.replies=thread.replies.filter(rr=>rr.id!==r.id); save(); openThreadModal(key,threadId); } });
      rp.appendChild(del);
    }
    repliesWrap.appendChild(rp);
  });
  const replyBox=document.createElement('div'); replyBox.style.marginTop='12px';
  const ta=document.createElement('textarea'); ta.placeholder='Responder (somente admin)'; ta.style.width='100%'; ta.style.height='80px';
  const send=document.createElement('button'); send.className='btn small'; send.textContent='Enviar resposta'; send.style.marginTop='8px';
  send.addEventListener('click',()=>{ if(!adminMode) return alert('Apenas admin pode responder.'); const v=ta.value.trim(); if(!v) return alert('Digite a resposta.'); thread.replies=thread.replies||[]; thread.replies.push({id:uid('r'), text:v, ts:nowTS()}); save(); openThreadModal(key,threadId); });
  if(adminMode){ replyBox.appendChild(ta); replyBox.appendChild(send); }
  const close=document.createElement('button'); close.className='ghost'; close.textContent='Fechar'; close.style.marginTop='10px';
  close.addEventListener('click',()=>{ root.style.display='none'; root.innerHTML=''; renderThreads(key,key==='scripts'?'threads-scripts':'threads-executores'); });
  box.appendChild(h); box.appendChild(body); box.appendChild(repliesWrap); box.appendChild(replyBox); box.appendChild(close);
  root.appendChild(box);
}

// ===== event listeners =====
document.querySelectorAll('.nav button').forEach(btn=>{
  btn.addEventListener('click',()=>{ document.querySelectorAll('.nav button').forEach(b=>b.classList.remove('active')); btn.classList.add('active'); document.querySelectorAll('.page').forEach(p=>p.classList.remove('active')); document.getElementById('page-'+btn.dataset.page).classList.add('active'); });
});

document.getElementById('btn-login').addEventListener('click',()=>{
  const pw = prompt('Digite a senha de Admin:');
  if(pw===ADMIN_PASS){ adminMode=true; alert('Login bem-sucedido!'); document.getElementById('status').textContent='Admin'; document.getElementById('btn-send').disabled=false; document.getElementById('btn-new-thread-scripts').disabled=false; document.getElementById('btn-new-thread-execs').disabled=false; document.getElementById('btn-add-form').classList.remove('hidden'); document.getElementById('btn-import').classList.remove('hidden'); document.getElementById('btn-export').classList.remove('hidden'); document.getElementById('admin-panel').classList.remove('hidden'); document.getElementById('admin-panel-guest').classList.add('hidden'); renderAll(); }
  else alert('Senha incorreta.');
});

document.getElementById('btn-logout').addEventListener('click',()=>{ adminMode=false; alert('Você saiu do modo Admin'); document.getElementById('status').textContent='Visitante'; document.getElementById('btn-send').disabled=true; document.getElementById('btn-new-thread-scripts').disabled=true; document.getElementById('btn-new-thread-execs').disabled=true; document.getElementById('btn-add-form').classList.add('hidden'); document.getElementById('btn-import').classList.add('hidden'); document.getElementById('btn-export').classList.add('hidden'); document.getElementById('admin-panel').classList.add('hidden'); document.getElementById('admin-panel-guest').classList.remove('hidden'); renderAll(); });

document.getElementById('btn-send').addEventListener('click',()=>{ const v=document.getElementById('news-input').value.trim(); if(!v) return alert('Digite algo'); DATA.news.push({id:uid(), text:v, ts:nowTS()}); document.getElementById('news-input').value=''; save(); renderNews(); });

document.getElementById('btn-new-thread-scripts').addEventListener('click',()=>{ const t=prompt('Título do tópico'); if(!t) return; const b=prompt('Conteúdo do tópico'); if(!b) return; DATA.scripts.push({id:uid('t'), title:t, body:b, ts:nowTS(), replies:[]}); save(); renderThreads('scripts','threads-scripts'); });
document.getElementById('btn-new-thread-execs').addEventListener('click',()=>{ const t=prompt('Título do tópico'); if(!t) return; const b=prompt('Conteúdo do tópico'); if(!b) return; DATA.executores.push({id:uid('t'), title:t, body:b, ts:nowTS(), replies:[]}); save(); renderThreads('executores','threads-executores'); });

document.getElementById('btn-add-form').addEventListener('click',()=>{ const n=prompt('Nome do formulário'); if(!n) return; const l=prompt('Link do formulário'); if(!l) return; DATA.forms.push({id:uid('f'), name:n, link:l, ts:nowTS()}); save(); renderForms(); });

document.getElementById('btn-export').addEventListener('click',()=>{ const json = JSON.stringify(DATA,null,2); const blob = new Blob([json], {type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='backup_lod.json'; a.click(); });

document.getElementById('btn-import').addEventListener('click',()=>{ const inp=document.createElement('input'); inp.type='file'; inp.accept='application/json'; inp.onchange=e=>{ const file=e.target.files[0]; const reader=new FileReader(); reader.onload=ev=>{ try{ const j=JSON.parse(ev.target.result); DATA=j; save(); renderAll(); alert('Importação concluída'); }catch(ex){alert('Erro ao importar: '+ex)} }; reader.readAsText(file); }; inp.click(); });

document.getElementById('btn-clear-all').addEventListener('click',()=>{ if(confirm('Tem certeza que deseja limpar tudo?')){ DATA={news:[],scripts:[],executores:[],forms:[]}; save(); renderAll(); } });

// ===== init =====
load(); renderAll();
