# Como Implantar o Otimizador de Loterias na Nuvem (Gratuitamente)

Este guia ensina o passo a passo para colocar o backend do seu otimizador matemático (Python/Flask) na internet de forma 100% gratuita. 

Fazendo isso, você não precisará ter o Python instalado ou rodando no seu computador pessoal para usar a **Cobertura IA** — qualquer pessoa poderá usar a partir de qualquer navegador ou celular!

---

## Passo 1: Enviar seu Código para o GitHub
O deploy na nuvem é integrado com o GitHub. Sempre que você atualiza seu código no GitHub, a nuvem atualiza o servidor automaticamente.

1. Crie uma conta gratuita no [GitHub](https://github.com/) (caso não possua).
2. Crie um repositório privado ou público chamado `b2b-loterias-backend`.
3. Suba os arquivos da sua pasta para este repositório do GitHub (especialmente a pasta `src/`, `main.py`, `Procfile`, `requirements.txt` e a pasta `js/data/history_db.js`).

---

## Passo 2: Criar Conta e Deploy no Render (Plataforma de Nuvem)
Recomendamos o **Render** por ser gratuito, moderno e integrado perfeitamente com o GitHub.

1. Acesse [render.com](https://render.com/) e crie uma conta gratuita clicando em **Get Started** (você pode entrar direto usando sua conta do GitHub).
2. No painel do Render, clique no botão azul **`New +`** (canto superior direito) e selecione **`Web Service`**.
3. Na lista, escolha a opção **`Build and deploy from a Git repository`**.
4. Conecte sua conta do GitHub e selecione o repositório `b2b-loterias-backend` que você criou.
5. Preencha as configurações simples de Deploy:
   * **Name**: `b2b-loterias-otimizador` (ou qualquer nome de sua escolha).
   * **Environment**: `Python` (ou `Python 3` se solicitado).
   * **Region**: Escolha a mais próxima (ex: `Ohio` ou `Oregon`).
   * **Branch**: `main`
   * **Build Command**: `pip install -r requirements.txt`
   * **Start Command**: `gunicorn main:app`
   * **Instance Type**: Selecione a opção **`Free`** (Grátis - R$ 0,00/mês).
6. Clique no botão **`Create Web Service`** no final da página.

O Render começará a instalar as dependências e, em cerca de 2 minutos, o seu servidor estará ativo no ar! 
O Render fornecerá a sua URL pública exclusiva da nuvem, que se parecerá com isto:
`https://b2b-loterias-otimizador.onrender.com`

---

## Passo 3: Conectar a sua Aplicação Web à Nuvem
Com a sua URL pública gerada no passo anterior (ex: `https://b2b-loterias-otimizador.onrender.com`), você só precisa atualizar a URL na sua aplicação para apontar para a nuvem.

1. Abra o arquivo `js/ui.js` no seu editor.
2. Procure pela linha que contém a requisição fetch ao Flask local:
   ```javascript
   const response = await fetch('http://127.0.0.1:5000/run-pipeline', {
   ```
3. Substitua `http://127.0.0.1:5000` pela sua URL do Render. Exemplo:
   ```javascript
   const response = await fetch('https://b2b-loterias-otimizador.onrender.com/run-pipeline', {
   ```
4. Salve o arquivo.

Pronto! A partir de agora, toda vez que o botão **Cobertura IA** for clicado no site, ele processará o cálculo matemático avançado diretamente no servidor da nuvem, eliminando totalmente a dependência de rodar scripts pretos de terminal no seu próprio computador! E se por acaso o servidor da nuvem estiver fora do ar ou o usuário estiver sem internet, o sistema fará o fallback local em JavaScript de forma imediata!
