#!/usr/bin/python3
from flask import Flask, request, jsonify, send_file
import mimetypes
import magic
import os
import random
import hashlib
import json
import string
import webbrowser

app = Flask(__name__)

current_directory = os.getcwd()

mime = magic.Magic(mime=True)

users = {}
if os.path.exists('etc/passwd'):
  with open('etc/passwd', 'r') as f:
    users = json.load(f)


def save_users():
  with open('etc/passwd', 'w') as f:
    json.dump(users, f)


allowed_chars = string.ascii_letters + string.digits + '_'
allowed_chars_set = set(allowed_chars)


def name_is_valid(str: str) -> bool:
  return all(char in allowed_chars_set for char in str)


def randrom_str(len: int = 32):
  return ''.join(random.choice(allowed_chars) for _ in range(len))


def hash_password(username: str, password: str, salt: str):
  combined = username + '$' + password + '$' + salt
  hashed_password = hashlib.md5(combined.encode()).hexdigest()
  return hashed_password


@app.route('/api/getsalt')
def getsalt():
  username = request.args.get('user')
  if username not in users: return jsonify({'ret': 400, 'msg': '用户不存在1'})
  print(users[username]['salt'])
  return jsonify({'ret': 200, 'msg': '成功', 'salt': users[username]['salt']})


@app.route('/api/gensalt')
def gensalt():
  return jsonify({'ret': 200, 'msg': '成功', 'salt': randrom_str()})


@app.route('/api/register')
def register():
  username = request.args.get('user')
  password = request.args.get('password')
  salt = request.args.get('salt')

  if len(username) < 3: return jsonify({'ret': 400, 'msg': '用户名长度不能小于3'})
  if len(username) > 32: return jsonify({'ret': 400, 'msg': '用户名长度不能大于32'})
  if not name_is_valid(username): return jsonify({'ret': 400, 'msg': '用户名包含非法字符'})
  if len(password) != 32: return jsonify({'ret': 400, 'msg': '密码不合法'})
  if not name_is_valid(password): return jsonify({'ret': 400, 'msg': '密码不合法'})
  if len(salt) != 32: return jsonify({'ret': 400, 'msg': '盐不合法'})
  if not name_is_valid(salt): return jsonify({'ret': 400, 'msg': '盐不合法'})

  if username in users: return jsonify({'ret': 400, 'msg': '用户已存在'})

  users[username] = {
      'username': username,
      'salt': salt,
      'password': password,
  }
  save_users()

  return jsonify({'ret': 200, 'msg': '注册成功'})


@app.route('/api/login')
def login():
  username = request.args.get('user')
  password = request.args.get('password')
  if username not in users: return jsonify({'ret': 400, 'msg': '用户不存在'})
  if password != users[username]['password']: return jsonify({'ret': 400, 'msg': '密码错误'})
  token = randrom_str()
  return jsonify({'ret': 200, 'msg': '登录成功', 'token': token})


@app.route('/api/opendir')
def opendir():
  # 获取 URL 参数 'dir'
  directory: str = request.args.get('dir')
  if directory[0] == '/': directory = directory[1:]
  directory = os.path.join(current_directory, directory)
  directory = os.path.abspath(directory)
  if not directory.startswith(current_directory): return 'error', 400

  if not directory or not os.path.isdir(directory): return ''

  file_list = []
  for file in os.listdir(directory):
    file_path = os.path.join(directory, file)
    file_node = {
        'name': file,
        'type': get_mime_type(file_path),
        'path': file_path,
        'dir': directory,
        'size': os.path.getsize(file_path) if not os.path.isdir(file_path) else -1,
    }
    file_list.append(file_node)
    if 0 <= file_node['size'] and file_node['size'] < 1024 and file.endswith('.desktop'):
      with open(file_path, 'r', encoding='utf-8') as f:
        file_node['data'] = f.read()

  return jsonify(file_list)


def get_mime_type(file_path):
  if os.path.isdir(file_path): return 'folder/'

  mime_type, _ = mimetypes.guess_type(file_path)
  if mime_type is not None: return mime_type

  return mime.from_file(file_path)


@app.route('/<path:path>')
def get_file(path):
  print(path)
  return send_file(path)


@app.route('/')
def index_html():
  return send_file('index.html')


@app.route('/js/components')
def js_components():
  dir_path = os.path.join(current_directory, 'js', 'components')
  html_files = {}
  if os.path.isdir(dir_path):
    for root, _, files in os.walk(dir_path):
      for file in files:
        if file.endswith('.html'):
          file_path = os.path.join(root, file)
          with open(file_path, 'r', encoding='utf-8') as f:
            html_files[file[:-5]] = f.read()
    return jsonify(html_files)
  return jsonify({'error': 'Directory js/components not found'}), 404


if __name__ == '__main__':
  webbrowser.open('http://127.0.0.1:1234/')
  app.run(port=1234)
