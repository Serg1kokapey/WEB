document.addEventListener("DOMContentLoaded", () => {
    swapBlockContent();
    calculateOvalArea();
    handleDivisorsCookies();
    handleAlignmentStorage();
    handleDynamicList();
});

function swapBlockContent() {
    const text1 = document.getElementById('swap-text-1'); 
    const text2 = document.getElementById('swap-text-2'); 
    
    if (!text1 || !text2) return;

    const content1 = text1.innerHTML;
    const content2 = text2.innerHTML;

    text1.innerHTML = content2;
    text2.innerHTML = content1;
}

function calculateOvalArea() {
    const r1 = 10;
    const r2 = 5;
    
    function getOvalArea(a, b) {
        return (Math.PI * a * b).toFixed(2);
    }

    const area = getOvalArea(r1, r2);
    const block3 = document.getElementById('block-3');
    
    const resultDiv = document.createElement('div');
    resultDiv.style.marginTop = "20px";
    resultDiv.style.fontWeight = "bold";
    resultDiv.innerText = `Результат обчислення площі овала (a=${r1}, b=${r2}): S = ${area}`;
    
    block3.appendChild(resultDiv);
}

function handleDivisorsCookies() {
    const cookieName = 'divisorsResult';
    const formContainer = document.getElementById('divisors-form-container');

    const getCookie = (name) => {
        let matches = document.cookie.match(new RegExp(
            "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
        ));
        return matches ? decodeURIComponent(matches[1]) : undefined;
    };

    const setCookie = (name, value, days) => {
        const d = new Date();
        d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
        let expires = "expires=" + d.toUTCString();
        document.cookie = name + "=" + encodeURIComponent(value) + ";" + expires + ";path=/";
    };

    const deleteCookie = (name) => {
        document.cookie = name + "=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
    };

    const savedResult = getCookie(cookieName);

    if (savedResult) {
        setTimeout(() => {
            const userWantsToDelete = confirm(`В Cookies збережено результат:\n${savedResult}\n\nНатисніть "ОК", щоб видалити дані.\nНатисніть "Скасувати", щоб залишити.`);
            
            if (userWantsToDelete) {
                deleteCookie(cookieName);
                location.reload();
            } else {
                alert("Cookies залишились. Необхідно перезавантажити сторінку для появи форми.");
                formContainer.innerHTML = "<p>Форма прихована. Є збережені Cookies.</p>"; 
            }
        }, 100);
        formContainer.innerHTML = ""; 
    } else {
        formContainer.innerHTML = `
            <hr>
            <h4>Знайти дільники числа</h4>
            <div style="margin-bottom: 10px;">
                <input type="number" id="numInput" placeholder="Введіть число" min="1">
                <button id="calcBtn">Обчислити</button>
            </div>
        `;

        const btn = document.getElementById('calcBtn');
        if (btn) {
            btn.addEventListener('click', () => {
                const inputVal = document.getElementById('numInput').value;
                const num = parseInt(inputVal);
                
                if (!num || num <= 0) {
                    alert("Будь ласка, введіть натуральне число > 0");
                    return;
                }

                let divisors = [];
                for (let i = 1; i <= num; i++) {
                    if (num % i === 0) divisors.push(i);
                }
                const resString = divisors.join(", ");

                alert(`Дільники числа ${num}: ${resString}`);
                setCookie(cookieName, `Число ${num}: [${resString}]`, 1);
                
                alert("Дані записано в Cookies. Оновіть сторінку.");
                location.reload();
            });
        }
    }
}

function handleAlignmentStorage() {
    const b1 = document.getElementById('block-1');
    const b2 = document.getElementById('block-2');
    const check1 = document.getElementById('check-b1');
    const check2 = document.getElementById('check-b2');

    const savedState = JSON.parse(localStorage.getItem('alignSettings')) || { b1: false, b2: false };
    
    check1.checked = savedState.b1;
    check2.checked = savedState.b2;

    const updateStorage = () => {
        const state = {
            b1: check1.checked,
            b2: check2.checked
        };
        localStorage.setItem('alignSettings', JSON.stringify(state));
    };

    check1.addEventListener('change', updateStorage);
    check2.addEventListener('change', updateStorage);

    [b1, b2].forEach(block => {
        block.addEventListener('mouseover', () => {
            const isB1 = block.id === 'block-1';
            const isChecked = isB1 ? check1.checked : check2.checked;
            
            if (isChecked) {
                block.style.textAlign = 'right';

                if (isB1) {
                    block.style.alignItems = 'flex-end';
                } else {
                    block.style.justifyContent = 'flex-end';
                    
                    const whiteBlock = block.querySelector('.element-x');
                    if (whiteBlock) {
                        whiteBlock.style.marginRight = '150px'; 
                    }
                }
            }
        });

        block.addEventListener('mouseout', () => {
            block.style.textAlign = '';
            block.style.alignItems = '';
            block.style.justifyContent = '';
            
            // Скидаємо відступ
            const whiteBlock = block.querySelector('.element-x');
            if (whiteBlock) {
                whiteBlock.style.marginRight = '';
            }
        });
    });
}

function handleDynamicList() {
    const link = document.getElementById('create-list-link');
    const container = document.getElementById('list-container');
    const storageKey = 'myDynamicList';

    function renderList() {
        const items = JSON.parse(localStorage.getItem(storageKey));
        if (!items) return false;

        container.innerHTML = '<h4>Збережений список:</h4>';
        const ul = document.createElement('ul');
        items.forEach(txt => {
            const li = document.createElement('li');
            li.textContent = txt;
            li.style.color = 'white';
            ul.appendChild(li);
        });
        container.appendChild(ul);
        
        const delBtn = document.createElement('button');
        delBtn.textContent = "Видалити список з пам'яті";
        delBtn.onclick = () => {
            localStorage.removeItem(storageKey);
            location.reload();
        };
        container.appendChild(delBtn);
        
        link.style.display = 'none';
        return true;
    }

    if (renderList()) {
        return;
    }

    link.addEventListener('click', (e) => {
        e.preventDefault();
        link.style.display = 'none';

        const formDiv = document.createElement('div');
        formDiv.innerHTML = `
            <input type="text" id="listItemInput" placeholder="Пункт списку">
            <button id="addItemBtn">Додати</button>
            <button id="saveListBtn">Зберегти список</button>
            <ul id="tempList" style="text-align: left; color: white;"></ul>
        `;
        container.appendChild(formDiv);

        const input = document.getElementById('listItemInput');
        const addBtn = document.getElementById('addItemBtn');
        const saveBtn = document.getElementById('saveListBtn');
        const tempList = document.getElementById('tempList');
        
        let currentItems = [];

        addBtn.addEventListener('click', () => {
            if(input.value) {
                currentItems.push(input.value);
                const li = document.createElement('li');
                li.textContent = input.value;
                tempList.appendChild(li);
                input.value = '';
            }
        });

        saveBtn.addEventListener('click', () => {
            if (currentItems.length > 0) {
                localStorage.setItem(storageKey, JSON.stringify(currentItems));
                alert("Список збережено!");
                container.innerHTML = ''; 
                renderList();
            } else {
                alert("Список порожній!");
            }
        });
    });
}