

const mainSection = document.getElementById('main-section');

// ===== wyszukiwarka =====
const searchInput = document.createElement('input');
searchInput.type = 'text';
searchInput.placeholder = 'Szukaj zadania...(min. 2 znaki)';
searchInput.style.padding = '10px';
searchInput.style.marginBottom = '15px';
searchInput.style.width = '220px';
mainSection.appendChild(searchInput);

// ===== lista zadań =====
const output = document.createElement('div');
output.style.marginTop = '20px';
output.style.padding = '10px';
output.style.backgroundColor = '#e0ffe0';
output.id = 'output';
mainSection.appendChild(output);

// ===== formularz (pod listą) =====
const input = document.createElement('input');
input.type = 'text';
input.placeholder = 'Wpisz zadanie (3–100 znaków)';
input.style.padding = '10px';
input.style.marginRight = '10px';
input.style.width = '280px';

const dateInput = document.createElement('input');
dateInput.type = 'date';
dateInput.style.padding = '10px';
dateInput.style.marginRight = '10px';

const today = new Date().toISOString().split('T')[0];
dateInput.value = today;
dateInput.min = today;

const button = document.createElement('button');
button.textContent = 'Dodaj zadanie';
button.style.padding = '10px 15px';

mainSection.appendChild(input);
mainSection.appendChild(dateInput);
mainSection.appendChild(button);

