import asyncio
import websockets
import data_handler
from player import Player

server_address = "10.35.4.38"
server_port = 8765

players = {}

glob_messages = {}

game_client_username = "game_player"


async def consumer(message, websocket):
    global players
    global glob_messages
    global game_client_username

    received_data = data_handler.json2dict(message)
    data_handler.showdata_in(received_data)

    if received_data['type'] == 'join':
        if received_data['username'] not in players:
            players[received_data['username']] = Player(received_data['username'], websocket)
            data_handler.showdata_in(received_data['username']+' joined')

            join_data = data_handler.create_output('join', received_data['username'])
            data_handler.showdata_out(join_data)
            await players[received_data['username']].ws.send(data_handler.dict2json(join_data))
    elif received_data['type'] == 'gameover':
        gameover_data = data_handler.create_output('gameover', received_data['username'])

        if received_data['username'] != 'game_player' and received_data['username'] in players:
            await players[received_data['username']].ws.send(data_handler.dict2json(gameover_data))

        if received_data['to_username'] != 'game_player' and received_data['to_username'] in players:
            await players[received_data['to_username']].ws.send(data_handler.dict2json(gameover_data))

        data_handler.showdata_out(gameover_data)
    else:
        sending_username = received_data['to_username']

        if received_data['to_username'] not in players or 'from_game_player' not in received_data:
            sending_username = game_client_username

        await players[sending_username].ws.send(data_handler.dict2json(received_data))
        data_handler.showdata_out(received_data)


async def consumer_handler(websocket):
    while True:
        async for message in websocket:
            await consumer(message, websocket)


async def handler(websocket, path):
    consumer_task = asyncio.ensure_future(consumer_handler(websocket))
    done, pending = await asyncio.wait(
        [consumer_task],
        return_when=asyncio.ALL_COMPLETED,
    )

    for task in pending:
        task.cancel()

if __name__ == '__main__':
    glob_message = asyncio.Queue()
    start_server = websockets.serve(handler, server_address, server_port)
    asyncio.get_event_loop().run_until_complete(start_server)
    asyncio.get_event_loop().run_forever()
