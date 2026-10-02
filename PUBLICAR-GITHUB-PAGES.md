# Publicar o Juris no GitHub Pages

O site e estatico: para publica-lo, o GitHub Pages precisa servir `index.html`. O banco e a autenticacao ficam no Supabase. Nao publique uma chave `service_role`; somente a chave publica anon/publishable deve aparecer no HTML.

## 1. Banco e autenticacao

O projeto Supabase do Juris usa a URL `https://qwecsowqvaiwpnbqictf.supabase.co`. O schema `supabase-schema.sql` cria a tabela `juris_user_data`, ativa RLS para que cada conta so leia e altere sua propria linha e cria o bucket privado `juris-files` com politicas por usuario.

O SQL cria a tabela `juris_user_data`, ativa RLS para que cada conta so leia e altere sua propria linha, e cria o bucket privado `juris-files` com politicas de acesso por pasta/usuario.

O schema tambem limita o projeto a no maximo 3 contas no total. Para ativar ou atualizar essa regra no projeto, abra **SQL Editor** no painel Supabase e execute o arquivo `supabase-schema.sql`. Se o projeto ja tiver 3 ou mais contas, novos cadastros serao recusados; as contas existentes nao serao removidas.

## 2. URL do site e login por e-mail

O HTML ja usa a URL e a chave publica publishable do projeto, apropriada para o navegador com RLS ativada. Nunca coloque uma chave `service_role` ou `secret` no HTML, em arquivos do GitHub ou no navegador.

No painel Supabase, em **Authentication > URL Configuration**, use a URL publicada como **Site URL** e adicione-a tambem em **Redirect URLs**:

- `https://melquith.github.io/juris-base/`

A tela permite criar conta e entrar com e-mail e senha. Se a confirmacao de e-mail estiver habilitada, a pessoa precisa confirmar o endereco antes de entrar. Para uso publico, configure um SMTP proprio em **Authentication > SMTP Settings** para que os e-mails de confirmacao sejam entregues corretamente.

## 3. Publicar

1. Coloque `index.html` na raiz do repositorio GitHub. O arquivo `supabase-schema.sql` e este guia podem ficar no repositorio, mas nao sao carregados pelo site.
2. No GitHub, abra **Settings > Pages**, escolha a branch principal e a pasta `/ (root)` e salve.
3. Acesse o endereco Pages mostrado pelo GitHub.

As bibliotecas de Supabase e PDF.js sao carregadas de CDNs; nao e necessario enviar `node_modules`, `main.js`, `preload.js`, `manifest.json` ou a pasta `dist` para executar esta versao web.

## Dados e privacidade

Cada conta tem uma linha identificada pelo UUID de autenticacao do Supabase. A tabela e protegida por RLS, e os anexos ficam em um bucket privado, sob uma pasta com esse mesmo UUID. O navegador recebe links temporarios para baixar anexos.

Contas novas comecam vazias. O Juris nao importa automaticamente dados antigos do armazenamento compartilhado do navegador, pois nao ha como saber a quem pertencem. Para levar dados anteriores, exporte um backup no sistema antigo e use **Dados e preferencias > Restaurar backup** depois de entrar na conta.
