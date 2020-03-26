import React from 'react';
import './snake.css';
import cloneDeep from 'lodash/cloneDeep';
function SC(position , direction){ //snake cell
    this.position = position;
    this.direction = direction;
}
const starterSnake = [
    new SC({ x: 2, y: 5 }, 1),
    new SC({ x: 1, y: 5 }, 1),
    new SC({ x: 0, y: 5 }, 1)
];
export default class Snake extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            snake: starterSnake,
            apple: { x: 14, y: 5 },
            condition: 'START',
            pichs: [],
            direction: 1 // 1: right , 1: down , 2: left , 3: up
        };
    }

    componentDidMount() {
        window.addEventListener("keydown", e => this.handleKeyDown(e));
    }

    componentWillUnmount() {
        window.removeEventListener("keyup", e => this.handleKeyDown(e));
    }

    handleKeyDown(e) {
        switch (e.keyCode) {
            case 32:
            case 13:
                if (this.state.condition !== 'RUNNING') { this.start(); } break;
            case 37: this.redirect(-1); break;
            case 38: this.redirect(2); break;
            case 39: this.redirect(1); break;
            case 40: this.redirect(-2); break;
            default: break;
        }
    }

    cptp(x) { return x * 8; }

    move(newDirection) { //board is 23 x 23
        let snake = cloneDeep(this.state.snake);
        let newSnake = [];
        const getPosition = (preP, direction , isNew) => {
            let newP = preP;
            switch (direction) {
                case 1: newP.x  = isNew? preP.x - 1 : preP.x + 1; break;
                case 2: newP.y  = isNew? preP.y + 1 : preP.y - 1; break;
                case -1: newP.x = isNew? preP.x + 1 : preP.x - 1; break;
                case -2: newP.y = isNew? preP.y - 1 : preP.y + 1; break;
                default: break;
            }
            return newP;
        };
        snake[0].position = getPosition(snake[0].position, newDirection);
        snake[0].direction = newDirection;
        newSnake.push(snake[0]);
        for (let x = 1; x < snake.length; x++) {
            newSnake.push(new SC(getPosition(snake[x].position, snake[x].direction), snake[x - 1].direction));
        }
        if (this.loseCondition(newSnake)) {
            clearInterval(this._snti);
            this.setState({ condition: 'LOSE' });
        } else {
            if (this.eatingApple(snake[0].position)) {
                let lastBody = cloneDeep(newSnake[newSnake.length - 1]);
                newSnake.push(new SC(getPosition(lastBody.position, lastBody.direction , true), lastBody.direction));
                this.createApple(snake);
            }
            this.setState({ snake: newSnake });
        }
    }

    loseCondition(ns) {
        if (ns[0].position.x === 23 || ns[0].position.x === -1 || ns[0].position.y === 23 || ns[0].position.y === -1) {//check if we are going to wall
            return true;
        }
        for (let x = 1; x < ns.length; x++) { //check if snake going to itself
            if (ns[0].position.x === ns[x].position.x && ns[0].position.y === ns[x].position.y) {
                return true;
            }
        }
        return false;
    }

    eatingApple(hp) {
        return hp.x === this.state.apple.x && hp.y === this.state.apple.y;
    }

    createApple(sn) {
        const gen = () => {
            return {
                x: Math.floor(Math.random() * 22),
                y: Math.floor(Math.random() * 22)
            };
        };
        let f = true;
        while (f) {
            let ap = gen(); // apple position
            let allowed = true;
            for (let x = 0; x < sn.length; x++) {
                if (sn[x].position.x === ap.x && sn[x].position.y === ap.y) {
                    allowed = false;
                }
            }
            if (allowed) {
                f = false;
                this.setState({ apple: ap });
            }
        }
    }

    start() {
        this.setState({ snake: starterSnake, condition: 'RUNNING', direction: 1 });
        this._snti = setInterval(() => this.move(this.state.direction), 200);
    }

    redirect(direction) {
        if (Math.abs(direction) !== Math.abs(this.state.direction)) {
            this.setState({ direction: direction });
        }
    }

    renderSnake() {
        return this.state.snake.map((item, index) =>
            <div key={index.toString()} className={'snakeBody'}
                style={{ transform: `translate(${this.cptp(item.position.x)}pt , ${this.cptp(item.position.y)}pt)` }}
            />
        );
    }

    renderApple() {
        return <div className='apple' style={{ transform: `translate(${this.cptp(this.state.apple.x)}pt , ${this.cptp(this.state.apple.y)}pt)` }} />;
    }

    renderBanner() {
        if (this.state.condition === 'START') {
            return <div onClick={() => this.start()} className='snakeBanner'><div className='bannerTextBold'>SNAKE</div><div className='bannerText'>CLICK TO START!</div></div>;
        }
        if (this.state.condition === 'LOSE') {
            return <div onClick={() => this.start()} className='snakeBanner'><div className='bannerText'>YOU LOSE!</div><div className='bannerText'>CLICK TO RESTART!</div></div>;
        }
        return null;
    }

    render() {
        return (
            <div className='snake'>
                <div className='snakeBoard'>
                    {this.renderSnake()}
                    {this.renderApple()}
                    {this.renderBanner()}
                </div>
                <div className='snakeDashboard'>{`SCORE: ${this.state.snake.length - 3}`}</div>
                <div className='snakeKeysContainer'>
                    <button className='snakeKey sbcolor' onClick={() => this.redirect(2)}>
                        <img alt='up' src={'PATH_TO_ARROW_UP'} height={18} />
                    </button>

                    <div className='midleKeyContainer'>
                        <button className='snakeKey sbcolor' onClick={() => this.redirect(-1)}>
                            <img alt='left' src={'PATH_TO_ARROW_LEFT'} height={18} style={{ transform: 'rotate(-90deg)' }} />
                        </button>

                        <div className='snakeKey' />

                        <button className='snakeKey sbcolor' onClick={() => this.redirect(1)}>
                            <img alt='right' src={'PATH_TO_ARROW_RIGHT'} height={18} style={{ transform: 'rotate(90deg)' }} />
                        </button>
                    </div>

                    <button className='snakeKey sbcolor' onClick={() => this.redirect(-2)}>
                        <img alt='down' src={'PATH_TO_ARROW_DOWN'} height={18} style={{ transform: 'rotate(180deg)' }} />
                    </button>
                </div>
            </div>
        );
    }
}
