import { io } from 'socket.io-client'
import { game, changeTurn, selectNumber, victory } from './game'
import { addClickListenersForTurn, clearClickListeners } from './board'
const socket = io('http://localhost:5000', { autoConnect: false })

const connect = (username, room) => {
    socket.on('connect', () => {
        socket.emit('join', username, room)
    })
    socket.on('start', game)
    socket.on('turn', (username, id) => {
        clearClickListeners()
        if(id === socket.id) addClickListenersForTurn()
        changeTurn(username)
    })
    socket.on('number', selectNumber)
    socket.on('victory', (username, id) => {
        if(id === socket.id) victory(true)
        else victory(false)
    })
    socket.on('boogie', console.log)
    socket.connect()
}

const ready = (board) => {
    socket.emit('ready', board)
}

const cancel = (username, room) => {
    socket.emit('cancel', username, room)
}

const number = (num) => {
    socket.emit('number', num)
}

const callBingo = () => {
    socket.emit('bingo')
}

export default socket
export { connect, ready, cancel, number, callBingo }