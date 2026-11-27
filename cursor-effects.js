(() => {
  'use strict';
  const mode = document.currentScript.dataset.effect;
  const canvas = document.createElement('canvas');
  canvas.className = 'cursor-trail-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.append(canvas);
  const ctx = canvas.getContext('2d');
  const toggle = document.querySelector('#trail-toggle');
  const status = document.querySelector('#trail-status');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(any-pointer: fine)');
  let enabled = true, particles = [], frame = 0, last = null;
  let width = innerWidth, height = innerHeight;
  const duration = { ripple: 1000, contour: 1350, bloom: 1250 }[mode];
  const spacing = { ripple: 34, contour: 60, bloom: 36 }[mode];
  const interval = { ripple: 85, contour: 125, bloom: 90 }[mode];
  const limit = { ripple: 22, contour: 16, bloom: 28 }[mode];
  const active = () => enabled && !reduced.matches && fine.matches && !document.hidden;
  function clear() {
    cancelAnimationFrame(frame); frame = 0; particles = []; last = null;
    ctx.clearRect(0, 0, width, height);
  }
  function updateStatus() {
    if (!active()) clear();
    toggle.setAttribute('aria-pressed', String(enabled));
    toggle.textContent = enabled ? '关闭动效' : '开启动效';
    status.textContent = reduced.matches ? '已遵循系统减少动态效果设置' : !fine.matches ? '使用鼠标移动体验' : enabled ? '移动鼠标，观察留下的轨迹' : '动效已关闭';
  }
  function resize() {
    width = innerWidth; height = innerHeight;
    const ratio = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
    canvas.style.width = width + 'px'; canvas.style.height = height + 'px';
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    clear();
  }
  function ring(p, t) {
    const ease = 1 - (1-t) ** 3;
    const radius = 5 + ease * 36;
    ctx.lineWidth = 1.05;
    ctx.globalAlpha = .46 * (1-t) ** 1.5;
    ctx.beginPath();ctx.arc(0,0,radius,0,Math.PI*2);ctx.stroke();
    ctx.globalAlpha *= .55;
    ctx.beginPath();ctx.arc(0,0,radius*.65,0,Math.PI*2);ctx.stroke();
  }
  function contour(p, t) {
    const grow = .35 + .65 * (1 - (1-t) ** 3);
    ctx.rotate(p.angle);
    ctx.lineWidth = .85;
    for (let band=0; band<4; band++) {
      ctx.globalAlpha = (.34 - band*.035) * (1-t) ** 1.25;
      ctx.beginPath();
      for (let i=0; i<=64; i++) {
        const angle=i/64*Math.PI*2;
        const irregular=1+.12*Math.sin(angle*3+p.seed)+.08*Math.cos(angle*5-p.seed);
        const radius=(12+band*9)*grow*irregular;
        const x=Math.cos(angle)*radius*1.2, y=Math.sin(angle)*radius*.82;
        if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
      }
      ctx.closePath();ctx.stroke();
    }
    ctx.globalAlpha=.3*(1-t);ctx.fillRect(-1,-1,2,2);
  }
  function bloom(p, t) {
    const grow = Math.min(1, t/.2);
    ctx.translate(0,-t*9);ctx.rotate(p.angle+t*.35);
    ctx.scale(.35+.65*(1-(1-grow)**3),.35+.65*(1-(1-grow)**3));
    for (let petal=0;petal<5;petal++) {
      ctx.save();ctx.rotate(petal*Math.PI*2/5);
      ctx.beginPath();ctx.ellipse(0,-8,4.2,7.7,0,0,Math.PI*2);
      ctx.globalAlpha=.10*(1-t);ctx.fill();
      ctx.globalAlpha=.5*(1-t)**1.4;ctx.lineWidth=.9;ctx.stroke();ctx.restore();
    }
    ctx.globalAlpha=.55*(1-t);ctx.beginPath();ctx.arc(0,0,1.8,0,Math.PI*2);ctx.fill();
  }
  function draw(now) {
    frame=0;ctx.clearRect(0,0,width,height);
    particles=particles.filter(p=>now-p.time<duration);
    for (const p of particles) {
      ctx.save();ctx.translate(p.x-scrollX,p.y-scrollY);
      ctx.strokeStyle='#002fa7';ctx.fillStyle='#002fa7';
      const t=Math.max(0,Math.min(1,(now-p.time)/duration));
      if(mode==='ripple')ring(p,t);else if(mode==='contour')contour(p,t);else bloom(p,t);
      ctx.restore();
    }
    if(particles.length && active())frame=requestAnimationFrame(draw);
  }
  addEventListener('pointermove', e => {
    if (e.pointerType!=='mouse' || !active()) return;
    // Decorations never cover the comparison controls or an open contact dialog.
    if (e.target.closest('.trail-preview-tools, dialog')) { last=null;return; }
    const now=performance.now(), x=e.clientX+scrollX, y=e.clientY+scrollY;
    if(last && (now-last.time<interval || Math.hypot(x-last.x,y-last.y)<spacing))return;
    particles.push({x,y,time:now,seed:Math.random()*Math.PI*2,angle:Math.random()*Math.PI});
    if(particles.length>limit)particles.splice(0,particles.length-limit);
    last={x,y,time:now};
    if(!frame)frame=requestAnimationFrame(draw);
  }, {passive:true});
  document.documentElement.addEventListener('pointerleave',()=>{last=null});
  document.addEventListener('visibilitychange',updateStatus);
  addEventListener('resize',resize,{passive:true});
  reduced.addEventListener('change',updateStatus);fine.addEventListener('change',updateStatus);
  toggle.addEventListener('click',()=>{enabled=!enabled;updateStatus()});
  addEventListener('pagehide',clear);
  resize();updateStatus();
})();
