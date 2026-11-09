#!/usr/bin/env python3
"""Servidor local do sistema Fizgo.

Serve os arquivos do app e repassa as chamadas para a API do Autentique, que não
aceita requisições vindas direto do navegador (CORS). Só usa a biblioteca padrão.

Uso:  python3 server.py [porta]      (padrão: 3000)
"""
import http.server
import json
import os
import socket
import sys
import urllib.error
import urllib.parse
import urllib.request

# Carrega arquivo .env se existir na raiz do projeto
_env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env')
if os.path.exists(_env_path):
    with open(_env_path, encoding='utf-8') as _f:
        for _line in _f:
            _line = _line.strip()
            if _line and not _line.startswith('#') and '=' in _line:
                _k, _v = _line.split('=', 1)
                os.environ.setdefault(_k.strip(), _v.strip())

AUTENTIQUE = os.environ.get('AUTENTIQUE_URL', 'https://api.autentique.com.br/v2/graphql')
# Arquivos assinados só podem ser baixados destes endereços
HOSTS_ARQUIVOS = ('autentique.com.br', 'storage.googleapis.com')
LIMITE_UPLOAD = 25 * 1024 * 1024


class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Sempre revalidar: evita o navegador misturar arquivos antigos e novos do app
        self.send_header('Cache-Control', 'no-cache')
        super().end_headers()

    def log_message(self, fmt, *args):
        if args and '/api/' in str(args[0]):
            super().log_message(fmt, *args)

    def responder(self, status, corpo, tipo='application/json'):
        if isinstance(corpo, (dict, list)):
            corpo = json.dumps(corpo).encode()
        self.send_response(status)
        self.send_header('Content-Type', tipo)
        self.send_header('Content-Length', str(len(corpo)))
        self.end_headers()
        self.wfile.write(corpo)

    def token(self):
        return self.headers.get('X-Autentique-Token', '').strip() or os.environ.get('AUTENTIQUE_TOKEN', '').strip()

    def do_GET(self):
        url = urllib.parse.urlparse(self.path)
        if url.path == '/api/ping':
            return self.responder(200, {'ok': True, 'autentique': True})
        if url.path == '/api/autentique/arquivo':
            return self.baixar_arquivo(urllib.parse.parse_qs(url.query).get('url', [''])[0])
        return super().do_GET()

    def do_POST(self):
        if self.path != '/api/autentique/graphql':
            return self.responder(404, {'erro': 'rota inexistente'})
        if not self.token():
            return self.responder(400, {'errors': [{'message': 'Token do Autentique não configurado.'}]})
        tamanho = int(self.headers.get('Content-Length') or 0)
        if tamanho > LIMITE_UPLOAD:
            return self.responder(413, {'errors': [{'message': 'Arquivo grande demais para o Autentique.'}]})
        corpo = self.rfile.read(tamanho)
        req = urllib.request.Request(AUTENTIQUE, data=corpo, method='POST', headers={
            'Authorization': f'Bearer {self.token()}',
            'Content-Type': self.headers.get('Content-Type', 'application/json'),
            'User-Agent': 'FizgoContratos/1.0',
        })
        try:
            with urllib.request.urlopen(req, timeout=90) as r:
                return self.responder(r.status, r.read(), r.headers.get('Content-Type', 'application/json'))
        except urllib.error.HTTPError as e:
            return self.responder(e.code, e.read() or json.dumps({'errors': [{'message': str(e)}]}).encode())
        except Exception as e:  # sem internet, timeout...
            return self.responder(502, {'errors': [{'message': f'Sem conexão com o Autentique: {e}'}]})

    def baixar_arquivo(self, alvo):
        host = urllib.parse.urlparse(alvo).hostname or ''
        if not alvo.startswith('https://') or not any(host == h or host.endswith('.' + h) for h in HOSTS_ARQUIVOS):
            return self.responder(400, {'erro': 'endereço não permitido'})
        cab = {'User-Agent': 'FizgoContratos/1.0'}
        # O token só vai para o Autentique; o Google Storage recusa (401) quem manda token
        if eh_autentique(host):
            cab['Authorization'] = f'Bearer {self.token()}'
        try:
            with ABRIR_ARQUIVO.open(urllib.request.Request(alvo, headers=cab), timeout=90) as r:
                return self.responder(200, r.read(), r.headers.get('Content-Type', 'application/pdf'))
        except Exception as e:
            return self.responder(502, {'erro': str(e)})


def eh_autentique(host):
    return host == 'autentique.com.br' or host.endswith('.autentique.com.br')


class SemTokenForaDoAutentique(urllib.request.HTTPRedirectHandler):
    """A via assinada redireciona para o Google Storage: segue sem levar o token."""
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        novo = super().redirect_request(req, fp, code, msg, headers, newurl)
        if novo is not None and not eh_autentique(urllib.parse.urlparse(newurl).hostname or ''):
            novo.remove_header('Authorization')
        return novo


ABRIR_ARQUIVO = urllib.request.build_opener(SemTokenForaDoAutentique)


class ServidorIPv6(http.server.ThreadingHTTPServer):
    address_family = socket.AF_INET6

    def server_bind(self):
        self.socket.setsockopt(socket.IPPROTO_IPV6, socket.IPV6_V6ONLY, 1)
        super().server_bind()


if __name__ == '__main__':
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    porta = int(sys.argv[1]) if len(sys.argv) > 1 else int(os.environ.get('PORT', 3005))
    # Escuta só neste computador. "localhost" no navegador tenta primeiro o IPv6 (::1);
    # o IPv4 só é usado se o IPv6 não estiver disponível, para não tomar a porta de outro
    # app que já escute em IPv4 (ex.: Fizgo-Ads na 3000).
    servidores = []
    for cls, host in ((ServidorIPv6, '::1'), (http.server.ThreadingHTTPServer, '127.0.0.1')):
        try:
            servidores.append(cls((host, porta), Handler))
            break
        except OSError:
            pass
    if not servidores:
        sys.exit(f'A porta {porta} já está em uso. Feche o outro servidor ou use: python3 server.py 3030')
    print(f'Fizgo · Propostas & Contratos em http://localhost:{porta}')
    servidores[0].serve_forever()
