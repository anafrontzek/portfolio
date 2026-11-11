# Portfólio — Ana Frontzek

Site estático (HTML/CSS/JS puro), pronto para o GitHub Pages.

## Arquivos
- `index.html` — layout, estilo e comportamento do site
- `data.js` — **todos os trabalhos** (título, ano, capa, vídeos, fotos, descrição, destaque). É aqui que você edita.
- `aspect.js` — proporção dos vídeos verticais/quadrados
- `logo_1.png` — logo do menu · `logo-intro.webm` — animação da abertura (só aparece no PC; no iPhone/Mac o site abre direto)
- Depois de editar o `data.js`, aumente o número em `data.js?v=7` no `index.html` (ex.: `?v=8`) para os visitantes verem a versão nova na hora.

## Como editar um trabalho
Cada linha em `data.js` é:
```
["slug", "Título", "Ano", "capa", ["idVideo1","idVideo2"], ["foto1","foto2"], "Descrição", 1]
```
- O `1` no final marca o trabalho como **destaque** na home (tire para remover).
- A ordem das linhas é a ordem do índice.
- Vídeo: pode ser um ID do player da Adobe ou uma URL completa de embed (YouTube: `https://www.youtube.com/embed/ID`, Vimeo: `https://player.vimeo.com/video/ID`).
- Imagem: nome do arquivo no CDN do Adobe Portfolio ou uma URL completa (ex.: `img/minha-foto.jpg` se você subir as imagens no repositório).

## Publicar no GitHub Pages
1. Crie um repositório (ex.: `portfolio`) e envie estes arquivos.
2. Settings → Pages → Source: *Deploy from a branch* → `main` / `root`.
3. Domínio próprio: em Settings → Pages → Custom domain, coloque o domínio (ex.: `anafrontzek.com.br`).
   No painel do domínio (Registro.br, GoDaddy etc.) crie:
   - 4 registros **A** para `@`: 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153
   - 1 registro **CNAME** para `www` → `SEU-USUARIO.github.io`
4. Depois que propagar, marque **Enforce HTTPS**.

## Importante
As capas, fotos e vídeos ainda são carregados do Adobe Portfolio/Behance.
Se um dia você cancelar o Adobe Portfolio, eles somem do site — antes disso, suba as imagens
para a pasta `img/` do repositório e os vídeos no YouTube/Vimeo e troque os links no `data.js`.
