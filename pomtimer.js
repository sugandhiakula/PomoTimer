const timer = {
    pomodoro: 25,
    shortbrk: 5,
    longbrk: 15,
    longBrkIntvl: 4,
    sessions: 0
};

let interval;

const bGroup = document.querySelector('.buttonGroup');
bGroup.addEventListener("click", handleClick);

document.addEventListener('DOMContentLoaded', () => {
    switchMode('pomodoro');
});

const mainButton = document.querySelector('.start');
mainButton.addEventListener("click", () => {
    const { action } = mainButton.dataset;
    if (action === 'start') {
        startTimer();
    }
    else {
        stopTimer();
    }
})

function handleClick(event) {
    const { mode } = event.target.dataset;
    if (!mode) return;

    switchMode(mode);
    stopTimer();
}

function getRemainingTime(endTime) {
    const currTime = Date.parse(new Date());
    const timeLeft = (endTime - currTime)/1000;

    const total = Number.parseInt(timeLeft);
    const minutes = Number.parseInt(timeLeft/60);
    const seconds = Number.parseInt(timeLeft%60);

    return {
        total,
        minutes,
        seconds
    };
}

function startTimer() {
    let { total } = timer.remainingTime;
    let endTime = Date.parse(new Date()) + total * 1000;

    if (timer.mode === 'pomodoro') timer.sessions++;
    
    mainButton.textContent = 'stop';
    mainButton.dataset.action = 'stop';
    mainButton.classList.add('active');

    interval = setInterval(function() {
        timer.remainingTime = getRemainingTime(endTime);
        updateClock();

        total = timer.remainingTime.total;
        if (total <= 0) {
            clearInterval(interval);

            switch (timer.mode) {
                case 'pomodoro':
                  if (timer.sessions % timer.longBrkIntvl === 0) {
                    switchMode('longbrk');
                  } else {
                    switchMode('shortbrk');
                  }
                  break;
                default:
                  switchMode('pomodoro');
              }
        
              startTimer();
            }
        
    }, 1000);

}

function stopTimer() {
    clearInterval(interval);

    mainButton.dataset.action = 'start';
    mainButton.textContent = 'start';
    mainButton.classList.remove('active');
}

function updateClock() {
    const { remainingTime } = timer;
    const min = `${remainingTime.minutes}`.padStart(2, '0');
    const sec = `${remainingTime.seconds}`.padStart(2, '0');

    const minutes = document.querySelector('.minutes');
    const seconds = document.querySelector('.seconds');

    minutes.textContent = min;
    seconds.textContent = sec;

    const txt = timer.mode === 'pomodoro' ? 'Work!' : 'Break!';
    document.title = `${min}:${sec} - ${txt}`;

    const progress = document.querySelector('#progbar');
    progress.value = timer[timer.mode] * 60 - timer.remainingTime.total;
}


function switchMode(mode) {
    timer.mode = mode;
    timer.remainingTime = {
        total: timer[mode] * 60,
        minutes: timer[mode],
        seconds: 0
    };

    document.querySelectorAll('button[data-mode]')
            .forEach(e => e.classList.remove('active'));

    document.querySelector(`[data-mode="${mode}"`).classList.add('active');
    document.body.style.backgroundColor = `var(--${mode})`;

    document.querySelector('#progbar')
    .setAttribute('max',timer.remainingTime.total);
    

    updateClock();
}