// Object will all necessary details
const timer = {
    pomodoro: 25,
    shortbrk: 5,
    longbrk: 15,
    longBrkIntvl: 4,
    sessions: 0
};

let interval;

// When one of the mode buttons is clicked, the handleClick subroutine is invoked
const bGroup = document.querySelector('.buttonGroup');
bGroup.addEventListener("click", handleClick);

// When the page first loads, the 'Pomodoro' mode is activated
document.addEventListener('DOMContentLoaded', () => {
    switchMode('pomodoro');
});

const buttonSound = new Audio('button-click.wav');
const alarmSound = new Audio('ding.wav');
const mainButton = document.querySelector('.start');

// When the main button is clicked, the subroutine below is activated
mainButton.addEventListener("click", () => {

    // The sound of a button being clicked is played
    buttonSound.play();
    const { action } = mainButton.dataset;

    // Start or stop the timer, in accordance with button clicks
    if (action === 'start') {
        startTimer();
    }
    else {
        stopTimer();
    }
})

// Handle the clicking of the various mode buttons
function handleClick(event) {
    const { mode } = event.target.dataset;
    if (!mode) return;

    // Switch to the mode that was selected
    switchMode(mode);

    // The timer is stopped every time the mode is changed
    stopTimer();
}

// Get the remaining time, based on the mode
function getRemainingTime(endTime) {
    const currTime = Date.parse(new Date());

    // Time left in seconds
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

// Starting the timer should:
// 1. Calculate the time remaining, initially, based on the mode
// 2. Update the number of sessions, to determine the type of break to be triggered
// 3. Update the main button's text and action
// 4. Calculate and display the time remaining, every second
// 5. Depending on the number of elapsed pomodoro sessions, trigger the appropriate
//    type of break, and sound an alarm
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
        // When the time remaining reaches zero:
        // 1. Clear the interval
        // 2. Depending on the number of completed pomodoro sessions, trigger
        //    the right type of break; after 4 consecutive pomodoro sessions, 
        //    a long break should begin. 
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

              // Notify the user of a session's having ended with an alarm
              alarmSound.play();
        
              // Restart the timer, after the mode is switched
              startTimer();
            }
        
    }, 1000);

}

// When the timer is stopped:
// 1. Clear the interval
// 2. Change the text and the action of the main button, and 'deactivate' it
function stopTimer() {
    clearInterval(interval);

    mainButton.dataset.action = 'start';
    mainButton.textContent = 'start';
    mainButton.classList.remove('active');
}

// Update the clock when one of the following happens:
// 1. When the mode is changed
// 2. When the timer is going, and the remaining time is being updated
function updateClock() {

    // Get the remaining time from the global timer object
    const { remainingTime } = timer;

    // Pad the minutes and seconds in a way that will always show two characters
    const min = `${remainingTime.minutes}`.padStart(2, '0');
    const sec = `${remainingTime.seconds}`.padStart(2, '0');

    const minutes = document.querySelector('.minutes');
    const seconds = document.querySelector('.seconds');
    // Display the new minutes and seconds values
    minutes.textContent = min;
    seconds.textContent = sec;

    // Update the title based on the current mode and the time left
    const txt = timer.mode === 'pomodoro' ? 'Work!' : 'Break!';
    document.title = `${min}:${sec} - ${txt}`;
    // Update the progress bar based on the elapsed time
    const progress = document.querySelector('#progbar');
    progress.value = timer[timer.mode] * 60 - timer.remainingTime.total;
}

// When the mode is switched:
// 1. Calculate the remaining time, based on the selected mode
// 2. 'Deactivate' all modes, and activate the selected mode
// 3. Change the colour of the background, depending on the selected mode
// 4. Update the progress bar
// 5. Update the clock
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