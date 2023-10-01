import { connect, ready, number } from './socket'

let NUMBERS = Array.from(Array(25), (_, x) => 1)
let BOARD = [[], [], [], [], []]

const setupBoard = (username, room) => {
    connect(username, room)
    const roomid_p = document.querySelector('#roomid')
    roomid_p.innerText = room
    const userid = document.querySelector('#player')
    userid.innerText = username
    roomid_p.addEventListener('click', () => {
        navigator.clipboard.writeText(room)
    })
    const main = document.querySelector('main')
    main.innerHTML = ''
    const wrapper = document.createElement('div')
    wrapper.classList.add('game-wrapper')
    const grid = document.createElement('div')
    for (let i = 0; i < 5; i++) {
        const row = document.createElement('div')
        row.classList.add('row')
        for (let j = 0; j < 5; j++) {
            const cell = document.createElement('div')
            cell.classList.add('cell')
            cell.addEventListener('click', () => {
                if (cell.innerText === '') addNumber(cell)
                else removeNumber(cell)
            })
            row.appendChild(cell)
        }
        grid.appendChild(row)
    }
    wrapper.appendChild(grid)
    const div = document.createElement('div')
    div.classList.add('options')
    div.innerHTML = `
        <p></p>
        <div>
            <img src='./assets/randomise.png' id='randomise'/>
            <img src='./assets/clear.png' id='clear'/>
            <img src='./assets/confirm.png' id='confirm'/>
        </div>
    `
    div.querySelector('#randomise').addEventListener('click', randomiseBoard)
    div.querySelector('#clear').addEventListener('click', clearBoard)
    div.querySelector('#confirm').addEventListener('click', confirm)
    wrapper.appendChild(div)
    main.appendChild(wrapper)
    const game_info = document.createElement('div')
    game_info.classList.add('game-info')
    wrapper.appendChild(game_info)
}

const addNumber = (cell) => {
    for (let i = 0; i < 25; i++) {
        if (NUMBERS[i] === 1) {
            cell.innerText = i + 1
            NUMBERS[i] = 0
            break
        }
    }
}

const removeNumber = (cell) => {
    NUMBERS[cell.innerText - 1] = 1
    cell.innerText = ''
}

const clearBoard = () => {
    NUMBERS = Array.from(Array(25), (_, x) => 1)
    document.querySelectorAll('.cell').forEach(cell => cell.innerText = '')
}

const randomiseBoard = () => {
    const cells = document.querySelectorAll('.cell')
    let nums = Array.from(Array(25), (_, index) => index + 1)
    for (let i = 0; i < 25; i++) {
        const index = Math.floor(Math.random() * nums.length)
        cells[i].innerText = nums[index]
        nums.splice(index | 0, 1)
    }
}

const confirm = () => {
    const cells = document.querySelectorAll('.cell')
    for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
            BOARD[i][j] = cells[i * 5 + j].innerText
        }
    }
    ready(BOARD)
}

const clearClickListeners = () => {
    const cells = document.querySelectorAll('.cell')
    cells.forEach(cell => {
        cell.parentNode.replaceChild(cell.cloneNode(true), cell)
    })
}

const addClickListenersForTurn = () => {
    const cells = document.querySelectorAll('.cell')
    cells.forEach(cell => {
        cell.classList.add('turn')
        cell.addEventListener('click', () => {
            number(cell.innerText)
            cell.classList.remove('cell')
            cell.classList.remove('turn')
            cell.classList.add('selected-cell')
            bingo()
            clearClickListeners()
        })
    })
}

const addClickListenersForPlay = (number) => {
    clearClickListeners()
    const cells = document.querySelectorAll('.cell')
    cells.forEach(cell => {
        cell.classList.add('turn')
        cell.addEventListener('click', () => {
            cell.classList.remove('cell')
            cell.classList.remove('turn')
            cell.classList.add('selected-cell')
            bingo()
        })
    })
}

const bingo = () => {
    const cells = document.querySelectorAll('row > div')
}

export { setupBoard, addClickListenersForTurn, clearClickListeners, addClickListenersForPlay }