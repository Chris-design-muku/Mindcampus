const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];

const toast = (msg) => {
  const el = $('#toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(window.__toast);
  window.__toast = setTimeout(() => el.classList.remove('show'), 2600);
};

function openModal(id){
  const modal = document.getElementById(id);
  if(!modal) return;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden','false');
  document.body.style.overflow='hidden';
}
function closeModal(modal){
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden','true');
  document.body.style.overflow='';
}
$$('[data-modal]').forEach(btn => btn.addEventListener('click', () => openModal(btn.dataset.modal)));
$$('.modal .close').forEach(btn => btn.addEventListener('click', () => closeModal(btn.closest('.modal'))));
$$('.modal-backdrop').forEach(bg => bg.addEventListener('click', () => closeModal(bg.closest('.modal'))));
document.addEventListener('keydown', e => { if(e.key === 'Escape') $$('.modal.open').forEach(closeModal); });

$('#menuToggle')?.addEventListener('click', () => $('#mainNav').classList.toggle('open'));
$$('#mainNav a').forEach(a => a.addEventListener('click', () => $('#mainNav').classList.remove('open')));

$$('.moods button').forEach(btn => btn.addEventListener('click', () => {
  $$('.moods button').forEach(b => b.style.transform='');
  btn.style.transform='translateY(-5px)';
  const mood = btn.dataset.mood;
  $('.card-progress span').style.width = mood === 'Great' ? '92%' : mood === 'Okay' ? '70%' : mood === 'Low' ? '48%' : '30%';
  toast(`Check-in saved: feeling ${mood}.`);
}));

const serviceText = {
  therapy: 'You can connect with professional support privately, including when campus life gets overwhelming.',
  psychologist: 'During exams and placement periods, visiting psychologists can provide an in-person option.',
  peer: 'Trained student ambassadors can help with early support, connection and directing students to the right pathway.',
  resources: 'Practical resources can help with stress, sleep, focus, routines and everyday resilience.'
};
$$('.service').forEach(btn => btn.addEventListener('click', () => {
  $$('.service').forEach(x => x.classList.remove('active'));
  btn.classList.add('active');
  toast(serviceText[btn.dataset.service]);
}));

$$('.modal-options button').forEach(btn => btn.addEventListener('click', () => {
  const action = btn.dataset.action;
  const message = $('#supportMessage');
  const messages = {
    book: 'Prototype action: counselling booking would open here. In a production app, this would connect to the booking system.',
    anonymous: 'Prototype action: anonymous support pathway selected. No personal information is collected in this demo.',
    resources: 'Prototype action: the wellness resource library would open here.'
  };
  message.textContent = messages[action];
  message.classList.add('show');
}));

$('#collegeForm')?.addEventListener('submit', e => {
  e.preventDefault();
  const data = new FormData(e.target);
  $('#collegeMessage').textContent = `Thanks, ${data.get('name')}. Your partnership enquiry has been captured in this prototype.`;
  $('#collegeMessage').classList.add('show');
  e.target.reset();
});

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if(entry.isIntersecting) entry.target.classList.add('visible');
  });
},{threshold:.12});
$$('.problem-card,.step,.service,.dashboard,.support-visual').forEach(el => {
  el.style.transition = 'opacity .7s ease, transform .7s ease';
  el.style.opacity = '0';
  el.style.transform = 'translateY(16px)';
  observer.observe(el);
});
document.addEventListener('scroll', () => {
  $$('.visible').forEach(el => { el.style.opacity='1'; el.style.transform='translateY(0)'; });
},{passive:true});
