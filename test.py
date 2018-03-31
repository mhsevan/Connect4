import base64
import zlib
import gzip


import binascii
import struct

log_content = base64.b64encode('123'.encode())

data_str = zlib.compress(log_content)


#print(data_str)
#print(zlib.decompress(b'\x81\x83\xd3\x9d\xff\x08\xeb\xa5\xc7', 16+zlib.MAX_WBITS))
#print(gzip.decompress('\x81\x83\xd3\x9d\xff\x08\xeb\xa5\xc7'))

#b'x\x9c\xb3\xb0\xb0\x00\x00\x01S\x00\xa9'
#b'x^\xb3\xb0\xb0\x00\x00\x01S\x00\xa9'

#print(base64.b64decode(zlib.decompress(b'\x81\x83\x04\x81\xd6\x03<\xb9\xee',1024)))

binstr=b"thisisunreadablebytes"

encoded=binascii.b2a_qp(binstr)
print('encoded', encoded)
print(binascii.a2b_qp(encoded))

ba=bytearray(binstr)
print(list(ba))

print(binascii.b2a_hex(binstr))
print(struct.unpack("21B",binstr))