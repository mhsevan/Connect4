import asyncio
import websockets
import data_handler


async def play():
    async with websockets.connect('ws://localhost:8765') as websocket:
        username = input("Name? ")
        response_type = 'join'
        output_data = data_handler.create_output(username, response_type)
        data_handler.showdata_out(output_data)
        await websocket.send(data_handler.dict2json(output_data))

        while True:
            receive_str = await websocket.recv()
            receive_data = data_handler.json2dict(receive_str)
            data_handler.showdata_in(receive_data)
            if receive_data['response_type'] != 'join':
                print("MSG: "+receive_data['username']+'\'s msg: '+receive_data['response_data'])

            msg = input("Msg? ")
            msg_data = data_handler.create_output(username, 'msg', msg, 'player')
            await websocket.send(data_handler.dict2json(msg_data))
            data_handler.showdata_out(msg_data)

asyncio.get_event_loop().run_until_complete(play())
asyncio.get_event_loop().run_forever()
