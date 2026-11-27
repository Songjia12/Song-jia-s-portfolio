const sections=[['home','主界面','Profile'],['education','教育背景','Education'],['projects','项目经历','Projects'],['internship','实习经历','Internship'],['resources','个人资料','Resources']];
document.querySelectorAll('.section-nav').forEach(n=>{n.innerHTML=sections.map(([id,cn,en])=>`<a href="#${id}" ${n.dataset.current===id?'aria-current="location"':''}><i></i><span>${cn}</span><small>${en}</small></a>`).join('')});
document.querySelectorAll('.edu-card').forEach(b=>b.onclick=()=>{const on=b.classList.toggle('flipped');b.setAttribute('aria-expanded',on);document.querySelectorAll('.edu-card').forEach(c=>c.classList.toggle('dimmed',c!==b));});
const deck=document.querySelector('#project-deck');let selected=0;
projects.forEach((p,i)=>{const card=document.createElement('article');card.className='project-card'+(i===0?' active':'');card.innerHTML=`<div class="project-body"><p class="eyebrow">PROJECT / 0${i+1}</p><h3>${p.title}</h3><div class="project-text"></div>${p.url?`<a class="text-link" href="${p.url}" target="_blank" rel="noopener">查看开源作品 ↗</a>`:''}${i===5?'<a class="text-link" href="https://songjia12.github.io/resume/" target="_blank" rel="noopener">在线使用 ↗</a>':''}</div><button class="project-tab" aria-expanded="${i===0}" aria-label="展开${p.title}"><span>0${i+1}</span><strong>${p.short}</strong><span>↗</span></button>`;let chunks=(p.html||p.text).split('⚫');card.querySelector('.project-text').innerHTML=chunks.map((x,j)=>`<p>${j?'• ':''}${x.trim()}</p>`).join('');card.querySelector('button').onclick=()=>{selected=i;deck.querySelectorAll('.project-card').forEach((c,j)=>{c.classList.toggle('active',j===i);c.querySelector('button').setAttribute('aria-expanded',j===i)})};deck.append(card)});

const contactDialog=document.querySelector('#contact-dialog');
const contactValue=document.querySelector('#contact-value');
const copyStatus=document.querySelector('#copy-status');
document.querySelectorAll('[data-contact]').forEach(button=>button.addEventListener('click',()=>{
 const phone=button.dataset.contact==='phone';
 document.querySelector('#contact-title').textContent=phone?'联系电话':'电子邮箱';
 document.querySelector('#contact-label').textContent=phone?'电话':'邮箱';
 contactValue.value=phone?'13797862809':'13797862809@163.com';
 copyStatus.textContent='';contactDialog.showModal();
}));
document.querySelector('#contact-close').onclick=()=>contactDialog.close();
contactDialog.addEventListener('click',e=>{if(e.target===contactDialog){const r=contactDialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)contactDialog.close()}});
document.querySelector('#contact-copy').onclick=async()=>{
 try{await navigator.clipboard.writeText(contactValue.value);copyStatus.textContent='已复制';}
 catch{contactValue.focus();contactValue.select();let copied=false;try{copied=document.execCommand('copy')}catch{}copyStatus.textContent=copied?'已复制':'请按 Ctrl+C 或长按选中文本复制';}
};