// ===== localStorage =====
function saveTasks() {
  const tasks = [];
  const items = document.querySelectorAll('#output > .task-row');

  items.forEach(item => {
    const textSpan = item.querySelector('.text');
    const dateSpan = item.querySelector('.task-date');
    const checkbox = item.querySelector('input[type="checkbox"]');

    tasks.push({
      text: textSpan.dataset.original,
      date: dateSpan.textContent,
      done: checkbox.checked
    });
  });

  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function loadTasks() {
  const saved = JSON.parse(localStorage.getItem('tasks')) || [];
  saved.forEach(t => addTask(t.text, t.date, t.done));
}

// ===== highlight =====
function highlight(text, query) {
  if (!query) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

// ===== dodawanie zadania =====
function addTask(text, date, done = false) {
  const row = document.createElement('div');
  row.className = 'task-row';
  row.style.display = 'flex';
  row.style.alignItems = 'center';
  row.style.gap = '12px';
  row.style.width = '700px';
  row.style.padding = '6px 4px';

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = !!done;

  const textSpan = document.createElement('span');
  textSpan.className = 'text';
  textSpan.dataset.original = text;
  textSpan.textContent = text;
  textSpan.style.cursor = 'pointer';
  textSpan.style.flex = '1';
  textSpan.style.wordBreak = 'break-word';

  const dateSpan = document.createElement('span');
  dateSpan.className = 'task-date';
  dateSpan.textContent = date;
  dateSpan.style.width = '110px';
  dateSpan.style.textAlign = 'center';
  dateSpan.style.cursor = 'pointer';

  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = 'Usuń';
  deleteBtn.style.width = '60px';
  deleteBtn.addEventListener('click', () => {
    row.remove();
    saveTasks();
  });

  if (checkbox.checked) {
    textSpan.style.textDecoration = 'line-through';
    textSpan.style.opacity = '0.6';
  }

  checkbox.addEventListener('change', () => {
    textSpan.style.textDecoration = checkbox.checked ? 'line-through' : 'none';
    textSpan.style.opacity = checkbox.checked ? '0.6' : '1';
    saveTasks();
  });

  row.appendChild(checkbox);
  row.appendChild(textSpan);
  row.appendChild(dateSpan);
  row.appendChild(deleteBtn);

  output.appendChild(row);
  saveTasks();
}

// ===== delegacja dla trybu edycji =====
output.addEventListener('click', (e) => {
  const textTarget = e.target.closest('.text');
  const dateTarget = e.target.closest('.task-date');

  if (!textTarget && !dateTarget) return;

  const row = (textTarget || dateTarget).closest('.task-row');
  if (!row) return;

  startInlineEdit(row);
});

// ===== inline edit =====
function startInlineEdit(row) {
  if (row.dataset.editing === 'true') return;
  row.dataset.editing = 'true';

  const textSpan = row.querySelector('.text');
  const dateSpan = row.querySelector('.task-date');

  const origText = textSpan.dataset.original;
  const origDate = dateSpan.textContent;

  const textInput = document.createElement('input');
  textInput.type = 'text';
  textInput.value = origText;
  textInput.style.flex = '1';
  textInput.style.padding = '4px';

  const dateInputInline = document.createElement('input');
  dateInputInline.type = 'date';
  dateInputInline.value = origDate;
  dateInputInline.min = today;
  dateInputInline.style.width = '110px';
  dateInputInline.style.padding = '4px';

  row.replaceChild(textInput, textSpan);
  row.replaceChild(dateInputInline, dateSpan);

  setTimeout(() => textInput.focus(), 0);

  let finished = false;
  function finishEdit(save) {
    if (finished) return;
    finished = true;
    row.dataset.editing = 'false';

    const newText = textInput.value.trim();
    const newDate = dateInputInline.value;

    const newTextSpan = document.createElement('span');
    const newDateSpan = document.createElement('span');

    newTextSpan.className = 'text';
    newDateSpan.className = 'task-date';

    if (save && newText.length >= 3 && newText.length <= 100) {
      newTextSpan.dataset.original = newText;
      newTextSpan.textContent = newText;
      newDateSpan.textContent = newDate || origDate;
    } else {
      newTextSpan.dataset.original = origText;
      newTextSpan.textContent = origText;
      newDateSpan.textContent = origDate;
    }

    newTextSpan.style.cursor = 'pointer';
    newTextSpan.style.flex = '1';
    newTextSpan.style.wordBreak = 'break-word';

    newDateSpan.style.width = '110px';
    newDateSpan.style.textAlign = 'center';
    newDateSpan.style.cursor = 'pointer';

    row.replaceChild(newTextSpan, textInput);
    row.replaceChild(newDateSpan, dateInputInline);

    searchInput.dispatchEvent(new Event('input'));
    saveTasks();

    document.removeEventListener('click', outsideHandler, true);
    document.removeEventListener('keydown', keyHandler, true);
  }

  function outsideHandler(e) {
    if (!row.contains(e.target)) {
      finishEdit(true);
    }
  }

  function keyHandler(e) {
    if (e.key === 'Enter') finishEdit(true);
    if (e.key === 'Escape') finishEdit(false);
  }

  document.addEventListener('click', outsideHandler, true);
  document.addEventListener('keydown', keyHandler, true);
}

// ===== dodawanie zadania =====
button.addEventListener('click', () => {
  const text = input.value.trim();
  const date = dateInput.value;

  if (text.length < 3 || text.length > 100) {
    alert('Tekst musi mieć od 3 do 100 znaków.');
    return;
  }

  addTask(text, date);

  input.value = '';
  dateInput.value = today;
});

// ===== wyszukiwarka (min 2 znaki) =====
searchInput.addEventListener('input', () => {
  const query = searchInput.value.trim().toLowerCase();
  const rows = document.querySelectorAll('#output > .task-row');

  // 0-1 znak → pokaż wszystko bez highlightów
  if (query.length < 2) {
    rows.forEach(row => {
      const span = row.querySelector('.text');
      span.innerHTML = span.dataset.original;
      row.style.display = 'flex';
    });
    return;
  }

  rows.forEach(row => {
    const span = row.querySelector('.text');
    const orig = span.dataset.original;

    if (orig.toLowerCase().includes(query)) {
      row.style.display = 'flex';
      span.innerHTML = highlight(orig, query);
    } else {
      row.style.display = 'none';
    }
  });
});

// ===== start =====
loadTasks();
