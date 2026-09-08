# 🌸 Sakura Trip - Japão 2027

Sistema interativo completo da agência Sakura Trip para a temporada de cerejeiras no Japão (Abril de 2027).

## ✨ Funcionalidades
- **Assistente Sayuri com IA Real**: Conectada à API do Google Gemini com suporte multilíngue em tempo real (Português, Inglês e Japonês) e conversão automática de valores (USD, BRL e JPY).
- **Emissão e Consulta de Reservas**: Localizadores oficiais e impressão direta em formato de Voucher Oficial.
- **Conversor Multimoeda Dinâmico**: Conversão entre Dólar, Real e Iene em todos os pacotes, carrossel de slides e checkout.
- **Roteiro e Atrações**: Guias interativos para Tóquio, Quioto, Monte Fuji e Osaka.

## 🚀 Como Executar Localmente
```bash
python server.py
```
Acesse: `http://localhost:8080`

## ☁️ Deploy no Render
1. Conecte este repositório no Render (`https://dashboard.render.com`).
2. Crie um novo **Web Service**.
3. Defina a variável de ambiente `GEMINI_API_KEY` com a sua chave da Google AI Studio.
4. O build e start serão executados automaticamente via `render.yaml`!
