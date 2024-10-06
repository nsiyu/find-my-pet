import os
import requests
import json
import base64
from PIL import Image
import io
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

def create_tf_serving_json(data):
    if isinstance(data, dict):
        if 'dataframe_split' in data:
            return data
        else:
            return {'inputs': {name: data[name] if isinstance(data[name], list) else data[name].tolist() for name in data.keys()}}
    else:
        return {'inputs': data if isinstance(data, list) else data.tolist()}

def score_model(dataset):
    url = 'https://dbc-bcd7602f-c2b1.cloud.databricks.com/serving-endpoints/predict/invocations'
    headers = {'Authorization': f'Bearer {os.environ.get("DATABRICKS_TOKEN")}', 'Content-Type': 'application/json'}
    ds_dict = dataset if isinstance(dataset, dict) and 'dataframe_split' in dataset else create_tf_serving_json(dataset)
    data_json = json.dumps(ds_dict, allow_nan=True)
    response = requests.request(method='POST', headers=headers, url=url, data=data_json)
    if response.status_code != 200:
        raise Exception(f'Request failed with status {response.status_code}, {response.text}')
    return response.json()

def image_to_json(image_file):
    img = Image.open(image_file)
    if img.mode != 'RGB':
        img = img.convert('RGB')
    img = img.resize((1000, 720))
    buffered = io.BytesIO()
    img.save(buffered, format="JPEG")
    img_str = base64.b64encode(buffered.getvalue()).decode('utf-8')
    
    result = {
        "dataframe_split": {
            "columns": ["image"],
            "data": [[img_str]]
        }
    }
    
    return result

@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part in the request'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected for uploading'}), 400
    
    try:
        json_data = image_to_json(file)
        prediction = score_model(json_data)
        return jsonify(prediction)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
