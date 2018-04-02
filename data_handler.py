import json


def dict2json(dict_data):
    return json.dumps(dict_data)


def json2dict(json_data):
    return json.loads(json_data)


def create_output(username='', response_type='', response_data='', response_to_type='', response_to_data=''):
    output_data = {
        'username': username,
        'response_type': response_type,
        'response_data': response_data,
        'response_to_type': response_to_type,
        'response_to_data': response_to_data,
    }

    return output_data


def showdata_in(output_data=''):
    show_output("In: ", output_data)


def showdata_out(output_data=''):
    show_output("Out: ", output_data)


def show_output(output_type='', output_data=''):
    pr(output_type + " {}".format(output_data))


def pr(output_data=''):
    print("{}".format(output_data))
