# Publicar o Juris no GitHub Pages

O site e estatico: para publica-lo, o GitHub Pages precisa servir `index.html`. O banco e a autenticacao ficam no Supabase. Nao publique uma chave `service_role`; somente a chave publica anon/publishable deve aparecer no HTML.

## 1. Criar o banco

1. Crie um projeto em [supabase.com](https://supabase.com/).
2. No painel, abra **SQL Editor** e execute todo o arquivo `supabase-schema.sql`.
3. Em **Project Settings > API**, copie a **Project URL** e a chave **anon/publishable**.

O SQL cria a tabela `juris_user_data`, ativa RLS para que cada conta so leia e altere sua propria linha, e cria o bucket privado `juris-files` com politicas de acesso por pasta/usuario.

## 2. Configurar o HTML

No inicio do primeiro bloco `script type="module"` em `index.html`, substitua:

```js
const supabaseUrl = 'https://YOUR_PROJECT_ID.supabase.co';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';
```

Use os valores do seu projeto Supabase. A chave anon/publishable e propria para uso no navegador com RLS ativada. Nunca cole a chave `service_role` no HTML, em arquivos do GitHub ou no navegador.

## 3. Habilitar login por e-mail

No painel Supabase, em **Authentication > URL Configuration**, defina:

- **Site URL**: `https://SEU_USUARIO.github.io/SEU_REPOSITORIO/`
- **Redirect URLs**: adicione o mesmo endereco e, se for publicar na raiz da conta, `https://SEU_USUARIO.github.io/`.

A tela permite criar conta e entrar com e-mail e senha. Se a confirmacao de e-mail estiver habilitada, a pessoa precisa confirmar o endereco antes de entrar. Para uso publico, configure um SMTP proprio em **Authentication > SMTP Settings** para que os e-mails de confirmacao sejam entregues corretamente.

## 4. Publicar

1. Coloque `index.html` na raiz do repositorio GitHub. O arquivo `supabase-schema.sql` e este guia podem ficar no repositorio, mas nao sao carregados pelo site.
2. No GitHub, abra **Settings > Pages**, escolha a branch principal e a pasta `/ (root)` e salve.
3. Acesse o endereco Pages mostrado pelo GitHub.

As bibliotecas de Supabase e PDF.js sao carregadas de CDNs; nao e necessario enviar `node_modules`, `main.js`, `preload.js`, `manifest.json` ou a pasta `dist` para executar esta versao web.

## Dados e privacidade

Cada conta tem uma linha identificada pelo UUID de autenticacao do Supabase. A tabela e protegida por RLS, e os anexos ficam em um bucket privado, sob uma pasta com esse mesmo UUID. O navegador recebe links temporarios para baixar anexos.

Contas novas comecam vazias. O Juris nao importa automaticamente dados antigos do armazenamento compartilhado do navegador, pois nao ha como saber a quem pertencem. Para levar dados anteriores, exporte um backup no sistema antigo e use **Dados e preferencias > Restaurar backup** depois de entrar na conta.
