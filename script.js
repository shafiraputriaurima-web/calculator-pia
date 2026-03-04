let buffer = "0";
let isEditMode = false;
const screen = document.querySelector(".screen");

function buttonClick(value) {
    if (isNaN(parseInt(value))) {
        handleSymbol(value);
    } else {
        handleNumber(value);
    }
    screen.innerText = formatDisplay(buffer);
}

function handleSymbol(symbol) {
    switch (symbol) {
        case 'C':
            buffer = "0";
            break;
        case '=':
            if (buffer === "0") return;
            solve();
            break;
        case '←':
            if (buffer.length === 1) {
                buffer = "0";
            } else {
                buffer = buffer.substring(0, buffer.length - 1);
            }
            break;
        case '%':
            if (buffer !== "0" && !isNaN(buffer.slice(-1))) {
                 buffer += "%";
            }
            break;
        default:
            if (buffer === "0") buffer = "";
            buffer += symbol;
            break;
    }
}

function handleNumber(number) {
    if (buffer === "0") {
        buffer = number;
    } else {
        buffer += number;
    }
}

function solve() {
    try {
       let expression = buffer
       .replace(/×/g, '*')
       .replace(/÷/g, '/')
       .replace(/−/g, '-')
       .replace(/%/g, '/100');

        let result = eval(expression);
        if (!Number.isInteger(result)) {
            result = Math.round(result * 100) / 100;
        }
        
        addToHistory(buffer, result);
        buffer = result.toString();
    } catch {
        buffer = "Error";
    }
    screen.innerText = formatDisplay(buffer);
}

function addToHistory(op, res) {
    const list = document.getElementById('history-list');
    const li = document.createElement('li');

    li.innerHTML = `
    <div class="delete-circle"></div>
    <div class="history-item-content">
         <span class="op-text">${op}</span>
         <span class="res-text">= ${formatDisplay(res.toString())}</span>
    </div>`;

    li.querySelector('.delete-circle').onclick = (e) => {
        e.stopPropagation();
        li.style.opacity = "0";
        li.style.transform = "translateX(-20px)";
        setTimeout(() => li.remove(), 300);
    };

    li.querySelector('.history-item-content').onclick = () => {
        if (!isEditMode) {
            buffer = res.toString();
            screen.innerText = formatDisplay(buffer);
            document.getElementById('history-modal').classList.add('hide');
        }
    };
    list.prepend(li);
}

function formatDisplay(str) {
    if (str === "Error" || str === "0" || str === "") return str;

    return str.split(/([\+\−\×\÷%])/).map(part => {
        if (/[\+\−\×\÷%]/.test(part)) return part;
        if (part !== "") {
            if (part.includes('.')) {
                const sides = part.split('.');
                const leftSide = Number(sides[0].replace(/\./g, '')).toLocaleString('id-ID');
                return leftSide + ',' + sides[1];
            }
            let num = part.replace(/\./g, '');
            if(!isNaN(num)) {
                return Number(num).toLocaleString('id-ID');
            }
        }
        return part;
    }).join('');
}

function toggleEditMode() {
    isEditMode = !isEditMode;
    const modal = document.getElementById('history-modal');
    const editBtn = document.getElementById('edit-toggle');
    const clearBtn = document.getElementById('clear-all');
    const closeBtn = document.getElementById('close-history');

    if (isEditMode) {
        editBtn.innerText = "✓";
        clearBtn.classList.remove('hide');
        closeBtn.classList.add('hide');
        modal.classList.add('edit-mode');
    } else {
        editBtn.innerText = "Edit";
        clearBtn.classList.add('hide');
        closeBtn.classList.remove('hide');
        modal.classList.remove('edit-mode');
    }
}

// --- SEMUA EVENT LISTENER DIKUMPULKAN DI SINI ---

// 1. Klik Tombol Kalkulator
document.querySelector('.calc-buttons').addEventListener('click', function(event) {
    if (event.target.tagName === 'BUTTON') {
        buttonClick(event.target.innerText.trim());
    }
});

// 2. Klik Ikon Jam (Buka/Tutup)
document.getElementById('history-toggle').addEventListener('click', () => {
    document.getElementById('history-modal').classList.toggle('hide');
});

// 3. Klik Tombol X (Close) di dalam History
document.getElementById('close-history').addEventListener('click', () => {
    document.getElementById('history-modal').classList.add('hide');
    if (isEditMode) toggleEditMode();
});

// 4. Klik Tombol Edit
document.getElementById('edit-toggle').addEventListener('click', toggleEditMode);

// 5. Klik Tombol Clear All
document.getElementById('clear-all').addEventListener('click', () => {
    document.getElementById('history-list').innerHTML = '';
    if (isEditMode) toggleEditMode(); 
});
