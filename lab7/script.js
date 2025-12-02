document.addEventListener('DOMContentLoaded', () => {
    const playBtn = document.getElementById('playButton');
    const block3 = document.querySelector('.block-3');
    let originalContent = '';
    let animationId;
    let eventCounter = 0;
    let stepSize = 1;
    let isAnimating = false;
    let localStorageData = [];
    let serverLogData = [];

    const ballRadius = 10;
    let balls = [
        { id: 1, x: 0, y: 0, color: 'yellow', dx: 1, dy: 0, el: null },
        { id: 2, x: 0, y: 0, color: 'red', dx: -1, dy: 0, el: null }
    ];

    playBtn.addEventListener('click', () => {
        originalContent = block3.innerHTML;
        block3.innerHTML = '';
        
        const workArea = document.createElement('div');
        workArea.id = 'work-area';
        
        const controls = document.createElement('div');
        controls.id = 'controls';
        
        const closeBtn = document.createElement('button');
        closeBtn.innerText = 'Close';
        closeBtn.onclick = closeWorkArea;

        const startBtn = document.createElement('button');
        startBtn.id = 'start-btn';
        startBtn.innerText = 'Start';
        startBtn.onclick = startAnimation;

        const logDisplay = document.createElement('div');
        logDisplay.id = 'log-display';
        logDisplay.innerText = 'Ready...';

        controls.appendChild(closeBtn);
        controls.appendChild(startBtn);
        controls.appendChild(logDisplay);

        const animArea = document.createElement('div');
        animArea.id = 'anim-area';
        const totalHeight = block3.clientHeight;
        animArea.style.height = (totalHeight - 70) + 'px';

        workArea.appendChild(controls);
        workArea.appendChild(animArea);
        block3.appendChild(workArea);
    });

    function closeWorkArea() {
        stopAnimation();
        block3.innerHTML = originalContent;
        renderResultsTable();
    }

    function startAnimation() {
        const startBtn = document.getElementById('start-btn');
        const animArea = document.getElementById('anim-area');
        
        startBtn.disabled = true;
        isAnimating = true;
        stepSize = 1;
        eventCounter = 0;
        localStorageData = [];
        serverLogData = [];
        
        animArea.innerHTML = '';
        balls.forEach(ball => {
            ball.el = document.createElement('div');
            ball.el.className = 'ball';
            ball.el.style.backgroundColor = ball.color;
            
            const maxX = animArea.clientWidth - (ballRadius * 2);
            const maxY = animArea.clientHeight - (ballRadius * 2);
            ball.x = Math.floor(Math.random() * maxX);
            ball.y = Math.floor(Math.random() * maxY);
            
            ball.dx = 1;
            ball.dy = 1; 

            updateBallStyle(ball);
            animArea.appendChild(ball.el);
        });

        logEvent('Start pressed');
        animationId = requestAnimationFrame(gameLoop);
    }

    function gameLoop() {
        if (!isAnimating) return;

        const animArea = document.getElementById('anim-area');
        const maxX = animArea.clientWidth - (ballRadius * 2);
        const maxY = animArea.clientHeight - (ballRadius * 2);
        let collisionOccurred = false;

        balls.forEach(ball => {
            let currentSpeed = 1 + (stepSize * 0.1); 
            
            ball.x += ball.dx * currentSpeed;
            ball.y += ball.dy * currentSpeed;

            if (ball.x <= 0) { ball.x = 0; ball.dx *= -1; logEvent(`Ball ${ball.color} hit Left`); }
            if (ball.x >= maxX) { ball.x = maxX; ball.dx *= -1; logEvent(`Ball ${ball.color} hit Right`); }
            if (ball.y <= 0) { ball.y = 0; ball.dy *= -1; logEvent(`Ball ${ball.color} hit Top`); }
            if (ball.y >= maxY) { ball.y = maxY; ball.dy *= -1; logEvent(`Ball ${ball.color} hit Bottom`); }

            updateBallStyle(ball);
        });

        stepSize++;

        const dx = balls[0].x - balls[1].x;
        const dy = balls[0].y - balls[1].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < ballRadius * 2) {
            collisionOccurred = true;
            logEvent('Collision detected!');
        } else {
             logEvent('Move step');
        }

        if (collisionOccurred) {
            stopAnimation();
            transformToReload();
        } else {
            animationId = requestAnimationFrame(gameLoop);
        }
    }

    function updateBallStyle(ball) {
        ball.el.style.left = ball.x + 'px';
        ball.el.style.top = ball.y + 'px';
    }

    function stopAnimation() {
        isAnimating = false;
        cancelAnimationFrame(animationId);
    }

    function transformToReload() {
        const startBtn = document.getElementById('start-btn');
        if(startBtn) {
            startBtn.style.display = 'none';
            
            const reloadBtn = document.createElement('button');
            reloadBtn.innerText = 'Reload';
            reloadBtn.onclick = () => {
                reloadBtn.remove();
                startBtn.style.display = 'inline-block';
                startBtn.disabled = false;
                startBtn.innerText = 'Start';
            };
            document.getElementById('controls').appendChild(reloadBtn);
        }
    }

    function logEvent(message) {
        eventCounter++;
        const now = new Date();
        const clientTime = now.toLocaleTimeString() + '.' + now.getMilliseconds();

        const disp = document.getElementById('log-display');
        if(disp) disp.innerText = `${eventCounter}: ${message}`;

        const payload = {
            id: eventCounter,
            msg: message,
            clientTime: clientTime
        };

        fetch('server.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        .then(response => response.json())
        .then(data => {
            serverLogData.push({
                id: payload.id,
                msg: payload.msg,
                sentTime: payload.clientTime,
                serverReceived: data.serverTime
            });
        })
        .catch(err => console.error("Server Error:", err));

        localStorageData.push({
            id: payload.id,
            msg: payload.msg,
            storageTime: clientTime
        });
    }

    function renderResultsTable() {
        const block3 = document.querySelector('.block-3');
        block3.innerHTML = `<h2>Звіт подій (Порівняння)</h2>`;
        
        const table = document.createElement('table');
        table.id = 'results-table';
        
        table.innerHTML = `
            <thead>
                <tr>
                    <th style="width: 50%">Дані з LocalStorage (Метод 2)</th>
                    <th style="width: 50%">Дані з Сервера (Метод 1)</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;

        const tbody = table.querySelector('tbody');
        const limit = Math.min(localStorageData.length, 100); 
        
        for (let i = 0; i < limit; i++) {
            const localItem = localStorageData[i];
            const serverItem = serverLogData.find(item => item.id === localItem.id);

            const row = document.createElement('tr');
            const col1Text = `<b>№${localItem.id}</b> [${localItem.storageTime}]<br>${localItem.msg}`;
            
            let col2Text = '...очікування...';
            if (serverItem) {
                col2Text = `<b>№${serverItem.id}</b> [${serverItem.serverReceived}]<br>${serverItem.msg}`;
            } else {
                col2Text = `<span style="color:red">Дані не отримано (втрачено)</span>`;
            }

            row.innerHTML = `
                <td style="vertical-align: top; border: 1px solid #ccc; padding: 5px;">${col1Text}</td>
                <td style="vertical-align: top; border: 1px solid #ccc; padding: 5px;">${col2Text}</td>
            `;
            tbody.appendChild(row);
        }

        block3.appendChild(table);
        
        if(localStorageData.length > 0) {
            const note = document.createElement('p');
            note.innerText = `Всього подій зафіксовано: ${localStorageData.length}. Показано останні ${limit}.`;
            block3.appendChild(note);
        }
    }
});