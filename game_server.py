import asyncio
import websockets
import datetime
import data_handler
from player import Player

players = {}

glob_messages = {}


async def consumer(message, websocket):
    global players
    global glob_messages

    received_data = data_handler.json2dict(message)
    data_handler.showdata_in(received_data)

    if received_data['response_type'] == 'join':
        if received_data['username'] not in players:
            players[received_data['username']] = Player(received_data['username'], websocket)
            data_handler.showdata_in(received_data['username']+' joined')

            join_data = data_handler.create_output(received_data['username'], 'join', '', '')
            data_handler.showdata_out(join_data)
            await players[received_data['username']].ws.send(data_handler.dict2json(join_data))
    else:
        if received_data['response_type'] == 'msg' and received_data['response_to_type'] == 'player':
            for player_username, player_info in players.items():
                if player_username != received_data['username']:
                    if player_username not in glob_messages:
                        glob_messages[player_username] = []

                    glob_messages[player_username].append({
                        'username': received_data['username'],
                        'msg': received_data['response_data'],
                        'sent': False
                    })



async def producer():
    output_data = False
    #now = datetime.datetime.utcnow().isoformat() + 'Z'
    for player_username, player_info in players.items():
        if len(glob_messages) > 0 and player_username in glob_messages:
            for msg_i in range(len(glob_messages[player_username])):
                if glob_messages[player_username][msg_i]['sent'] == False:
                    output_data = {
                        'username': player_username,
                        'from_username': glob_messages[player_username][msg_i]['username'],
                        'msg': glob_messages[player_username][msg_i]['msg']
                    }
                    glob_messages[player_username].remove(glob_messages[player_username][msg_i])
                    break
            break
    return output_data


async def consumer_handler(websocket):
    while True:
        async for message in websocket:
            #print("this went in glob_message: {}".format(message))
            await consumer(message, websocket)    #global glob_message


async def producer_handler(websocket):
    global players
    while True:
        msg_data = await producer()
        if msg_data:
            data_handler.show_output('producer msg: ', msg_data)
            output_data = data_handler.create_output(msg_data['from_username'], 'msg', msg_data['msg'], 'player')
            data_handler.showdata_out(output_data)
            await players[msg_data['username']].ws.send(data_handler.dict2json(output_data))
        #await asyncio.sleep(5.0)


async def handler(websocket, path):
    producer_task = asyncio.ensure_future(producer_handler(websocket))
    consumer_task = asyncio.ensure_future(consumer_handler(websocket))
    done, pending = await asyncio.wait(
        [consumer_task, producer_task],
        return_when=asyncio.ALL_COMPLETED,
    )

    for task in pending:
        task.cancel()

if __name__ == '__main__':
    glob_message = asyncio.Queue()
    start_server = websockets.serve(handler, 'localhost', 8765)
    asyncio.get_event_loop().run_until_complete(start_server)
    asyncio.get_event_loop().run_forever()
