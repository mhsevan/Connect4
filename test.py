import json

json_str = '{"username": "u1", "response_type": "join", "response_data": "", "response_to_type": "", "response_to_data": ""}'
json_data = json.loads(json_str)

print(json_data)
print(json_data['username'])
