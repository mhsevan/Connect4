import asyncio
import websockets


async def receiveCommandsLoop(player):
    while True:
        print(player)
        msg = await player['websocket'].recv()
        print("< {}".format(msg))

        msg_reply = "Re: {}!".format(msg)
        await player['websocket'].send(msg_reply)
        print("> {}".format(msg_reply))


async def handleClient(websocket, path):
    username = await websocket.recv()
    player = {
        "username": username,
        "websocket": websocket
    }
    print("< {}".format(username))

    greeting = "received:{}".format(username)
    await websocket.send(greeting)
    print("> {}".format(greeting))

    # Start task to listen for commands from player
    asyncio.get_event_loop().create_task(receiveCommandsLoop(player))
    return False

start_server = websockets.serve(handleClient, 'localhost', 8765)

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()