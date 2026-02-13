
document.addEventListener('DOMContentLoaded', () => {
	let categories = ["", "", "", ""];
	let categoriesSolved = ["THINGS EMILY SAYS", "THINGS EMILY LOVES", "THINGS EMILY HAS LOOKED LIKE", "HOMOPHONES TO STARTS OF BABY NAMES EMILY LIKES"];
			

	// Wordle init if on wordle page
	if (document.getElementById('game')) {
		const ANSWER = 'PIZZA';
		const MAX_ROWS = 6;
		const WORD_LENGTH = 5;

		const gridEl = document.getElementById('grid');
		const keyboardEl = document.getElementById('keyboard');
		const messageEl = document.getElementById('message');
		const resetBtn = document.getElementById('reset');

		let currentRow = 0;
		let currentCol = 0;
		let isGameOver = false;

		const rows = [];

		function createGrid() {
			gridEl.innerHTML = '';
			for (let r = 0; r < MAX_ROWS; r++) {
				const row = document.createElement('div');
				row.className = 'row';
				const tiles = [];
				for (let c = 0; c < WORD_LENGTH; c++) {
					const t = document.createElement('div');
					t.className = 'tile';
					t.dataset.row = r;
					t.dataset.col = c;
					row.appendChild(t);
					tiles.push(t);
				}
				rows.push(tiles);
				gridEl.appendChild(row);
			}
		}

		function createKeyboard() {
			const layout = [
				'QWERTYUIOP',
				'ASDFGHJKL',
				'ZXCVBNM',
				''
			];
			keyboardEl.innerHTML = '';
			layout.forEach((rowStr, i) => {
				const row = document.createElement('div');
				row.className = 'keyrow';
				if (i === 1) row.style.paddingLeft = '22px';
				if (i === 3) {
					const enter = makeKey('Enter', true);
					enter.classList.add('small');
					row.appendChild(enter);
				}
				for (const ch of rowStr) {
					row.appendChild(makeKey(ch));
				}
				if (i === 3) {
					const del = makeKey('Backspace', true);
					del.classList.add('small');
					row.appendChild(del);
				}
				keyboardEl.appendChild(row);
			});
		}

		function makeKey(label, wide = false) {
			const k = document.createElement('button');
			k.className = 'key' + (wide ? ' small' : '');
			k.textContent = label.length === 1 ? label : label;
			k.dataset.key = label;
			k.addEventListener('click', () => handleKey(label));
			return k;
		}

		function handleKey(key) {
			if (isGameOver) return;
			if (key === 'Backspace') return deleteLetter();
			if (key === 'Enter') return submitGuess();
			if (key.length === 1 && /[a-zA-Z]/.test(key)) addLetter(key);
		}

		function addLetter(letter) {
			if (currentCol >= WORD_LENGTH) return;
			const tile = rows[currentRow][currentCol];
			tile.textContent = letter.toUpperCase();
			tile.dataset.letter = letter.toUpperCase();
			currentCol++;
		}

		function deleteLetter() {
			if (currentCol === 0) return;
			currentCol--;
			const tile = rows[currentRow][currentCol];
			tile.textContent = '';
			delete tile.dataset.letter;
		}

		function submitGuess() {
			if (currentCol !== WORD_LENGTH) {
				showMessage('Not enough letters');
				return;
			}
			const guess = rows[currentRow].map(t => (t.dataset.letter || '')).join('');
			if (guess.length !== WORD_LENGTH) return;

			evaluateGuess(guess);
		}

		function evaluateGuess(guess) {
			const guessArr = guess.split('');
			const answerArr = ANSWER.split('');
			const result = new Array(WORD_LENGTH).fill('absent');

			// counts for letters not matched by green
			const counts = {};
			for (let i = 0; i < WORD_LENGTH; i++) {
				if (guessArr[i] === answerArr[i]) {
					result[i] = 'correct';
				} else {
					counts[answerArr[i]] = (counts[answerArr[i]] || 0) + 1;
				}
			}

			for (let i = 0; i < WORD_LENGTH; i++) {
				if (result[i] === 'correct') continue;
				const g = guessArr[i];
				if (counts[g]) {
					result[i] = 'present';
					counts[g]--;
				} else {
					result[i] = 'absent';
				}
			}

			// apply classes and update keyboard
			for (let i = 0; i < WORD_LENGTH; i++) {
				const tile = rows[currentRow][i];
				tile.classList.add(result[i]);
				const k = keyboardEl.querySelector(`[data-key="${guessArr[i]}"]`);
				if (k) {
					// priority: correct > present > absent
					if (result[i] === 'correct') {
						k.classList.remove('present', 'absent');
						k.classList.add('correct');
					} else if (result[i] === 'present' && !k.classList.contains('correct')) {
						k.classList.remove('absent');
						k.classList.add('present');
					} else if (result[i] === 'absent' && !k.classList.contains('correct') && !k.classList.contains('present')) {
						k.classList.add('absent');
					}
				}
			}

			if (guess === ANSWER) {
				showMessage('WOOHOO! YOU GOT IT!', 5000);
				isGameOver = true;
				return;
			}

			currentRow++;
			currentCol = 0;
			if (currentRow >= MAX_ROWS) {
				showMessage(`Out of tries — the answer was ${ANSWER}`);
				isGameOver = true;
			}
		}

		function showMessage(text) {
			messageEl.textContent = text;
			setTimeout(() => {
				if (messageEl.textContent === text) messageEl.textContent = '';
			}, 3000);
		}

		// keyboard listener
		document.addEventListener('keydown', (e) => {
			if (isGameOver) return;
			if (e.key === 'Backspace') return deleteLetter();
			if (e.key === 'Enter') return submitGuess();
			if (/^[a-zA-Z]$/.test(e.key)) addLetter(e.key.toUpperCase());
		});

		resetBtn.addEventListener('click', () => {
			resetGame();
		});

		function resetGame() {
			// clear grid and keyboard states
			for (let r = 0; r < MAX_ROWS; r++) {
				for (let c = 0; c < WORD_LENGTH; c++) {
					const t = rows[r][c];
					t.textContent = '';
					t.className = 'tile';
					delete t.dataset.letter;
				}
			}
			const keys = keyboardEl.querySelectorAll('.key');
			keys.forEach(k => k.classList.remove('correct', 'present', 'absent'));
			currentRow = 0;
			currentCol = 0;
			isGameOver = false;
			messageEl.textContent = '';
		}

		// initial setup
		createGrid();
		createKeyboard();
	}

	// Connections init if on page2
	if (document.getElementById('connections')) {
		const connGrid = document.getElementById('connGrid');
		const connMsg = document.getElementById('connMessage');
		const connReset = document.getElementById('connReset');
		const connReveal = document.getElementById('connReveal');
		const connSubmit = document.getElementById('connSubmit');
		const connLegend = document.getElementById('connLegend');

		// example puzzle: 4 categories of 4 words
		const words = [
			'BOOBOOS','LITTLE','BABY','PANTS', // Things Emily SAYS
			'COFFEE','FRIENDS','JESUS','JOSH', // Things Emily LOVES
			'EGG','WIFE','SWIMSUIT MODEL','BOWLING BALL', // Things EMILY HAS LOOKED LIKE
			'SEA','BALE','EAST','COOP' // Baby Names - Sierra, Bailey, Easton, Cooper
		];
		// mapping index -> category id (0..3)
		const mapping = [0,0,0,0, 1,1,1,1, 2,2,2,2, 3,3,3,3];

		let order = [];
		let selected = [];
		const solved = new Set();

		function shuffleArray(a) {
			for (let i = a.length - 1; i > 0; i--) {
				const j = Math.floor(Math.random() * (i + 1));
				[a[i], a[j]] = [a[j], a[i]];
			}
		}

		function buildLegend() {
			connLegend.innerHTML = '';
			for (let i = 0; i < 4; i++) {
				const el = document.createElement('div');
				console.log(categories[i]);
				el.innerHTML = `<span class="dot cat-${i}"></span>` + ` ${categories[i]}`;
				el.className = 'legend-item';
				connLegend.appendChild(el);
			}
		}

		function renderGrid() {
			connGrid.innerHTML = '';
			order.forEach((idx) => {
				const cell = document.createElement('div');
				cell.className = 'conn-cell';
				cell.textContent = words[idx];
				cell.dataset.idx = idx;
				cell.addEventListener('click', () => onCellClick(cell, idx));
				connGrid.appendChild(cell);
			});
		}

		function startPuzzle() {
			order = words.map((_,i) => i);
			shuffleArray(order);
			selected = [];
			solved.clear();
			connMsg.textContent = '';
			renderGrid();
			buildLegend();
		}

		function onCellClick(cell, idx) {
			if (cell.classList.contains('solved')) return;
			const already = selected.indexOf(cell);
			if (already >= 0) {
				// deselect
				selected.splice(already, 1);
				cell.classList.remove('selected');
				return;
			}
			if (selected.length >= 4) {
				setTimeout(() => { if (connMsg.textContent) connMsg.textContent = ''; }, 1800);
				return;
			}
			selected.push(cell);
			cell.classList.add('selected');
		}

		function markSolved(catId, cells) {
			solved.add(catId);
			cells.forEach(c => {
				c.classList.remove('selected');
				c.classList.add('solved', `cat-${catId}`);
			});
		}

		function markWrong(cells) {
			cells.forEach(c => c.classList.add('wrong'));
			setTimeout(() => cells.forEach(c => c.classList.remove('wrong')), 700);
		}

		connSubmit.addEventListener('click', () => {
			if (selected.length !== 4) {
				setTimeout(() => { if (connMsg.textContent) connMsg.textContent = ''; }, 1800);
				return;
			}
			const idxs = selected.map(c => parseInt(c.dataset.idx, 10));
			const cats = idxs.map(i => mapping[i]);
			const first = cats[0];
			const allSame = cats.every(x => x === first);
			if (allSame && !solved.has(first)) {
				markSolved(first, selected.slice());
				selected = [];
				categories[first] = categoriesSolved[first]; // reveal category name
				buildLegend();
				setTimeout(() => { if (connMsg.textContent) connMsg.textContent = ''; }, 10000);
			} else {
				markWrong(selected);
				setTimeout(() => { if (connMsg.textContent) connMsg.textContent = ''; }, 2000);
				// keep selections so the user can manually change them
			}
		});

		connReset.addEventListener('click', startPuzzle);
		connReveal.addEventListener('click', () => {
			// reveal all groups
			for (let i = 0; i < order.length; i++) {
				const idx = order[i];
				const cell = connGrid.children[i];
				const cat = mapping[idx];
				cell.classList.add('solved', `cat-${cat}`);
			}
			solved.add(0); solved.add(1); solved.add(2); solved.add(3);
			connMsg.textContent = 'Answers revealed.';
		});

		startPuzzle();
	}


	// Minute Cryptic init if on page3
	if (document.getElementById('minute-cryptic')) {
		const puzzles = [
	 		{ clue: 'Look out! Half of everlasting is a long time in marriage! (7)', answer: 'FOREVER', hints: ['This clues fodder is "look out!" and "everlasting". What do you say when you want someone to look out?', 'This clues definition is "a long time"', "This clues indicator is 'half of' and 'in marriage'. Remember, marriage is a union between two things."] },
	 	];

		const clueBox = document.getElementById('clueBox');
		const hintArea = document.getElementById('hintArea');
		const lettersEl = document.getElementById('letters');
		const hintBtns = [document.getElementById('hint1'), document.getElementById('hint2'), document.getElementById('hint3')];
		const revealBtn = document.getElementById('revealLetter');
		const guessBtn = document.getElementById('guessBtn');
		const messageEl = document.getElementById('crypticMessage');

		let current;
		let revealed = new Set();
		let currentIndex = 0;

		function pickPuzzle() {
			current = JSON.parse(JSON.stringify(puzzles[Math.floor(Math.random() * puzzles.length)]));
			current.answer = current.answer.toUpperCase();
		}

		function nextEditableIndex(from) {
			const boxes = Array.from(lettersEl.querySelectorAll('.letter-box'));
			for (let i = from + 1; i < boxes.length; i++) {
				if (!boxes[i].classList.contains('space') && !boxes[i].classList.contains('revealed')) return i;
			}
			return -1;
		}

		function prevEditableIndex(from) {
			const boxes = Array.from(lettersEl.querySelectorAll('.letter-box'));
			for (let i = from - 1; i >= 0; i--) {
				if (!boxes[i].classList.contains('space') && !boxes[i].classList.contains('revealed')) return i;
			}
			return -1;
		}

		function focusIndex(i) {
			const boxes = Array.from(lettersEl.querySelectorAll('.letter-box'));
			if (i < 0 || i >= boxes.length) return;
			boxes.forEach(b => b.classList.remove('active'));
			const b = boxes[i];
			if (b.classList.contains('space') || b.classList.contains('revealed')) {
				// find nearest editable
				const next = nextEditableIndex(i-1);
				if (next >= 0) { currentIndex = next; focusIndex(next); }
				return;
			}
			b.classList.add('active');
			b.focus && b.focus();
			currentIndex = i;
		}

		function render() {
			clueBox.textContent = current.clue;
			hintArea.textContent = '';
			revealed.clear();
			lettersEl.innerHTML = '';
			for (let i = 0; i < current.answer.length; i++) {
				const ch = current.answer[i];
				if (ch === ' ') {
					const box = document.createElement('div');
					box.className = 'letter-box space';
					box.textContent = '';
					lettersEl.appendChild(box);
				} else {
					const box = document.createElement('input');
					box.type = 'text';
					box.className = 'letter-box';
					box.dataset.index = i;
					box.dataset.letter = ch;
					box.maxLength = 1;
					box.inputMode = 'text';
					box.autocomplete = 'off';
					box.spellcheck = false;
					box.tabIndex = 0;
					box.value = '';
					box.addEventListener('focus', () => focusIndex(i));
					box.addEventListener('click', () => focusIndex(i));
					lettersEl.appendChild(box);
				}
			}
			// focus first editable
			const first = Array.from(lettersEl.querySelectorAll('.letter-box')).findIndex(b => !b.classList.contains('space') && !b.classList.contains('revealed'));
			focusIndex(first >= 0 ? first : 0);
			updateRevealButton();
		}

		function showHint(i) {
			if (!current.hints || !current.hints[i]) return;
			hintArea.textContent = current.hints[i];
		}

		function revealRandomLetter() {
			const boxes = Array.from(lettersEl.querySelectorAll('.letter-box'));
			const candidates = boxes.filter(b => !b.classList.contains('space') && !b.classList.contains('revealed'));
			if (candidates.length === 0) return;
			const pick = candidates[Math.floor(Math.random() * candidates.length)];
			// overwrite whatever the user typed and mark revealed
			pick.value = pick.dataset.letter;
			pick.classList.add('revealed');
			revealed.add(parseInt(pick.dataset.index, 10));
			// if the revealed box was the active one, move focus to next editable
			if (parseInt(pick.dataset.index, 10) === currentIndex) {
				const nxt = nextEditableIndex(currentIndex);
				if (nxt >= 0) focusIndex(nxt);
			}
			updateRevealButton();
		}

		function revealAll() {
			const boxes = Array.from(lettersEl.querySelectorAll('.letter-box'));
			boxes.forEach(b => {
				if (!b.classList.contains('space')) {
					b.value = b.dataset.letter;
					b.classList.add('revealed');
				}
			});
		}

		function updateRevealButton() {
			const totalLetters = Array.from(lettersEl.querySelectorAll('.letter-box')).filter(b => !b.classList.contains('space')).length;
			if (revealed.size >= totalLetters) {
				revealBtn.disabled = true;
				revealBtn.textContent = 'All letters revealed';
			} else {
				revealBtn.disabled = false;
				revealBtn.textContent = 'Reveal Letter';
			}
		}

		function showMessage(msg, time = 2500) {
			messageEl.textContent = msg;
			setTimeout(() => { if (messageEl.textContent === msg) messageEl.textContent = ''; }, time);
		}

		function submitGuess() {
			const boxes = Array.from(lettersEl.querySelectorAll('.letter-box'));
			const letters = [];
			for (const b of boxes) {
				if (b.classList.contains('space')) continue;
				letters.push((b.value || '').trim().toUpperCase());
			}
			if (letters.some(l => !l)) {
				return;
			}
			const val = letters.join('');
			if (val === current.answer) {
				revealAll();
				showMessage('CORRECT — WELL DONE!', 5000);
			} else {
				showMessage('WRONG - TRY AGAIN!', 5000);
			}
		}

		// wire events
		hintBtns.forEach((b, i) => b.addEventListener('click', () => showHint(i)));
		revealBtn.addEventListener('click', () => revealRandomLetter());
		guessBtn.addEventListener('click', submitGuess);

		// keyboard handling for typing into boxes
		document.addEventListener('keydown', (e) => {
			const boxes = Array.from(lettersEl.querySelectorAll('.letter-box'));
			if (!boxes.length) return;
			const active = boxes[currentIndex];
			if (!active) return;
			if (e.key === 'Backspace') {
				e.preventDefault();
				if (active.classList.contains('revealed')) {
					const prev = prevEditableIndex(currentIndex);
					if (prev >= 0) focusIndex(prev);
					return;
				}
				if (active.value) {
					active.value = '';
					return;
				}
				const prev = prevEditableIndex(currentIndex);
				if (prev >= 0) {
					const p = boxes[prev];
					p.value = '';
					focusIndex(prev);
				}
				return;
			}
			if (e.key === 'Enter') { submitGuess(); return; }
			if (e.key === 'ArrowRight') { const nxt = nextEditableIndex(currentIndex); if (nxt>=0) focusIndex(nxt); return; }
			if (e.key === 'ArrowLeft') { const prev = prevEditableIndex(currentIndex); if (prev>=0) focusIndex(prev); return; }
			if (/^[a-zA-Z]$/.test(e.key)) {
				e.preventDefault();
				if (active.classList.contains('revealed')) {
					const nxt = nextEditableIndex(currentIndex-1);
					if (nxt>=0) focusIndex(nxt);
					return;
				}
				active.value = e.key.toUpperCase();
				// move to next editable
				const nxt = nextEditableIndex(currentIndex);
				if (nxt >= 0) focusIndex(nxt);
				return;
			}
		});

		// start
		pickPuzzle();
		render();
	}
});

