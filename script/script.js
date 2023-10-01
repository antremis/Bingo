import { lobby } from './lobby.js'
import { setupBoard } from './board.js'

window.addEventListener('load', () => {
    const params = new URLSearchParams(window.location.search)
    const username = params.get('username')
    const room = params.get('room')
    if (!username && !room) lobby('', '')
    else if (!username && room) lobby('', room)
    else if (username && !room) lobby(username, '')
    else setupBoard(username, room)
})

const LAYOUT_OBSERVER = new ResizeObserver( entries => {
    const width = entries[0].contentRect.width
    const height = entries[0].contentRect.height
    if(width < height*1.2) document.documentElement.style.setProperty('font-size', '2vw')
    else document.documentElement.style.setProperty('font-size', '1vw')
})

LAYOUT_OBSERVER.observe(document.body)