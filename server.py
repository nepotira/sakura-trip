# -*- coding: utf-8 -*-
"""
Sakura Trip - Servidor Backend com IA Google Gemini Real (Moeda e Idioma em Tempo Real)
CNPJ: 33.134.817/0001-01
"""

import http.server
import socketserver
import urllib.request
import urllib.parse
import json
import os
import sys
import datetime

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

PORT = int(os.environ.get("PORT", 8080))
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
RESERVAS_FILE = os.path.join(DATA_DIR, "reservas.json")
CONFIG_FILE = os.path.join(DATA_DIR, "config.json")
ENV_FILE = os.path.join(BASE_DIR, ".env")

os.makedirs(DATA_DIR, exist_ok=True)

def load_reservas():
    if os.path.exists(RESERVAS_FILE):
        try:
            with open(RESERVAS_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return []
    return []

def save_reservas(data):
    try:
        with open(RESERVAS_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"Error saving reservas: {e}")

def get_gemini_api_key():
    if os.path.exists(CONFIG_FILE):
        try:
            with open(CONFIG_FILE, "r", encoding="utf-8") as f:
                cfg = json.load(f)
                k = cfg.get("gemini_api_key")
                if k and len(k.strip()) > 10:
                    return k.strip()
        except Exception:
            pass
    if os.path.exists(ENV_FILE):
        try:
            with open(ENV_FILE, "r", encoding="utf-8") as f:
                for line in f:
                    if line.strip().startswith("GEMINI_API_KEY="):
                        val = line.split("=", 1)[1].strip().strip('"').strip("'")
                        if len(val) > 10:
                            return val
        except Exception:
            pass
    key = os.environ.get("GEMINI_API_KEY")
    if key and len(key.strip()) > 10:
        return key.strip()
    return None

def build_sayuri_system_prompt(currency="USD", lang="pt"):
    if currency == "JPY":
        cur_rules = """MOEDA ATIVA NO SITE DO USUÁRIO: Iene Japonês (¥ / JPY).
Você DEVE OBRIGATORIAMENTE cotar e informar todos os preços em IENES (¥):
- Pacote mais barato (Standard Room): a partir de ¥ 600.999 por pessoa.
- À vista com 5% de desconto no Pix: ¥ 570.949 (Chave Pix CNPJ: 33.134.817/0001-01).
- Parcelamento no cartão: até 12x de ¥ 50.083 SEM JUROS!
- Outros quartos: Twin Room (¥ 628.899), Quarto Tatami Tradicional (¥ 698.649), Tokyo View (¥ 796.299), Suíte de Luxo com Onsen (¥ 1.047.399)."""
    elif currency == "BRL":
        cur_rules = """MOEDA ATIVA NO SITE DO USUÁRIO: Real Brasileiro (R$ / BRL).
Você DEVE OBRIGATORIAMENTE cotar e informar todos os preços em REAIS (R$):
- Pacote mais barato (Standard Room): a partir de R$ 19.387,05 por pessoa.
- À vista com 5% de desconto no Pix: R$ 18.417,70 (Chave Pix CNPJ: 33.134.817/0001-01).
- Parcelamento no cartão: até 12x de R$ 1.615,58 SEM JUROS!
- Outros quartos: Twin Room (R$ 20.287,05), Quarto Tatami Tradicional (R$ 22.537,05), Tokyo View (R$ 25.687,05), Suíte de Luxo com Onsen (R$ 33.787,05)."""
    else: # USD
        cur_rules = """MOEDA ATIVA NO SITE DO USUÁRIO: Dólar Americano (US$ / USD).
Você DEVE OBRIGATORIAMENTE cotar e informar todos os preços em DÓLARES (US$):
- Pacote mais barato (Standard Room): a partir de US$ 3.877,41 por pessoa.
- À vista com 5% de desconto no Pix: US$ 3.683,54 (Chave Pix CNPJ: 33.134.817/0001-01).
- Parcelamento no cartão: até 12x de US$ 323,12 SEM JUROS!
- Outros quartos: Twin Room (US$ 4.057,41), Quarto Tatami Tradicional (US$ 4.507,41), Tokyo View (US$ 5.137,41), Suíte de Luxo com Onsen (US$ 6.757,41)."""

    if lang == "ja":
        lang_rules = """LANGUAGE DIRECTIVE: The website interface is set to JAPANESE (日本語).
You MUST respond 100% in natural, polite JAPANESE (丁寧語・です/ます調), even if the user input is in Portuguese, English, or any other language."""
    elif lang == "en":
        lang_rules = """LANGUAGE DIRECTIVE: The website interface is set to ENGLISH.
You MUST respond 100% in natural, friendly, fluent ENGLISH, even if the user input is in Portuguese, Japanese, or any other language."""
    else: # pt
        lang_rules = """LANGUAGE DIRECTIVE: O site está configurado em PORTUGUÊS DO BRASIL.
Responda em português brasileiro de forma direta, acolhedora e prestativa."""

    return f"""Você é a Sayuri (さゆり), especialista e atendente oficial de viagens para o Japão da agência Sakura Trip (CNPJ: 33.134.817/0001-01, Cadastur Oficial).

DIRETRIZES DE ATENDIMENTO OBRIGATÓRIAS:
1. {lang_rules}
2. {cur_rules}
3. SEJA DIRETA E CONCISA: Responda exatamente o que o cliente perguntou logo na PRIMEIRA linha! Mantenha a resposta em no máximo 1 ou 2 parágrafos curtos (máximo 70 a 90 palavras). NUNCA mande textão de panfleto.
4. Compreenda gírias e informalidade ("meo", "quanto tá", "qual a mais barata", "e o rango?", "rola parcelar?").
5. O pacote é o Pacote Japão 2027 (10 a 20 de Abril de 2027, 10 dias na florada das cerejeiras) com voos internacionais ida e volta SP-Tóquio (com 2 malas de 23kg inclusas), 9 noites de hotéis em Tóquio, Quioto e Osaka com café da manhã, Trem-Bala Shinkansen e ingressos para Tokyo DisneySea e Universal Studios (Nintendo World).
6. Cupom de desconto extra: SAKURA10.
7. Visto: Brasileiros com passaporte comum eletrônico (com chip biométrico) estão 100% ISENTOS de visto por até 90 dias.
8. Gastronomia em Osaka: Takoyaki (bolinhos de polvo), Okonomiyaki (panqueca salgada) e Kushikatsu (espetinhos empanados).
"""

def call_gemini_api(user_message, history=None, client_key=None, currency="USD", lang="pt"):
    api_key = client_key or get_gemini_api_key()
    
    if not api_key:
        return {
            "reply": "Konnichiwa! 🌸 Para ativar a IA em tempo real, configure sua chave Gemini.",
            "is_live_gemini": False,
            "requires_key": True
        }
    
    contents = []
    if history and isinstance(history, list):
        for h in history[-4:]:
            role = "user" if h.get("sender") == "user" else "model"
            text = h.get("text") or ""
            if text:
                contents.append({"role": role, "parts": [{"text": text}]})
    
    contents.append({"role": "user", "parts": [{"text": user_message}]})

    prompt_text = build_sayuri_system_prompt(currency=currency, lang=lang)

    models_to_try = [
        {"name": "gemini-3-flash-preview", "budget": 0},
        {"name": "gemini-3.1-flash-lite-preview", "budget": 0},
        {"name": "gemini-3.5-flash-lite", "budget": None},
        {"name": "gemini-flash-lite-latest", "budget": None}
    ]

    last_error = None
    for m_info in models_to_try:
        model = m_info["name"]
        budget = m_info["budget"]
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
        
        gen_config = {
            "temperature": 0.35,
            "topP": 0.9,
            "maxOutputTokens": 250
        }
        if budget is not None:
            gen_config["thinkingConfig"] = {"thinkingBudget": budget}
            
        payload = {
            "system_instruction": {
                "parts": [{"text": prompt_text}]
            },
            "contents": contents,
            "generationConfig": gen_config
        }
        
        try:
            req_data = json.dumps(payload).encode("utf-8")
            req = urllib.request.Request(
                url,
                data=req_data,
                headers={"Content-Type": "application/json"},
                method="POST"
            )
            with urllib.request.urlopen(req, timeout=4.5) as response:
                if response.status == 200:
                    resp_json = json.loads(response.read().decode("utf-8"))
                    candidates = resp_json.get("candidates", [])
                    if candidates:
                        text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                        if text:
                            print(f"[API CHAT] ✅ {model} respondeu em tempo real ({currency}/{lang}) para: '{user_message[:30]}'")
                            return {
                                "reply": text.strip(),
                                "model": model,
                                "provider": "Inteligência Artificial",
                                "is_live_gemini": True,
                                "requires_key": False
                            }
        except urllib.error.HTTPError as e:
            err_body = e.read().decode("utf-8", errors="ignore")
            print(f"[API CHAT] Modelo {model} HTTP {e.code}: {err_body[:70]}")
            last_error = f"HTTP {e.code}"
        except Exception as e:
            print(f"[API CHAT] Modelo {model} erro: {e}")
            last_error = str(e)

    # Local concise fallback respecting currency & language
    if lang == "ja":
        p = "¥ 600.999" if currency == "JPY" else ("R$ 19.387,05" if currency == "BRL" else "US$ 3.877,41")
        pix = "¥ 570.949" if currency == "JPY" else ("R$ 18.417,70" if currency == "BRL" else "US$ 3.683,54")
        ans = f"こんにちは！🌸 Sakura Tripの最安プランは「日本旅行2027（スタンダードルーム）」で、お一人様 {p}（一括割引価格: {pix}）からご利用いただけます。往復航空券、ホテル9泊、新幹線、テーマパーク入場券が含まれます。"
    elif lang == "en":
        p = "¥ 600,999" if currency == "JPY" else ("R$ 19,387.05" if currency == "BRL" else "US$ 3,877.41")
        pix = "¥ 570,949" if currency == "JPY" else ("R$ 18,417.70" if currency == "BRL" else "US$ 3,683.54")
        ans = f"Hello! 🌸 Our most affordable option is the Japan 2027 Package (Standard Room) starting at {p} per person (or {pix} with upfront discount). Includes flights, 9 nights of hotels, Shinkansen bullet train, and theme park passes!"
    else:
        p = "¥ 600.999" if currency == "JPY" else ("R$ 19.387,05" if currency == "BRL" else "US$ 3.877,41")
        pix = "¥ 570.949" if currency == "JPY" else ("R$ 18.417,70" if currency == "BRL" else "US$ 3.683,54")
        parc = "12x de ¥ 50.083" if currency == "JPY" else ("12x de R$ 1.615,58" if currency == "BRL" else "12x de US$ 323,12")
        ans = f"Opa! A viagem mais barata que temos é o **Pacote Japão 2027 (Standard Room)**, que sai a partir de **{p}** por pessoa.\n\nNo Pix à vista com 5% de desconto sai por **{pix}**, ou você pode parcelar em até **{parc} sem juros** no cartão! Inclui voos ida e volta, 9 noites de hotéis em Tóquio, Quioto e Osaka, Trem-Bala e ingressos dos parques. Use o cupom **SAKURA10**!"
        
    return {
        "reply": ans,
        "is_live_gemini": False,
        "provider": "Inteligência Artificial"
    }

class SakuraTripRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        
        if path == "/api/reservas":
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            reservas = load_reservas()
            self.wfile.write(json.dumps({"success": True, "reservas": reservas}, ensure_ascii=False).encode("utf-8"))
            return
            
        if path.startswith("/api/reservas/"):
            query_val = urllib.parse.unquote(path.split("/api/reservas/")[1]).strip()
            reservas = load_reservas()
            matched = None
            for r in reservas:
                if r.get("locator", "").upper() == query_val.upper() or r.get("cpf", "").replace(".", "").replace("-", "") == query_val.replace(".", "").replace("-", "") or r.get("cpf", "") == query_val:
                    matched = r
                    break
            
            self.send_response(200 if matched else 404)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            if matched:
                self.wfile.write(json.dumps({"success": True, "reserva": matched}, ensure_ascii=False).encode("utf-8"))
            else:
                self.wfile.write(json.dumps({"success": False, "message": f"Nenhuma reserva encontrada para '{query_val}'."}, ensure_ascii=False).encode("utf-8"))
            return

        if path == "/api/config/key":
            key = get_gemini_api_key()
            has_key = bool(key and len(key) > 10)
            masked = f"{key[:6]}...{key[-4:]}" if has_key else None
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(json.dumps({
                "success": True,
                "configured": has_key,
                "maskedKey": masked,
                "model": "Inteligência Artificial"
            }, ensure_ascii=False).encode("utf-8"))
            return

        return super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        
        content_len = int(self.headers.get("Content-Length", 0))
        post_body = self.rfile.read(content_len).decode("utf-8", errors="ignore")
        try:
            body = json.loads(post_body) if post_body else {}
        except Exception:
            body = {}

        if path == "/api/chat":
            msg = body.get("message", "").strip()
            history = body.get("history", [])
            client_key = body.get("apiKey")
            currency = body.get("currency", "USD")
            lang = body.get("lang", "pt")
            
            if not msg:
                self.send_response(400)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.end_headers()
                self.wfile.write(json.dumps({"success": False, "error": "Mensagem vazia."}, ensure_ascii=False).encode("utf-8"))
                return
                
            ai_response = call_gemini_api(msg, history, client_key, currency=currency, lang=lang)
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(json.dumps({"success": True, **ai_response}, ensure_ascii=False).encode("utf-8"))
            return

        if path == "/api/reservas":
            reservas = load_reservas()
            new_reserva = body.get("reserva")
            if not new_reserva or not isinstance(new_reserva, dict):
                self.send_response(400)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.end_headers()
                self.wfile.write(json.dumps({"success": False, "error": "Dados da reserva invalidos."}, ensure_ascii=False).encode("utf-8"))
                return
                
            if not new_reserva.get("locator"):
                import random
                new_reserva["locator"] = f"SKR-JP2027-{random.randint(100, 999)}"
            new_reserva["createdAt"] = datetime.datetime.now().isoformat()
            new_reserva["status"] = "CONFIRMADO"
            
            reservas.insert(0, new_reserva)
            save_reservas(reservas)
            
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(json.dumps({"success": True, "reserva": new_reserva}, ensure_ascii=False).encode("utf-8"))
            return

        if path == "/api/config/key":
            key = body.get("apiKey", "").strip()
            cfg = {}
            if os.path.exists(CONFIG_FILE):
                try:
                    with open(CONFIG_FILE, "r", encoding="utf-8") as f:
                        cfg = json.load(f)
                except Exception:
                    pass
            cfg["gemini_api_key"] = key
            with open(CONFIG_FILE, "w", encoding="utf-8") as f:
                json.dump(cfg, f, indent=2)
                
            try:
                with open(ENV_FILE, "w", encoding="utf-8") as f:
                    f.write(f"GEMINI_API_KEY={key}\n")
            except Exception:
                pass
                
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(json.dumps({"success": True, "message": "Chave Gemini salva com sucesso."}, ensure_ascii=False).encode("utf-8"))
            return

        if path == "/api/auth/google":
            user_data = {
                "id": "google_1084729104",
                "name": "Lucas Gabriel da Silva",
                "email": "lucas.viajante@gmail.com",
                "cpf": "123.456.789-00",
                "phone": "(11) 99876-5432",
                "passport": "BR984721",
                "avatar": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face",
                "provider": "google"
            }
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(json.dumps({"success": True, "user": user_data}, ensure_ascii=False).encode("utf-8"))
            return

        if path == "/api/auth/login":
            email = body.get("email", "cliente@sakuratrip.com.br")
            user_data = {
                "id": "usr_99482",
                "name": email.split("@")[0].replace(".", " ").title(),
                "email": email,
                "cpf": "123.456.789-00",
                "phone": "(11) 98765-4321",
                "passport": "BR887612",
                "avatar": "assets/sayuri_avatar.png",
                "provider": "email"
            }
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(json.dumps({"success": True, "user": user_data}, ensure_ascii=False).encode("utf-8"))
            return

        self.send_response(404)
        self.end_headers()

if __name__ == "__main__":
    os.chdir(BASE_DIR)
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), SakuraTripRequestHandler) as httpd:
        print(f"============================================================")
        print(f"  SAKURA TRIP SERVER RUNNING AT http://localhost:{PORT}")
        print(f"  CNPJ: 33.134.817/0001-01 - Real-time Multi-Currency & i18n")
        print(f"============================================================")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("Shutting down server...")
            httpd.shutdown()
