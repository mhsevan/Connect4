import socket
import hashlib
import re
import base64


def get_headers(data):
    resource = re.compile("GET / HTTP/(.*)\r\n").findall(data)
    host = re.compile("Host: (.*)\r\n").findall(data)
    origin = re.compile("Origin: (.*)\r\n").findall(data)
    WebSocketKey = re.compile("Sec-WebSocket-Key: (.*)\r\n").findall(data)
    AcceptKey = base64.b64encode(hashlib.sha1((WebSocketKey[0]+"258EAFA5-E914-47DA-95CA-C5AB0DC85B11").encode()).hexdigest().encode()).decode()
    print(AcceptKey)
    return [resource[0], host[0], origin[0],AcceptKey]


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

        headers = get_headers(handshake_data)
        our_handshake = "HTTP/1.1 101 Web Socket Protocol Handshake\r\n" + "Upgrade: WebSocket\r\n" + "Connection: Upgrade\r\n" + \
                        "WebSocket-Origin: " + headers[2] + "\r\n" + "Sec-WebSocket-Accept: " + headers[3] + "\r\n" + "WebSocket-Location: " + " ws://" + headers[1]+'\r\n\r\n'
        print('our_handshake data')
        print(our_handshake)
        connection.send(our_handshake.encode())

        # Receive the data in small chunks and retransmit it
        while True:
            data = connection.recv(1024)
            print(data)
            if data:
                print('sending data back to the client')
                connection.send(b'hello')
            else:
                print('no data from', client_address)
                break

    finally:
        # Clean up the connection
        connection.close()