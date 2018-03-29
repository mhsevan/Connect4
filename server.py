import socket
import re


def get_headers(data):
    resource = re.compile("GET (.*) HTTP").findall(data)
    host = re.compile("Host: (.*)rn").findall(data)
    origin = re.compile("Origin: (.*)rn").findall(data)
    return [resource[0], host[0], origin[0]]


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

        # Receive the data in small chunks and retransmit it
        while True:
            data = connection.recv(2024)
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