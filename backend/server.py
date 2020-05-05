from flask import Flask, request, jsonify, redirect
from flask_cors import CORS
import json
from hashlib import blake2b
from pymongo import MongoClient
import re
import random

# flask initialization
app = Flask(__name__)   
CORS(app)

# Mongo initialization
client = MongoClient('localhost', 27017)
db = client['pipe17']
dbCollection = db['urlDb']
USE_MONGO = True

# For the URL shortener
DIGEST_S = 9
shortened_urls = {}
regex = re.compile(
        r'^(?:http)s?://'
        r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+(?:[A-Z]{2,6}\.?|[A-Z0-9-]{2,}\.?)|'
        r'localhost|'
        r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'
        r'(?::\d+)?'
        r'(?:/?|[/?]\S+)$', re.IGNORECASE)

@app.route('/store',methods = ['POST'])
def store_data():
    """store route
    This is to store the file system data in the server on a JSON File

    POST:
        summary: store file system data 
        parameters:
            - content - Having a nested JSON structure of 
                {
                    'name': 'test',
                    'folders': [ ],
                    'files': [ ]
                }
                The folder array will have the same recurring nested object
                as given above
        responses:
            200:
                stored: Boolean response indicating data stored
            404:
                description: Not found.
        """
    content = request.json
    with open('data.json', 'w') as f:
        json.dump(content, f)
    f.close()
    return jsonify({'stored': True})

@app.route('/fetch',methods = ['GET'])
def fetch_data():
    """fetch route
    This is to fetch the file system data stored in the server on a JSON File

    GET:
        summary: fetch file system data stored
        parameters:
            - none
        responses:
            200:
                found: Boolean value indicating if data was found or not
                storedData: The stored data is data was found
            404:
                description: Not found.
        """
    try:
        with open('data.json') as f:
            data = json.load(f)
        f.close()
        return jsonify({'found': True, 'storedData': data})
    except IOError as e:
        print("Couldn't open or write to file (%s)." % e)
        return jsonify({'found': False})
        
@app.route('/shorten',methods = ['POST'])
def shorten_url():
    """shorten route
    This is to shorten the URL which is gotten in the request

    POST:
        summary: shortens the URL 
        parameters:
            url : This is the URL to shorten
        responses:
            200:
                shortURL: Shortened URL
            404:
                description: Not found.
        """
    content = request.json
    url = content['url']
    if url[:4] != 'http':
        url = 'http://' + url

    if not check_url_validity(url):
        return bad_request('URL not valid')

    short_url = shorten(url)
    if USE_MONGO:
        dbCollection.insert_one({'short_url': short_url, 'long_url': url})
    else:
        shortened_urls[short_url] = url
    return jsonify({'body': request.url_root + short_url})

@app.route('/<aliasUrl>', methods=['GET'])
def get_shortened(aliasUrl):
    """aliasURL route
    This is to redirect the short URL which is gotten in the request

    POST:
        summary: redirect short url 
        parameters:
            aliasUrl : This is in the request path
        responses:
            200:
                Redirect to the Long URL found
            404:
                description: Not found.
        """

    if USE_MONGO:
        if not dbCollection.find_one({'short_url': aliasUrl}):
            return bad_request('Unknown alias.')
    else:
        if aliasUrl not in shortened_urls:
            return bad_request('Unknown alias.')

    if USE_MONGO:
        doc = dbCollection.find_one({'short_url': aliasUrl})
        actual_url = doc['long_url']
    else:
        actual_url = shortened_urls[aliasUrl]

    return redirect(actual_url, code=302)

@app.route('/fetchAllUrls',methods = ['GET'])
def fetch_all_urls():
    """fetchAllUrl route
    This is to fetch the all url data stored in the server on either db or dictionary

    GET:
        summary: fetch all urls stored
        parameters:
            - none
        responses:
            200:
                found: Boolean value indicating if data was found or not
                urlDate: all url data found
            404:
                description: Not found.
        """
    all_urls = []
    if USE_MONGO:
        cursor = dbCollection.find({})
        for document in cursor:
            del document['_id']
            document['short_url'] = request.url_root + document['short_url']
            all_urls.append(document)
        
    else:
        for key, val in shortened_urls.items():
            all_urls.append({'short_url': request.url_root + key, 'long_url': val})

    return jsonify({'allUrls': all_urls})


@app.route('/deleteUrl',methods = ['POST'])
def delete_url():
    """deleteUrl route
    This is to delete a short url stored in the server on either db or dictionary
    
    POST:
        summary: delete a url
        parameters:
            - urlToDelete: this is the url to delete
        responses:
            200:
                message: deleted
            404:
                description: Not found.
        """
    content = request.json
    url = content['short_url']
    short_hash = url.replace(request.url_root, '')
    if USE_MONGO:
        dbCollection.delete_one({'short_url': short_hash})
    else:
        del shortened_urls[short_hash]

    return jsonify({'message': 'Short Url has been deleted from database'})

       
def shorten(url):
    """Shortens a url by using the blake2b algorithm to generate a unique hash and 
    the first 9 digits of the hash in hexadecimal format are used as shortened URL
    """
    url_hash = blake2b(str.encode(url), digest_size=DIGEST_S)
    url_dig_hex = url_hash.hexdigest()[:9]
    if USE_MONGO:
        while dbCollection.find_one({'short_url': url_dig_hex}):
            url += str(random.randint(0, 9))
            url_hash = blake2b(str.encode(url), digest_size=DIGEST_S)
            url_dig_hex = url_hash.hexdigest()[:9]
    else:
        while url_dig_hex in shortened_urls:
            url += str(random.randint(0, 9))
            url_hash = blake2b(str.encode(url), digest_size=DIGEST_S)
            url_dig_hex = url_hash.hexdigest()[:9]
    return url_dig_hex

def check_url_validity(url):
    """Returns a boolean values indicating the validity of a URL by doing a regex 
    match
    """
    return re.match(regex, url) is not None

def bad_request(message):
    """returns a bad request by attaching a 400 message code 
    and the message passed to this function
    """
    response = jsonify({'message': message})
    response.status_code = 400
    return response


if __name__ == '__main__':
    app.run(debug=True)