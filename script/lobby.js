const LOBBY_HTML = `
    <form id="lobby">
        <div><input type="text" name="username" id="username" data-value=""><label id="username-label" for="username" >username</label></div>
        <div><input type="text" name="room" id="room" data-value=""><label id="room-label" for="room" >room</label></div>
        <button type="submit" value="submit" >JOIN</button>
        <p>NOTE: Leave room empty to generate a random room id</p>
    </form>
`

const lobby = (username, room) => {
    document.querySelector('main').innerHTML = LOBBY_HTML;
    const lobby_inputs = document.querySelectorAll('#lobby>div>input');
    lobby_inputs.forEach(input => {
        input.addEventListener('change', () => {
            input.dataset.value = input.value;
        })
    })
    if (username) {
        const input = document.querySelector('#username')
        input.value = username
        input.dataset.value = username

    }
    if (room) {
        const input = document.querySelector('#room')
        input.value = room
        input.dataset.value = room
    }

    document.querySelector('button').addEventListener('click', (e) => {
        if (lobby_inputs[1].value !== '' || lobby_inputs[1].dataset.value !== '') return
        const roomid = Math.random().toString(36).slice(-6)
        lobby_inputs[1].value = roomid
        lobby_inputs[1].dataset.value = roomid
    })
}

export {lobby}