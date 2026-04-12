from flask import Flask, render_template, jsonify, request
from ytmusicapi import YTMusic
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
ytmusic = YTMusic()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/search')
def search():
    query = request.args.get('q', '')
    if not query:
        return jsonify([])
    
    results = ytmusic.search(query, filter='songs', limit=20)
    songs = []
    
    for item in results:
        songs.append({
            'id': item.get('videoId'),
            'title': item.get('title'),
            'artist': item['artists'][0]['name'] if item.get('artists') else 'Unknown',
            'thumbnail': item['thumbnails'][-1]['url'] if item.get('thumbnails') else '',
            'duration': item.get('duration', 'N/A')
        })
    
    return jsonify(songs)

@app.route('/stream/<video_id>')
def stream(video_id):
    return jsonify({'videoId': video_id})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
