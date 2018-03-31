import asyncio
import websockets

async def handleClient(websocket, path):
    username = await websocket.recv()
    print("< {}".format(username))

    response = "received:{}".format(username)
    await websocket.send(response)
    print("> {}".format(response))

    while True:
        msg = await websocket.recv()
        print("< {}".format(msg))

        msg_reply = "Re: {}!".format(msg)
        await websocket.send(msg_reply)
        print("> {}".format(msg_reply))

start_server = websockets.serve(handleClient, 'localhost', 8765)

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()