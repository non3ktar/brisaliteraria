# 🌬️ Brisa Literária

**Ouvir para sentir, sentir para aprender.**

Brisa Literária é uma plataforma educacional dedicada à apreciação de obras literárias através de áudio. O projeto foca em oferecer uma experiência premium, estética e funcional para estudantes e amantes da literatura, permitindo o consumo de poesias, contos e trechos clássicos de forma imersiva.

## 🚀 Objetivo do Projeto
Transformar a leitura em uma experiência sensorial, facilitando o acesso à literatura clássica e contemporânea através de áudio (audiobooks/podcasts literários) com suporte para funcionamento offline.

## 🛠️ Tech Stack
- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
- **Estilização**: [TailwindCSS v4](https://tailwindcss.com/)
- **Animações**: [Motion (Framer Motion)](https://motion.dev/)
- **Ícones**: [Lucide React](https://lucide.dev/)
- **Banco de Dados Local**: [Dexie.js](https://dexie.org/) (IndexedDB para suporte offline)
- **Hospedagem de Áudio**: [Nekoweb](https://nekoweb.org/) (MP3 links)
- **Deployment**: [Surge.sh](https://surge.sh/)

## 🎨 Características "UI Pro Max"
- **Glassmorphism**: Interfaces translúcidas e modernas.
- **Dark Mode Native**: Design otimizado para conforto visual.
- **Micro-animações**: Transições suaves e feedback tátil.
- **PWA Ready**: Suporte para download de áudios e uso offline.

## 📖 Como usar
1. **Hospedagem de Áudio**: Suba seus arquivos MP3 para o [Nekoweb](https://nekoweb.org/).
2. **Adicionar Obras**:
   - Acesse o painel admin em `/admin`.
   - Use a senha padrão (definida em `process.env.NEXT_PUBLIC_ADMIN_PASSWORD` ou `brisa123`).
   - Insira o link do MP3 gerado no Nekoweb.
3. **Ouvir e Salvar**: Na página inicial, clique em uma obra para ouvir. Use o ícone de download para salvar a obra no dispositivo e ouvir sem internet.

## 💻 Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev
```

## 🌐 Deployment

Para subir para o Surge:
```bash
npm run deploy
```
URL de Produção: [https://brisa-literaria.surge.sh](https://brisa-literaria.surge.sh)

---
**Desenvolvido por Sérgio & Antigravity** 🌬️📚
