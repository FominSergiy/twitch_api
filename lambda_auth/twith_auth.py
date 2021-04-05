'''This Python script will be used to get an access token to twitch '''
import requests
import os
import json
import boto3

CLIENT_ID = os.environ['twitch_client_id']
CLIENT_SECRET = os.environ['twitch_client_secret']
AUTH_ENDPOINT = 'https://id.twitch.tv/oauth2/token'
GRANT_TYPE = 'client_credentials'


def lambda_handler(event, context):
    ''' used to get a bearer token from Twitch api '''
    print("Received event: " + json.dumps(event, indent=2))

    # no scope is needed for this project
    data = {
        'client_id' : CLIENT_ID,
        'client_secret' : CLIENT_SECRET,
        'grant_type' : GRANT_TYPE
    }

    r = requests.post(AUTH_ENDPOINT, data=data)

    if r.status_code == 200:
        bearer_token = r.json()['access_token']
        return f'Bearer {bearer_token}'
    else:
        return f'Request did not process. Status code:{ r.status_code}'