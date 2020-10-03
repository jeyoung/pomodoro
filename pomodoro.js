class Pomodoro {

	constructor() {
		this.TICK_IN_MS = 1000;
		this.POMODORO_COUNTDOWN_IN_MS = 45000;
		this.SHORT_BREAK_COUNTDOWN_IN_MS = 5000;
		this.LONG_BREAK_COUNTDOWN_IN_MS = 10000;
		this.POMODORO_LIMIT = 4;
		this.STATES = { STOPPED: 0, RUNNING: 1, SHORT_BREAK: 2, LONG_BREAK: 3 };

		this.currentState = this.STATES.STOPPED;
		this.runCounter = 0;
		this.timerCountdownInMs = 0;
		this.ticking = null;
	}

	started() {
		this.currentState = this.STATES.RUNNING;
		this.timerCountdownInMs = this.POMODORO_COUNTDOWN_IN_MS;
		this.ticking = setTimeout(this.ticked.bind(this), this.TICK_IN_MS);
		console.log(`Pomodoro ${this.runCounter+1} started`);
	}

	stopped() {
		this.currentState = this.STATES.STOPPED;
		this.runCounter = 0;
		this.timerCountdownInMs = 0;
		clearTimeout(this.ticking);
		console.log(`Pomodoro series completed`);
	}

	ticked() {
		this.timerCountdownInMs -= this.TICK_IN_MS;
		if (this.timerCountdownInMs < 1) {
			transitionState();
			return;
		}
		this.ticking = setTimeout(this.ticked.bind(this), this.TICK_IN_MS);
	}

	transitionState() {
		switch (this.currentState) {
			case this.STATES.RUNNING:
				if (++this.runCounter === this.POMODORO_LIMIT)
					this.longBreakStarted();
				else
					this.shortBreakStarted();
				break;
			case this.STATES.SHORT_BREAK:
				this.started();
				break;
			case this.STATES.LONG_BREAK:
				this.stopped();
				break;
		}
	}

	longBreakStarted() {
		this.currentState = this.STATES.LONG_BREAK;
		this.timerCountdownInMs = this.LONG_BREAK_COUNTDOWN_IN_MS;
		this.ticking = setTimeout(this.ticked.bind(this), this.TICK_IN_MS);
		console.log(`Long break started`);
	}

	shortBreakStarted() {
		this.currentState = this.STATES.SHORT_BREAK;
		this.timerCountdownInMs = this.SHORT_BREAK_COUNTDOWN_IN_MS;
		this.ticking = setTimeout(this.ticked.bind(this), this.TICK_IN_MS);
		console.log(`Short break started`);
	}
}

class Controller {
	constructor(element, pomodoro) {
		this.element = element;
		this.pomodoro = pomodoro;
		this.refreshing = null;
		this.refreshInterval = (this.element !== null) ? 1000/60 : 1000;
	}

	initialize() {
		this.refreshing = setTimeout(this.refreshed.bind(this), this.refreshInterval);
		this.pomodoro.started();
	}

	refreshed() {
		const tmp = new Date(this.pomodoro.timerCountdownInMs);
		const minutes = '0' + tmp.getMinutes();
		const seconds = '0' + tmp.getSeconds();
		const output = `${minutes.substring(minutes.length - 2)}:${seconds.substring(seconds.length - 2)}`;
		if (this.element !== null) {
			const timerDiv = this.element.querySelector('div#timer');
			const stateDiv = this.element.querySelector('div#state');
			stateDiv.innerHTML = `${Object.entries(this.pomodoro.STATES).find(entry => entry[1] === this.pomodoro.currentState)[0]}`;
			timerDiv.innerHTML = output;
		}
		console.log(output);

		if (this.pomodoro.currentState !== this.pomodoro.STATES.STOPPED)
			this.refreshing = setTimeout(this.refreshed.bind(this), this.refreshInterval);
		else
			clearTimeout(this.refreshing);
	}
}

if (typeof window === 'object')
	window.addEventListener('load', function (loaded) {
		new Controller(this.document.querySelector('body div'), new Pomodoro()).initialize();
	});
else
	new Controller(null, new Pomodoro()).initialize();

