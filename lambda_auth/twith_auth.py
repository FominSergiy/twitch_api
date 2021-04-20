'''This Python script will be used to get an access token to twitch '''
import os
import json
from datetime import datetime
from datetime import timedelta
import boto3
import requests

CLIENT_ID = os.environ['twitch_client_id']
CLIENT_SECRET = os.environ['twitch_client_secret']
AUTH_ENDPOINT = 'https://id.twitch.tv/oauth2/token'
GRANT_TYPE = 'client_credentials'


def lambda_handler(event, context):
    ''' get token from secret manager. Fetch a new one if token expired'''

    secret_name = "twitch-bearer-token"
    region_name = "ca-central-1"

    # Create a Secrets Manager client
    session = boto3.session.Session()
    client = session.client(
        service_name='secretsmanager',
        region_name=region_name
    )

    get_secret = json.loads(
        client.get_secret_value(
            SecretId=secret_name
        )['SecretString']
    )

    expiry_date = datetime.strptime(get_secret['expiry_date'], '%Y-%m-%d').date()
    today = datetime.today().date()

    if today > expiry_date:
        token_dict = get_token_dict()

        if token_dict:
            token = f'Bearer {token_dict["access_token"]}'
            new_expiry_date = today + timedelta(seconds=token_dict['expires_in'])

            resp = client.put_secret_value(
                SecretId=secret_name,
                SecretString=json.dumps({
                    'access_token' : token,
                    'expiry_date' : new_expiry_date
                }, default=str))
            print(resp)

            return token
    else:
        return get_secret['access_token']


def get_token_dict():
    ''' used to get a bearer token from Twitch api '''

    # no scope is needed for this project
    data = {
        'client_id' : CLIENT_ID,
        'client_secret' : CLIENT_SECRET,
        'grant_type' : GRANT_TYPE
    }

    r = requests.post(AUTH_ENDPOINT, data=data)
    if r.status_code == 200:
        return {
            'access_token' : r.json()['access_token'],
            'expires_in' : r.json()['expires_in']
            }
    else:
        return None
