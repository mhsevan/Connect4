import asyncio
import socket
import data_handler
import random

player_username = 'py_ai'

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

    for i in range(board_info['col']):
        board_drop_space[i] = board_info['row']-1

    for i in range(board_info['row']):
        gameboard[i] = []
        for j in range(board_info['col']):
            gameboard[i][j] = ''


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

    available_places_count = len(available_places)

    return available_places[random.randint(0, available_places_count)]


async def play():
    global player_username
    global gameboard
    global board_drop_space

    async with websockets.connect('ws://134.210.202.127:8765') as websocket:
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
                    if received_data['move'] > 0:
                        move_col = received_data['move']
                        move_row = board_drop_space[move_col]
                        gameboard[move_row][move_col] = received_data['username']

                        board_drop_space[move_col] = board_drop_space[move_col] - 1

                    new_move = getNewMove()

                    move_data = data_handler.create_output('move', player_username, new_move, received_data['username'])
                    await websocket.send(data_handler.dict2json(move_data))
                    data_handler.showdata_out(move_data)

asyncio.get_event_loop().run_until_complete(play())
asyncio.get_event_loop().run_forever()