/* Frontend for GitHub Pages. Set API_BASE to your Railway domain after deploy. */
const API_BASE = 'https://your-service.up.railway.app';

const tg = window.Telegram && window.Telegram.WebApp;
const app = document.getElementById('app');

let state = { courses: [], currentCourse: null, currentLesson: null };

async function registerUser(){
  if(!tg) return;
  const u = (tg.initDataUnsafe||{}).user||{};
  try{
    await fetch(`${API_BASE}/register`,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        telegram_id:u.id, first_name:u.first_name, last_name:u.last_name,
        username:u.username, photo_url:u.photo_url, language_code:u.language_code
      })
    });
  }catch(e){ console.warn('Registration failed',e); }
}

async function loadCourses(){
  const r = await fetch(`${API_BASE}/courses`);
  state.courses = await r.json();
  renderCourseList();
}

async function openCourse(id){
  const r = await fetch(`${API_BASE}/courses/${id}`);
  state.currentCourse = await r.json();
  state.currentLesson = null;
  renderCourseDetail();
}

async function openLesson(cid,lid){
  const r = await fetch(`${API_BASE}/lessons/${cid}/${lid}`);
  state.currentLesson = await r.json();
  renderLesson();
}

function renderCourseList(){
  app.innerHTML='';
  const h=document.createElement('h1'); h.textContent='Курсы по технике безопасности'; app.appendChild(h);
  const list=document.createElement('ul'); list.className='course-list';
  state.courses.forEach(c=>{ const li=document.createElement('li'); li.className='course-item'; li.textContent=c.title; li.onclick=()=>openCourse(c.id); list.appendChild(li); });
  app.appendChild(list);
}

function renderCourseDetail(){
  const c=state.currentCourse; if(!c) return; app.innerHTML='';
  const back=document.createElement('a'); back.href='#'; back.className='back-button'; back.textContent='Назад';
  back.onclick=e=>{e.preventDefault(); state.currentCourse=null; loadCourses();}; app.appendChild(back);
  const h=document.createElement('h1'); h.textContent=c.title; app.appendChild(h);
  const p=document.createElement('p'); p.textContent=c.description; app.appendChild(p);
  const list=document.createElement('ul'); list.className='lesson-list';
  c.lessons.forEach(l=>{ const li=document.createElement('li'); li.className='lesson-item'; li.textContent=l.title; li.onclick=()=>openLesson(c.id,l.id); list.appendChild(li); });
  app.appendChild(list);
}

function renderLesson(){
  const l=state.currentLesson, c=state.currentCourse; if(!l||!c) return; app.innerHTML='';
  const back=document.createElement('a'); back.href='#'; back.className='back-button'; back.textContent='Назад';
  back.onclick=e=>{e.preventDefault(); state.currentLesson=null; renderCourseDetail();}; app.appendChild(back);
  const h=document.createElement('h1'); h.textContent=l.title; app.appendChild(h);
  const div=document.createElement('div'); div.className='lesson-content';
  if(l.lesson_type==='text'){ div.textContent=l.content.text; } else { div.textContent='Этот тип урока пока не поддерживается.'; }
  app.appendChild(div);
}

async function init(){
  if(tg){
    document.body.style.backgroundColor=tg.themeParams.bg_color||document.body.style.backgroundColor;
    document.body.style.color=tg.themeParams.text_color||document.body.style.color;
    tg.ready(); registerUser();
  }
  loadCourses();
}
init();
