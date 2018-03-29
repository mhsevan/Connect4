import socket
import re
from base64 import b64encode
from hashlib import sha1

websocket_answer = (
    'HTTP/1.1 101 Switching Protocols',
    'Upgrade: websocket',
    'Connection: Upgrade',
    'Sec-WebSocket-Accept: {key}\r\n\r\n',
)

GUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"

# Create a TCP/IP socket
sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

# Bind the socket to the port
server_address = ('localhost', 10000)
print('starting up on {} port {}'.format(*server_address))
sock.bind(server_address)

# Listen for incoming connections
sock.listen(1)

while True:
    # Wait for a connection
    print('waiting for a connection')
    connection, client_address = sock.accept()
    try:
        print('connection from', client_address)

        handshake_data = connection.recv(1024).decode()

        print('handshake_data')
        print(handshake_data)

        key = (re.search('Sec-WebSocket-Key:\s+(.*?)[\n\r]+', handshake_data).groups()[0].strip())

        response_key = b64encode(sha1((key + GUID).encode()).digest()).decode()
        response = '\r\n'.join(websocket_answer).format(key=response_key)

        connection.send(response.encode())

        # Receive the data in small chunks and retransmit it
        while True:
            data = connection.recv(1024)
            #data_str = data.decode('utf-8')
            print('data',data)
            #print(data_str)
            #print(data.decode('cp1252'))

            send_data = 'hello'
            print('send_data',send_data.encode())
            if data:
                print('sending data back to the client')
                connection.send(send_data.encode())
            else:
                print('no data from', client_address)
                break

    finally:
        # Clean up the connection
        connection.close()