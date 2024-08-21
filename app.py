#!/usr/bin/python3
from flask import Flask, request, jsonify
import mimetypes
import magic
import os
import random
import hashlib
import json
import string

app = Flask(__name__)

current_directory = os.getcwd()

mime = magic.Magic(mime=True)

# @app.route('/openfile')
# def opendir():
#   # 获取 URL 参数 'dir'
#   path = request.args.get('path')
#   if path[0] == '/': path = path[1:]
#   path = os.path.join(current_directory, path)

#   if not os.path.exists(path): return ''

#   file_info = {'name': path, 'type': get_mime_type(path)}

#   return jsonify(file_info)

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


@app.route('/getsalt')
def getsalt():
  username = request.args.get('user')
  if username not in users: return jsonify({'ret': 400, 'msg': '用户不存在1'})
  print(users[username]['salt'])
  return jsonify({'ret': 200, 'msg': '成功', 'salt': users[username]['salt']})


@app.route('/gensalt')
def gensalt():
  return jsonify({'ret': 200, 'msg': '成功', 'salt': randrom_str()})


@app.route('/register')
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


@app.route('/login')
def login():
  username = request.args.get('user')
  password = request.args.get('password')
  if username not in users: return jsonify({'ret': 400, 'msg': '用户不存在'})
  if password != users[username]['password']: return jsonify({'ret': 400, 'msg': '密码错误'})
  token = randrom_str()
  return jsonify({'ret': 200, 'msg': '登录成功', 'token': token})


@app.route('/opendir')
def opendir():
  # 获取 URL 参数 'dir'
  directory = request.args.get('dir')
  if directory[0] == '/': directory = directory[1:]
  directory = os.path.join(current_directory, directory)
  directory = os.path.abspath(directory)
  if not directory.startswith(current_directory): return 'error', 400

  # 验证目录是否存在
  if directory and os.path.isdir(directory):
    # 获取目录中的文件列表
    files = os.listdir(directory)

    # 初始化结果列表
    file_list = []

    # 遍历文件列表
    for file in files:
      # 获取文件信息
      file_path = os.path.join(directory, file)
      file_info = {'name': file, 'type': get_mime_type(file_path)}

      # 将文件信息添加到结果列表
      file_list.append(file_info)

    # 返回JSON响应
    return jsonify(file_list)

  else:
    # 如果目录不存在，返回错误信息
    return ''


def get_mime_type(file_path):
  if os.path.isdir(file_path): return 'folder/'

  mime_type, _ = mimetypes.guess_type(file_path)
  if mime_type is not None: return mime_type

  return mime.from_file(file_path)


if __name__ == '__main__':
  app.run(port=1145)
