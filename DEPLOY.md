# Deploy na Vercel

O projeto ja esta configurado para a Vercel pelo arquivo `vercel.json`.

## Deploy automatico pelo GitHub

1. Acesse <https://vercel.com/new> e conecte a conta do GitHub.
2. Importe o repositorio `pe-eli/website-dimouras`.
3. Mantenha o diretorio raiz como `./`. A Vercel usara automaticamente:
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Clique em **Deploy**.

Depois disso, cada push para a branch `main` publica uma nova versao de producao. Pull requests e outras branches geram previews.

## Deploy pela linha de comando

```bash
npx vercel
npx vercel --prod
```

O primeiro comando cria um preview e vincula a pasta local ao projeto. O segundo publica em producao.

## Validacao local

```bash
npm run build
```

Os arquivos que serao publicados ficam em `dist/`.
