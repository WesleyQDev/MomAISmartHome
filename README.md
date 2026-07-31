# 🏠 MomAI Smart Home

A **MomAI Smart Home** é a extensão oficial de automação residencial para a assistente virtual **MomAI**. Ela permite controlar dispositivos inteligentes da sua casa diretamente por comandos em linguagem natural na conversa ou através de um painel interativo dedicado.

---

## 💡 Sobre a Extensão

A extensão conecta a **MomAI** aos seus ecossistemas de casa inteligente. Atualmente, possui integração nativa e completa com o **Home Assistant**, com suporte planejado para outras plataformas populares no futuro, tais como:

- 🔹 **Home Assistant** *(Suportado atualmente)*
- 🔹 **Google Home** *(Em planejamento)*
- 🔹 **Samsung SmartThings** *(Em planejamento)*
- 🔹 **Tuya / Smart Life** *(Em planejamento)*

---

## 🏡 O que é o Home Assistant?

O **Home Assistant** é uma plataforma de automação residencial de código aberto (open-source) que centraliza o gerenciamento de dispositivos inteligentes de diferentes marcas e fabricantes em um único lugar local.

Com ele, você pode integrar:
- 💡 **Lâmpadas e fitas LED** (brilho, cores RGB, temperatura de cor)
- 🌡️ **Termostatos e ar-condicionado**
- 🔒 **Fechaduras e sensores de presença/porta**
- 📺 **Smart TVs e reprodutores de mídia**
- 🔌 **Interruptores, tomadas e aspiradores robô**

Ao conectar o Home Assistant à **MomAI**, todos esses dispositivos ficam imediatamente disponíveis para controle por voz ou texto.

---

## 📋 Requisitos

Para conectar a extensão ao seu ambiente, você precisará de apenas **duas informações** do seu servidor Home Assistant:

1. **URL do Servidor**: O endereço IP local ou domínio do seu Home Assistant (ex.: `http://192.168.1.100:8123` ou `http://homeassistant.local:8123`).
2. **Long-Lived Access Token** *(Token de Acesso de Longa Duração)*: Uma chave de autenticação gerada com segurança no painel do Home Assistant.

---

## 🚀 Passo a Passo de Instalação e Configuração

Siga o guia prático abaixo para configurar e conectar o Home Assistant à extensão:

1. **Instale o Home Assistant**:
   - Siga o guia oficial de instalação para a sua plataforma (Raspberry Pi, PC dedicado, Docker ou VM):
   - 🔗 [Guia oficial de instalação do Home Assistant](https://www.home-assistant.io/installation/)

2. **Conclua a Configuração Inicial**:
   - Acesse o Home Assistant pelo navegador e conclua o assistente de onboarding.

3. **Adicione seus Dispositivos Inteligentes**:
   - Integre suas lâmpadas, tomadas, TVs e sensores no Home Assistant seguindo a documentação oficial:
   - 🔗 [Documentação oficial de integrações do Home Assistant](https://www.home-assistant.io/integrations/)

4. **Acesse o Perfil de Usuário**:
   - No painel do Home Assistant, clique no seu nome de usuário (canto inferior esquerdo) e vá em **Perfil → Segurança**.

5. **Gere o Long-Lived Access Token**:
   - Role até a seção **Long-Lived Access Tokens** (Tokens de Acesso de Longa Duração).
   - Clique em **Create Token** *(Criar Token)*, informe um nome identificador (ex.: `MomAI`) e clique em **OK**.
   - **Copie o código gerado**: Ele será exibido apenas uma vez!

6. **Copie a URL do Servidor**:
   - Copie o endereço completo que você utiliza para acessar o Home Assistant no navegador (ex.: `http://homeassistant.local:8123`).

7. **Abra a Extensão MomAI Smart Home**:
   - Na interface da **MomAI**, abra a aba da extensão **MomAI Smart Home**.
   - Cole a **URL do Servidor** e o **Long-Lived Access Token** nos campos indicados.

8. **Conectar**:
   - Clique no botão **Conectar ao Home Assistant**.

---

## ⚡ Após a Conexão

Assim que a conexão for estabelecida com sucesso, a **MomAI** detectará automaticamente todas as entidades e dispositivos cadastrados no seu servidor.

### O que você pode fazer:

- 💬 **Controle via Chat (Linguagem Natural)**:
  - *"Ligue a luz da sala"*
  - *"Mude a lâmpada do quarto para azul com 50% de brilho"*
  - *"Ajuste o ar condicionado para 22 graus"*
  - *"Desligue a TV da sala"*

- 🪟 **Overlay Flutuante de Controle**:
  - Ao pedir pelo chat ou acionar um dispositivo específico, a MomAI pode abrir uma janela flutuante dedicada com controle remoto de TV, roda de cores RGB para lâmpadas ou slider de temperatura.

- 🎛️ **Painel Dedicado na Interface**:
  - A extensão adiciona uma página completa à barra lateral da MomAI para visualizar o status em tempo real de todos os dispositivos, filtrar por cômodo (`Sala`, `Quarto`, etc.), acessar relógio, clima e acionar controles manuais.
