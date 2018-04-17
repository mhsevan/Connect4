import asyncio
import websockets
import data_handler
import random

server_address = 'ws://localhost:8765'

player_username = 'py_ai2'

gameboard = []

board_drop_space = []

board_info = {
    'row': 6,
    'col': 7
}


def initGame():
    global gameboard
    global board_drop_space
    global board_info

    gameboard = []

    board_drop_space = []

    for i in range(board_info['col']):
        board_drop_space.append(board_info['row']-1)

    for i in range(board_info['row']):
        tmp_list = []
        for j in range(board_info['col']):
            tmp_list.append('')
        gameboard.append(tmp_list)


def getAvailablePlaces():
    global gameboard
    global board_drop_space
    global board_info

    available_places = []

    for i in range(board_info['col']):
        if board_drop_space[i] >= 0:
            available_places.append(i)

    return available_places


def getNewMove():
    available_places = getAvailablePlaces()

    available_places_count = len(available_places) - 1

    return available_places[random.randint(0, available_places_count)]


def addMove(col=0, player=''):
    global gameboard
    global board_drop_space

    row = board_drop_space[col]
    gameboard[row][col] = player

    board_drop_space[col] = board_drop_space[col] - 1


async def play():
    global player_username
    global gameboard
    global board_drop_space
    global server_address

    async with websockets.connect(server_address) as websocket:
        output_data = data_handler.create_output('join', player_username)
        data_handler.showdata_out(output_data)
        await websocket.send(data_handler.dict2json(output_data))

        join_str = await websocket.recv()
        join_data = data_handler.json2dict(join_str)
        data_handler.showdata_in(join_data)

        if join_data['type'] == 'join':
            initGame()
            while True:
                received_str = await websocket.recv()
                received_data = data_handler.json2dict(received_str)
                data_handler.showdata_in(received_data)

                if received_data['type'] == 'gameover':
                    initGame()
                elif received_data['type'] == 'move':
                    received_move = int(received_data['move'])
                    if received_move > 0:
                        addMove(received_move, received_data['username'])

                    new_move = getNewMove()

                    move_data = data_handler.create_output('move', player_username, new_move, received_data['username'])
                    await websocket.send(data_handler.dict2json(move_data))
                    data_handler.showdata_out(move_data)

                    addMove(new_move, player_username)

asyncio.get_event_loop().run_until_complete(play())
asyncio.get_event_loop().run_forever()
