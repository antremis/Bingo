require('dotenv').config()
const io = require('socket.io')(process.env.PORT, { cors: { origin: process.env.FRONTEND_URL } })
const { shuffle } = require('./utils')
let ROOM_INFO = {}
const BINGO_LINES = [
    [[0, 0], [1, 1], [2, 2], [3, 3], [4, 4]], // 1st diagonal
    [[4, 0], [3, 1], [2, 2], [1, 3], [0, 4]], // 2nd diagonal
    [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]], // 1st row
    [[1, 0], [1, 1], [1, 2], [1, 3], [1, 4]], // 2nd row
    [[2, 0], [2, 1], [2, 2], [2, 3], [2, 4]], // 3rd row
    [[3, 0], [3, 1], [3, 2], [3, 3], [3, 4]], // 4th row
    [[4, 0], [4, 1], [4, 2], [4, 3], [4, 4]], // 5th row
    [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]], // 1st column
    [[0, 1], [1, 1], [2, 1], [3, 1], [4, 1]], // 2nd column
    [[0, 2], [1, 2], [2, 2], [3, 2], [4, 2]], // 3rd column
    [[0, 3], [1, 3], [2, 3], [3, 3], [4, 3]], // 4th column
    [[0, 4], [1, 4], [2, 4], [3, 4], [4, 4]], // 5th column
]

io.on('connect', (socket, username, room) => {

    socket.on('join', (username, room) => {
        if (ROOM_INFO.hasOwnProperty(room) && !ROOM_INFO[room]['Started']) console.log(`${username} with id ${socket.id} has joined the room ${room}!`)
        else if (ROOM_INFO.hasOwnProperty(room) && ROOM_INFO[room]['Started']) {
            console.log(`${username} with id ${socket.id} has failed to join the room ${room} since it has already started`)
            socket.emit('waiting')
            return
        }
        else {
            ROOM_INFO[room] = {
                'Players': [],
                'Order': [],
                'Started': false,
                'Numbers': new Set(),
                'Winner': '',
            }
            console.log(`${username} with id ${socket.id} has created the room ${room}!`)
        }
        ROOM_INFO[room]['Players'].push(socket.id)

        socket.username = username
        socket.join(room)
        socket.room = room
    })

    socket.on('ready', BOARD => {
        if (socket.ready) return
        console.log(`Player ${socket.username} with id ${socket.id} is ready in room ${socket.room}`)
        socket.board = BOARD
        socket.ready = true
        let ready = true
        // io.sockets.adapter.rooms.get(socket.room).forEach(player => {
        ROOM_INFO[socket.room]['Players'].forEach(player => {
            ready = ready && io.sockets.sockets.get(player).ready
        });
        if (ready) {
            ROOM_INFO[socket.room]['Order'] = shuffle(ROOM_INFO[socket.room]['Players'])
            ROOM_INFO[socket.room]['Started'] = true
            ROOM_INFO[socket.room]['Turn'] = 0
            // socket.emit('start')
            io.to(socket.room).emit('start')
            const id = ROOM_INFO[socket.room]['Order'][++ROOM_INFO[socket.room]['Turn'] % ROOM_INFO[socket.room]['Order'].length]
            io.to(socket.room).emit('turn', io.sockets.sockets.get(id).username, id)
            console.log(`starting room ${socket.room}`)
        }
    })

    socket.on('cancel', () => {
        socket.board = null
        socket.ready = false
    })

    socket.on('leave', (username, room) => {
        ROOM_INFO[socket.room]['Players'] = ROOM_INFO[socket.room]['Players'].filter(player => player !== socket.id)
        if (ROOM_INFO[socket.room]['Started']) ROOM_INFO[socket.room]['Order'] = ROOM_INFO[socket.room]['Order'].filter(player => player !== socket.id)
        socket.leave(room)
        socket.disconnect()
    })

    socket.on('number', (number) => {
        ROOM_INFO[socket.room]['Numbers'].add(number)
        const id = ROOM_INFO[socket.room]['Order'][++ROOM_INFO[socket.room]['Turn'] % ROOM_INFO[socket.room]['Order'].length]
        socket.to(socket.room).emit('number', number)
        setTimeout(() => {
            io.to(socket.room).emit('turn', io.sockets.sockets.get(id).username, id)
        }, 5100)
    })

    socket.on('bingo', () => {
        console.log(`player ${socket.username} with id ${socket.id} from room ${socket.room} called Bingo!`)
        let board = JSON.parse(JSON.stringify(socket.board))
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 5; j++) {
                if (ROOM_INFO[socket.room]['Numbers'].has(socket.board[i][j])) board[i][j] = 1
                else board[i][j] = 0
            }
        }
        let lines = 0
        for(let line of BINGO_LINES){
            let sum = 0;
            for(let cell of line) sum += board[cell[0]][cell[1]]
            if(sum === 5) lines++
        }
        
        if(lines >= 5) {
            ROOM_INFO[socket.room]['Winner'] = socket.username
            console.log(`player ${socket.username} has won the game in room with id ${socket.room}`)
            io.to(socket.room).emit('victory', socket.username, socket.id)
        }
        else io.to(socket.room).emit('boogie', socket.username, socket.id)
    })

    socket.on('disconnect', () => {
        ROOM_INFO[socket.room]['Players'] = ROOM_INFO[socket.room]['Players'].filter(player => player !== socket.id)
        if (ROOM_INFO[socket.room]['Started']) ROOM_INFO[socket.room]['Order'] = ROOM_INFO[socket.room]['Order'].filter(player => player !== socket.id)
        socket.leave(room)
        console.log(`${socket.id} has disconnected`)
    })

})

const UNUSED_ROOM_REMOVER = setInterval(() => {
    for (let room in ROOM_INFO) {
        if (ROOM_INFO[room]['Players'].length === 0) {
            delete ROOM_INFO[room]
            console.log(`Room ${room} has been deleted`)
        }
    }
}, process.env.COLLECTOR_TIMEOUT)