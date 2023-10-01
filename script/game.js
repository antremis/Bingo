import socket, {callBingo} from './socket'
import { addClickListenersForPlay } from './board'
let turn = 0

const game = (username) => {
    const main = document.querySelector('.game-info')
    const turn = document.createElement('p')
    main.appendChild(turn)
    const number = document.createElement('p')
    main.appendChild(number)
    const bingo = document.createElement('p')
    bingo.innerText = 'BINGO!'
    bingo.addEventListener('click', callBingo)
    main.appendChild(bingo)
}

const changeTurn = (username) => {
    const P = document.querySelector('main').querySelectorAll('p')
    if (username === socket.username) P[1].innerText = `your turn`
    else P[1].innerText = `${username}'s turn`
    P[2].innerText = 'Choosing Number'
}

const selectNumber = (number) => {
    addClickListenersForPlay(number)
    const P = document.querySelector('main').querySelectorAll('p')
    P[1].innerText = `5 seconds to select`
    P[2].innerText = number
    let i = 5
    const timer = setInterval(() => {
        if (i === 0) {
            clearInterval(timer)
            return
        }
        P[1].innerText = `${--i} seconds to select`
    }, 1000)
}

const victory = (winner) => {
    if(winner) console.log('you won!') // throw grafiti
    else console.log('you lost!') // boo
}

export {
    game,
    changeTurn,
    selectNumber,
    victory
}