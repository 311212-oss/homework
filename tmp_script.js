
    const elements = [
      { symbol: 'H', chinese: '氫', english: 'Hydrogen', number: 1, hybrid: '1s', appearance: '氣體', mass: '1.008' },
      { symbol: 'He', chinese: '氦', english: 'Helium', number: 2, hybrid: '1s', appearance: '惰性氣體', mass: '4.0026' },
      { symbol: 'C', chinese: '碳', english: 'Carbon', number: 6, hybrid: 'sp3 / sp2', appearance: '固體', mass: '12.011' },
      { symbol: 'N', chinese: '氮', english: 'Nitrogen', number: 7, hybrid: 'sp3', appearance: '氣體', mass: '14.007' },
      { symbol: 'O', chinese: '氧', english: 'Oxygen', number: 8, hybrid: 'sp3', appearance: '氣體', mass: '15.999' },
      { symbol: 'F', chinese: '氟', english: 'Fluorine', number: 9, hybrid: 'sp3', appearance: '氣體', mass: '18.998' },
      { symbol: 'Ne', chinese: '氖', english: 'Neon', number: 10, hybrid: '1s', appearance: '惰性氣體', mass: '20.180' },
      { symbol: 'Na', chinese: '鈉', english: 'Sodium', number: 11, hybrid: '3s', appearance: '柔軟金屬', mass: '22.990' },
      { symbol: 'Mg', chinese: '鎂', english: 'Magnesium', number: 12, hybrid: '3s', appearance: '金屬', mass: '24.305' },
      { symbol: 'Al', chinese: '鋁', english: 'Aluminium', number: 13, hybrid: 'sp2', appearance: '金屬', mass: '26.982' },
      { symbol: 'Si', chinese: '矽', english: 'Silicon', number: 14, hybrid: 'sp3', appearance: '固體', mass: '28.085' },
      { symbol: 'P', chinese: '磷', english: 'Phosphorus', number: 15, hybrid: 'sp3', appearance: '固體', mass: '30.974' },
      { symbol: 'S', chinese: '硫', english: 'Sulfur', number: 16, hybrid: 'sp3', appearance: '固體', mass: '32.06' },
      { symbol: 'Cl', chinese: '氯', english: 'Chlorine', number: 17, hybrid: 'sp3', appearance: '氣體', mass: '35.45' },
      { symbol: 'Ar', chinese: '氬', english: 'Argon', number: 18, hybrid: '1s', appearance: '惰性氣體', mass: '39.948' },
    ];

    const molecules = [
      { formula: 'H2O', chinese: '水', english: 'Water', structure: '彎曲分子', description: '由兩個氫和一個氧組成。' },
      { formula: 'CO2', chinese: '二氧化碳', english: 'Carbon dioxide', structure: '線性分子', description: '由一個碳與兩個氧組成。' },
      { formula: 'CH4', chinese: '甲烷', english: 'Methane', structure: '四面體分子', description: '由一個碳與四個氫組成。' },
      { formula: 'NH3', chinese: '氨', english: 'Ammonia', structure: '三角錐分子', description: '由一個氮與三個氫組成。' },
      { formula: 'NaCl', chinese: '氯化鈉', english: 'Sodium chloride', structure: '離子晶體', description: '普通食鹽，為固體離子結晶。' },
      { formula: 'H2SO4', chinese: '硫酸', english: 'Sulfuric acid', structure: '平面結構', description: '強酸，常用於工業。' },
    ];

    const elementDataUrl = 'https://raw.githubusercontent.com/Bowserinator/Periodic-Table-JSON/master/PeriodicTableJSON.json';
    const moleculeApiBase = 'https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name';
    const chineseNames = {
      H: '氫', He: '氦', Li: '鋰', Be: '鈹', B: '硼', C: '碳', N: '氮', O: '氧', F: '氟', Ne: '氖', Na: '鈉', Mg: '鎂', Al: '鋁', Si: '矽', P: '磷', S: '硫', Cl: '氯', Ar: '氬', K: '鉀', Ca: '鈣', Fe: '鐵', Cu: '銅', Zn: '鋅', Ag: '銀', Au: '金', Hg: '汞', Pb: '鉛', U: '鈾'
    };
    let remoteElements = [];

    const tabButtons = document.querySelectorAll('.tab-button');
    const sections = document.querySelectorAll('.section');
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const searchMessage = document.getElementById('searchMessage');
    const resultArea = document.getElementById('resultArea');
    const elementDetails = document.getElementById('elementDetails');
    const nucleusLabel = document.getElementById('nucleusLabel');
    const orbitStage = document.getElementById('orbitStage');
    const questionText = document.getElementById('questionText');
    const optionsGrid = document.getElementById('optionsGrid');
    const nextQuestion = document.getElementById('nextQuestion');
    const resetQuiz = document.getElementById('resetQuiz');
    const scoreDisplay = document.getElementById('scoreDisplay');
    const attemptsDisplay = document.getElementById('attemptsDisplay');
    const feedbackText = document.getElementById('feedbackText');
    const reactionInput = document.getElementById('reactionInput');
    const balanceBtn = document.getElementById('balanceBtn');
    const balanceResult = document.getElementById('balanceResult');

    let currentQuestion = null;
    let quizScore = 0;
    let quizAttempts = 0;
    let isAnswering = false;

    function showSection(mode) {
      sections.forEach(section => {
        section.classList.toggle('active', section.id === mode);
      });
      tabButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === mode);
      });
      feedbackText.textContent = '';
      if (mode === 'quiz' && quizAttempts === 0) {
        buildQuestion();
      }
    }

    tabButtons.forEach(button => {
      button.addEventListener('click', () => showSection(button.dataset.mode));
    });

    function normalizeFullwidthDigits(value) {
      return value
        .replace(/[０-９]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0xFF10 + 0x30))
        .replace(/[₀₁₂₃₄₅₆₇₈₉]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0x2080 + 0x30))
        .replace(/[（）]/g, ch => ch === '（' ? '(' : ')')
        .replace(/\s+/g, '');
    }

    function normalizeQuery(query) {
      return normalizeFullwidthDigits(query.trim());
    }

    async function loadRemoteElements() {
      try {
        const response = await fetch(elementDataUrl);
        if (!response.ok) throw new Error('載入元素資料失敗');
        const data = await response.json();
        remoteElements = data.elements.map(el => ({
          symbol: el.symbol,
          chinese: chineseNames[el.symbol] || el.name,
          english: el.name,
          number: el.number,
          hybrid: el.electron_configuration_semantic || '未知',
          appearance: el.appearance || '未知',
          mass: el.atomic_mass !== undefined ? String(el.atomic_mass) : '未知',
          summary: el.summary || '',
          source: el.source || ''
        }));
      } catch (error) {
        console.warn('遠端元素資料載入失敗', error);
        searchMessage.textContent = '無法載入遠端元素資料，僅使用本地資料。';
        remoteElements = [];
      }
    }

    async function fetchPubChemMolecule(query) {
      const normalized = normalizeQuery(query);
      try {
        const url = `${moleculeApiBase}/${encodeURIComponent(normalized)}/property/MolecularFormula,MolecularWeight,IUPACName/JSON`;
        const response = await fetch(url);
        if (!response.ok) return null;
        const data = await response.json();
        const props = data.PropertyTable?.Properties?.[0];
        if (!props) return null;
        return {
          formula: props.MolecularFormula || normalized,
          chinese: chineseNames[props.MolecularFormula] || '未知分子',
          english: props.IUPACName || normalized,
          structure: '網路查詢取得分子資料',
          description: `分子量 ${props.MolecularWeight || '未知'}。`,
          isExternal: true
        };
      } catch (error) {
        console.warn('PubChem 查詢失敗', error);
        return null;
      }
    }

    async function findChemistryItem(query) {
      const normalized = normalizeQuery(query);
      if (!normalized) return null;
      const elementMatch = [...elements, ...remoteElements].find(item =>
        item.symbol.toLowerCase() === normalized.toLowerCase() ||
        item.chinese.toLowerCase() === normalized.toLowerCase() ||
        item.english.toLowerCase() === normalized.toLowerCase()
      );
      if (elementMatch) {
        return { type: 'element', item: elementMatch };
      }

      const formula = normalized;
      const composition = parseFormula(formula);
      if (!composition || Object.keys(composition).length === 0) return null;
      const allKnown = Object.keys(composition).every(sym =>
        [...elements, ...remoteElements].some(item => item.symbol.toLowerCase() === sym.toLowerCase())
      );
      if (!allKnown) return null;
      const molecule = molecules.find(m => normalizeQuery(m.formula).toLowerCase() === formula.toLowerCase()) || await fetchPubChemMolecule(formula);
      return { type: 'molecule', item: molecule || { formula, chinese: '未知分子', english: 'Unknown molecule', structure: '分子結構示意', description: '此分子式由已知元素組成。' }, composition };
    }

    function populateElement(element) {

      resultArea.style.display = 'grid';
      searchMessage.textContent = `找到 ${element.chinese} (${element.symbol}) 的資料。`;
      nucleusLabel.textContent = element.symbol;
      elementDetails.innerHTML = `
        <div class="detail-item"><span><strong>元素符號</strong></span><span>${element.symbol}</span></div>
        <div class="detail-item"><span><strong>中文名稱</strong></span><span>${element.chinese}</span></div>
        <div class="detail-item"><span><strong>英文名稱</strong></span><span>${element.english}</span></div>
        <div class="detail-item"><span><strong>原子序</strong></span><span>${element.number}</span></div>
        <div class="detail-item"><span><strong>原子量</strong></span><span>${element.mass}</span></div>
        <div class="detail-item"><span><strong>混成軌域</strong></span><span>${element.hybrid}</span></div>
        <div class="detail-item"><span><strong>常見外觀</strong></span><span>${element.appearance}</span></div>
      `;
    }

    function populateMolecule(result) {
      const { item, composition } = result;
      resultArea.style.display = 'grid';
      searchMessage.textContent = `找到分子式 ${item.formula} (${item.chinese}) 的資料。`;
      nucleusLabel.textContent = item.formula;
      const compositionText = Object.entries(composition)
        .map(([sym, count]) => {
          const element = elements.find(el => el.symbol.toLowerCase() === sym.toLowerCase());
          return `${sym}${count > 1 ? count : ''} (${element ? element.chinese : '未知'})`;
        }).join('，');
      elementDetails.innerHTML = `
        <div class="detail-item"><span><strong>化學式</strong></span><span>${item.formula}</span></div>
        <div class="detail-item"><span><strong>中文名稱</strong></span><span>${item.chinese}</span></div>
        <div class="detail-item"><span><strong>英文名稱</strong></span><span>${item.english}</span></div>
        <div class="detail-item"><span><strong>分子結構</strong></span><span>${item.structure}</span></div>
        <div class="detail-item"><span><strong>組成元素</strong></span><span>${compositionText}</span></div>
        <div class="detail-item"><span><strong>描述</strong></span><span>${item.description}</span></div>
      `;
    }

    searchBtn.addEventListener('click', async () => {
      const query = searchInput.value;
      if (!query.trim()) {
        searchMessage.textContent = '請輸入元素名稱、符號或分子式進行查詢。';
        resultArea.style.display = 'none';
        return;
      }
      const result = await findChemistryItem(query);
      if (!result) {
        searchMessage.textContent = `找不到「${query}」。請輸入有效的元素符號、中文名稱、英文名稱或分子式。`;
        resultArea.style.display = 'none';
        return;
      }
      if (result.type === 'element') {
        populateElement(result.item);
      } else {
        populateMolecule(result);
      }
    });

    searchInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') searchBtn.click();
    });

    let dragActive = false;
    let dragStart = { x: 0, y: 0 };
    let rotation = { x: -18, y: 20 };

    function updateRotation() {
      orbitStage.style.transform = `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`;
    }

    orbitStage.addEventListener('pointerdown', e => {
      dragActive = true;
      dragStart = { x: e.clientX, y: e.clientY };
      orbitStage.classList.add('grabbing');
      orbitStage.setPointerCapture(e.pointerId);
    });
    orbitStage.addEventListener('pointermove', e => {
      if (!dragActive) return;
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      rotation.y += dx * 0.3;
      rotation.x -= dy * 0.3;
      rotation.x = Math.max(-85, Math.min(85, rotation.x));
      dragStart = { x: e.clientX, y: e.clientY };
      updateRotation();
    });
    orbitStage.addEventListener('pointerup', e => {
      dragActive = false;
      orbitStage.classList.remove('grabbing');
      orbitStage.releasePointerCapture(e.pointerId);
    });
    orbitStage.addEventListener('pointerleave', () => {
      dragActive = false;
      orbitStage.classList.remove('grabbing');
    });

    function randomChoice(array) {
      return array[Math.floor(Math.random() * array.length)];
    }

    function buildQuestion() {
      currentQuestion = null;
      feedbackText.textContent = '';
      const all = [...elements];
      const answer = randomChoice(all);
      const promptType = Math.random() < 0.5 ? 'symbol' : 'chinese';
      const questionPrompt = promptType === 'symbol'
        ? `元素符號 ${answer.symbol} 對應哪個中文名稱？`
        : `中文名稱「${answer.chinese}」的元素符號是？`;
      const choices = new Set([answer]);
      while (choices.size < 4) {
        choices.add(randomChoice(all));
      }
      const options = Array.from(choices).sort(() => Math.random() - 0.5);
      currentQuestion = { answer, promptType };
      questionText.textContent = questionPrompt;
      optionsGrid.innerHTML = options.map(option => `
        <button class="choice-button" data-symbol="${option.symbol}">
          ${promptType === 'symbol' ? `${option.chinese} (${option.english})` : `${option.symbol} — ${option.english}`}
        </button>
      `).join('');
      document.querySelectorAll('.choice-button').forEach(button => {
        button.addEventListener('click', () => selectAnswer(button, option => option));
      });
      isAnswering = true;
    }

    function selectAnswer(button) {
      if (!isAnswering) return;
      isAnswering = false;
      const selectedSymbol = button.dataset.symbol;
      const correct = selectedSymbol === currentQuestion.answer.symbol;
      quizAttempts += 1;
      if (correct) {
        quizScore += 1;
        button.classList.add('correct');
        feedbackText.textContent = '答對了！很棒。';
      } else {
        button.classList.add('wrong');
        const correctButton = Array.from(document.querySelectorAll('.choice-button')).find(b => b.dataset.symbol === currentQuestion.answer.symbol);
        if (correctButton) correctButton.classList.add('correct');
        feedbackText.textContent = `答錯了。正確答案是 ${currentQuestion.answer.symbol} (${currentQuestion.answer.chinese})。`;
      }
      scoreDisplay.textContent = quizScore;
      attemptsDisplay.textContent = quizAttempts;
    }

    nextQuestion.addEventListener('click', () => {
      buildQuestion();
    });
    resetQuiz.addEventListener('click', () => {
      quizScore = 0;
      quizAttempts = 0;
      scoreDisplay.textContent = '0';
      attemptsDisplay.textContent = '0';
      feedbackText.textContent = '';
      questionText.textContent = '請按「下一題」開始測驗。';
      optionsGrid.innerHTML = '';
      currentQuestion = null;
      isAnswering = false;
    });

    resetQuiz.click();
    loadRemoteElements();

    function parseFormula(formula) {
      const tokenRegex = /([A-Z][a-z]?)(\d*)|\(|\)|\d+/g;
      const stack = [{}];
      let match;
      while ((match = tokenRegex.exec(formula)) !== null) {
        const [token, element, count] = match;
        if (token === '(') {
          stack.push({});
        } else if (token === ')') {
          const group = stack.pop();
          const multiplierMatch = formula.slice(tokenRegex.lastIndex).match(/^\d+/);
          const multiplier = multiplierMatch ? Number(multiplierMatch[0]) : 1;
          if (multiplierMatch) tokenRegex.lastIndex += multiplierMatch[0].length;
          Object.entries(group).forEach(([el, qty]) => {
            stack[stack.length - 1][el] = (stack[stack.length - 1][el] || 0) + qty * multiplier;
          });
        } else if (element) {
          const qty = count ? Number(count) : 1;
          stack[stack.length - 1][element] = (stack[stack.length - 1][element] || 0) + qty;
        }
      }
      return stack[0];
    }

    function gcd(a, b) {
      return b === 0 ? a : gcd(b, a % b);
    }
    function lcm(a, b) {
      return a / gcd(a, b) * b;
    }

    function balanceEquation(equation) {
      const arrow = equation.includes('->') ? '->' : equation.includes('=') ? '=' : null;
      if (!arrow) return null;
      const [left, right] = equation.split(arrow).map(side => side.split('+').map(part => part.trim()).filter(Boolean));
      if (!left.length || !right.length) return null;
      const compounds = [...left, ...right];
      const elementSet = new Set();
      const matrix = compounds.map(compound => parseFormula(compound));
      matrix.forEach(compound => Object.keys(compound).forEach(el => elementSet.add(el)));
      const elementsArr = Array.from(elementSet);
      const coeffs = Array(compounds.length).fill(1);
      const rows = elementsArr.map(el => {
        return compounds.map((compound, index) => {
          const count = compound[el] || 0;
          return index < left.length ? count : -count;
        });
      });
      const n = rows.length, m = compounds.length;
      const augmented = rows.map(row => [...row]);
      const rank = gaussianElimination(augmented, m);
      if (rank === null) return null;
      const solution = nullspaceSolution(augmented, m, left.length);
      if (!solution) return null;
      const denominators = solution.map(value => value.denominator);
      const commonDen = denominators.reduce((acc, d) => lcm(acc, d), 1);
      const normalized = solution.map(value => Math.round(value.value * commonDen));
      const divisor = normalized.reduce((acc, num) => gcd(acc, Math.abs(num)), normalized[0] || 1);
      const finalCoeffs = normalized.map(num => num / divisor);
      if (finalCoeffs.some(num => num <= 0)) return null;
      return { left, right, coeffs: finalCoeffs };
    }

    function gaussianElimination(mat, cols) {
      const rows = mat.length;
      let rank = 0;
      for (let c = 0; c < cols && rank < rows; c += 1) {
        let pivot = rank;
        while (pivot < rows && mat[pivot][c] === 0) pivot += 1;
        if (pivot === rows) continue;
        [mat[rank], mat[pivot]] = [mat[pivot], mat[rank]];
        const pivotVal = mat[rank][c];
        for (let j = c; j < cols; j += 1) mat[rank][j] /= pivotVal;
        for (let i = 0; i < rows; i += 1) {
          if (i !== rank) {
            const factor = mat[i][c];
            for (let j = c; j < cols; j += 1) mat[i][j] -= factor * mat[rank][j];
          }
        }
        rank += 1;
      }
      return rank;
    }

    function nullspaceSolution(mat, cols, leftLength) {
      const rows = mat.length;
      const solution = Array(cols).fill({ value: 0, denominator: 1 });
      let freeIndex = cols - 1;
      for (let i = rows - 1; i >= 0; i -= 1) {
        const row = mat[i];
        const pivotCol = row.findIndex(value => Math.abs(value) > 1e-9);
        if (pivotCol === -1) continue;
        let sum = 0;
        for (let j = pivotCol + 1; j < cols; j += 1) {
          sum += row[j] * (solution[j].value / solution[j].denominator);
        }
        solution[pivotCol] = { value: -sum, denominator: 1 };
      }
      if (solution.every(item => item.value === 0)) {
        solution[cols - 1] = { value: 1, denominator: 1 };
      }
      return solution;
    }

    balanceBtn.addEventListener('click', () => {
      const equation = reactionInput.value.trim();
      if (!equation) {
        balanceResult.style.display = 'block';
        balanceResult.textContent = '請輸入反應式，例如：H2 + O2 -> H2O';
        return;
      }
      const balanced = balanceEquation(equation.replace(/\s+/g, ''));
      if (!balanced) {
        balanceResult.style.display = 'block';
        balanceResult.textContent = '此反應式無法平衡，請確認格式和原子種類。';
        return;
      }
      const left = balanced.left.map((compound, idx) => {
        const coef = balanced.coeffs[idx];
        return (coef === 1 ? '' : coef) + compound;
      }).join(' + ');
      const right = balanced.right.map((compound, idx) => {
        const coef = balanced.coeffs[balanced.left.length + idx];
        return (coef === 1 ? '' : coef) + compound;
      }).join(' + ');
      balanceResult.style.display = 'block';
      balanceResult.innerHTML = `<strong>平衡反應式：</strong><pre>${left} -> ${right}</pre>`;
    });

    showSection('lookup');
  