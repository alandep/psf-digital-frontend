# Documento de Requisitos

## Introdução

Esta funcionalidade adiciona à tela "Meu Perfil" (`src/app/components/perfil/`) um componente de upload e edição de foto de perfil. No local onde hoje existe o ícone genérico de usuário (avatar circular no cabeçalho da página), o usuário poderá enviar uma imagem, ajustá-la (zoom e reposicionamento) para enquadrá-la em um recorte circular, e salvar essa foto para que fique associada ao seu perfil.

A funcionalidade segue a identidade visual das telas "Logística > Portos", utiliza componentes do Angular Material e o padrão de telas fluidas com cards espaçados já adotado no projeto. Como os serviços REST ainda serão implementados, a persistência será feita através de um serviço mock (baseado em Observable, seguindo o padrão dos demais serviços em `src/app/services/`), de modo que o fluxo completo seja navegável e testável. A foto salva deve refletir no perfil e nos demais pontos da aplicação que exibem o avatar do usuário (cabeçalho do perfil e, quando existirem, toolbar e cabeçalho do menu lateral).

## Glossário

- **Sistema_Perfil**: Componente Angular da tela "Meu Perfil" (`PerfilComponent`) responsável por exibir e gerenciar os dados do perfil, incluindo o avatar.
- **Editor_Foto**: Subcomponente responsável pela seleção, pré-visualização e ajuste (zoom e reposicionamento) da imagem antes de salvar, apresentado em um diálogo do Angular Material.
- **Servico_Avatar**: Serviço mock (`AvatarService`) que persiste e recupera a foto de perfil do usuário, expondo os dados via Observable e simulando o comportamento de um serviço REST futuro.
- **Foto_Perfil**: Imagem processada e salva, associada ao usuário, exibida no avatar circular.
- **Formato_Aceito**: Tipo de arquivo de imagem permitido para upload (JPEG e PNG).
- **Tamanho_Maximo**: Limite máximo de tamanho do arquivo de imagem aceito para upload (5 MB).
- **Area_Recorte**: Região circular sobre a qual a imagem é enquadrada e recortada para gerar a Foto_Perfil.
- **Avatar_Global**: Representação do avatar do usuário exibida fora da tela de perfil (toolbar e cabeçalho do menu lateral, quando presentes).

## Requisitos

### Requisito 1: Iniciar o upload/edição da foto a partir do avatar

**User Story:** Como usuário da plataforma, quero acionar a edição da foto a partir do avatar na tela "Meu Perfil", para poder enviar ou alterar minha imagem de perfil.

#### Critérios de Aceitação

1. THE Sistema_Perfil SHALL exibir um avatar circular no cabeçalho da tela "Meu Perfil".
2. WHERE o usuário não possui Foto_Perfil salva, THE Sistema_Perfil SHALL exibir o ícone padrão de usuário no avatar circular.
3. WHERE o usuário possui Foto_Perfil salva, THE Sistema_Perfil SHALL exibir a Foto_Perfil no avatar circular.
4. WHEN o usuário aciona o controle de edição do avatar, THE Sistema_Perfil SHALL abrir o Editor_Foto em um diálogo do Angular Material.
5. THE Sistema_Perfil SHALL apresentar um controle de edição do avatar com rótulo textual e ícone visíveis.

### Requisito 2: Selecionar uma imagem

**User Story:** Como usuário, quero selecionar uma imagem por meio de arraste-e-solte ou de seletor de arquivos, para escolher a foto que representará meu perfil.

#### Critérios de Aceitação

1. THE Editor_Foto SHALL disponibilizar um seletor de arquivos para escolher uma imagem do dispositivo.
2. THE Editor_Foto SHALL disponibilizar uma área que aceita arraste-e-solte de um arquivo de imagem.
3. WHEN o usuário solta um arquivo de imagem sobre a área de arraste-e-solte, THE Editor_Foto SHALL carregar o arquivo para pré-visualização.
4. WHEN o usuário seleciona um arquivo de imagem pelo seletor de arquivos, THE Editor_Foto SHALL carregar o arquivo para pré-visualização.
5. WHILE um arquivo está sendo processado para pré-visualização, THE Editor_Foto SHALL exibir um indicador de carregamento.

### Requisito 3: Validar o formato do arquivo

**User Story:** Como usuário, quero ser avisado quando o arquivo escolhido não for uma imagem suportada, para corrigir minha seleção.

#### Critérios de Aceitação

1. THE Editor_Foto SHALL aceitar arquivos nos Formato_Aceito JPEG e PNG.
2. IF o usuário seleciona um arquivo cujo tipo é diferente dos Formato_Aceito, THEN THE Editor_Foto SHALL rejeitar o arquivo e exibir a mensagem "Formato inválido. Envie uma imagem JPEG ou PNG.".
3. IF o usuário seleciona um arquivo com tipo inválido, THEN THE Editor_Foto SHALL manter a pré-visualização anterior inalterada.

### Requisito 4: Validar o tamanho do arquivo

**User Story:** Como usuário, quero ser avisado quando o arquivo exceder o tamanho permitido, para escolher uma imagem menor.

#### Critérios de Aceitação

1. THE Editor_Foto SHALL aceitar arquivos com tamanho de até 5 MB (Tamanho_Maximo).
2. IF o usuário seleciona um arquivo com tamanho superior ao Tamanho_Maximo, THEN THE Editor_Foto SHALL rejeitar o arquivo e exibir a mensagem "Arquivo muito grande. O tamanho máximo é 5 MB.".
3. IF o usuário seleciona um arquivo acima do Tamanho_Maximo, THEN THE Editor_Foto SHALL manter a pré-visualização anterior inalterada.

### Requisito 5: Pré-visualizar, ajustar e recortar a imagem

**User Story:** Como usuário, quero ajustar o zoom e reposicionar a imagem dentro de um recorte circular, para enquadrar minha foto da forma que desejo.

#### Critérios de Aceitação

1. WHEN uma imagem válida é carregada, THE Editor_Foto SHALL exibir a imagem sobre a Area_Recorte circular.
2. THE Editor_Foto SHALL disponibilizar um controle de zoom que ajusta a escala da imagem exibida.
3. WHEN o usuário arrasta a imagem dentro da Area_Recorte, THE Editor_Foto SHALL reposicionar a imagem conforme o movimento do usuário.
4. WHEN o usuário ajusta o zoom, THE Editor_Foto SHALL atualizar a pré-visualização em tempo real.
5. WHEN o usuário confirma o ajuste, THE Editor_Foto SHALL gerar a Foto_Perfil recortada segundo o enquadramento circular definido.
6. THE Editor_Foto SHALL disponibilizar um controle para redefinir o zoom e o posicionamento aos valores iniciais.

### Requisito 6: Salvar a foto de perfil

**User Story:** Como usuário, quero salvar a foto ajustada, para que ela fique associada ao meu perfil de forma persistente.

#### Critérios de Aceitação

1. WHEN o usuário confirma o salvamento no Editor_Foto, THE Servico_Avatar SHALL persistir a Foto_Perfil associada ao usuário.
2. WHILE o salvamento está em andamento, THE Editor_Foto SHALL exibir um indicador de progresso e desabilitar o controle de confirmação.
3. WHEN o salvamento é concluído com sucesso, THE Sistema_Perfil SHALL fechar o diálogo do Editor_Foto e atualizar o avatar circular com a Foto_Perfil.
4. WHEN o salvamento é concluído com sucesso, THE Sistema_Perfil SHALL exibir uma notificação de confirmação com o texto "Foto de perfil atualizada com sucesso!".
5. IF o salvamento falha, THEN THE Editor_Foto SHALL exibir a mensagem "Não foi possível salvar a foto. Tente novamente." e manter o diálogo aberto.

### Requisito 7: Cancelar ou redefinir a edição

**User Story:** Como usuário, quero cancelar a edição sem salvar, para descartar alterações que não desejo aplicar.

#### Critérios de Aceitação

1. WHEN o usuário aciona o controle de cancelamento no Editor_Foto, THE Sistema_Perfil SHALL fechar o diálogo sem alterar a Foto_Perfil persistida.
2. WHEN o usuário cancela a edição, THE Sistema_Perfil SHALL manter o avatar circular com a imagem exibida antes da abertura do Editor_Foto.
3. WHERE o usuário possui uma Foto_Perfil salva, THE Editor_Foto SHALL disponibilizar um controle para remover a Foto_Perfil e retornar ao ícone padrão de usuário.
4. WHEN o usuário confirma a remoção da Foto_Perfil, THE Servico_Avatar SHALL remover a Foto_Perfil persistida do usuário.

### Requisito 8: Persistência via serviço mock

**User Story:** Como desenvolvedor, quero que a foto seja persistida por um serviço mock, para que o fluxo seja totalmente navegável e testável antes da implementação dos serviços REST.

#### Critérios de Aceitação

1. THE Servico_Avatar SHALL expor operações de leitura, gravação e remoção da Foto_Perfil por meio de Observable, seguindo o padrão dos serviços existentes em `src/app/services/`.
2. THE Servico_Avatar SHALL armazenar a Foto_Perfil de forma que permaneça disponível após recarregamento da página durante a sessão de testes.
3. WHEN a tela "Meu Perfil" é carregada, THE Sistema_Perfil SHALL solicitar ao Servico_Avatar a Foto_Perfil atual do usuário.
4. WHEN o Servico_Avatar retorna uma Foto_Perfil, THE Sistema_Perfil SHALL exibir a Foto_Perfil no avatar circular.

### Requisito 9: Exibição do avatar em toda a aplicação

**User Story:** Como usuário, quero que minha foto apareça nos pontos da aplicação que exibem meu avatar, para ter uma identidade visual consistente.

#### Critérios de Aceitação

1. WHEN a Foto_Perfil é salva com sucesso, THE Sistema_Perfil SHALL atualizar o Avatar_Global exibido nos demais pontos da aplicação que apresentam o avatar do usuário.
2. WHERE a aplicação exibe o avatar do usuário na toolbar, THE Avatar_Global SHALL apresentar a Foto_Perfil salva.
3. WHERE a aplicação exibe o avatar do usuário no cabeçalho do menu lateral, THE Avatar_Global SHALL apresentar a Foto_Perfil salva.
4. WHERE o usuário não possui Foto_Perfil salva, THE Avatar_Global SHALL apresentar o ícone padrão de usuário.

### Requisito 10: Acessibilidade e identidade visual

**User Story:** Como usuário, quero que o componente seja acessível e visualmente coerente com o restante do sistema, para uma experiência inclusiva e consistente.

#### Critérios de Aceitação

1. THE Editor_Foto SHALL utilizar componentes do Angular Material e seguir a identidade visual das telas "Logística > Portos".
2. THE Editor_Foto SHALL fornecer rótulos de texto alternativo (`aria-label`) para os controles de seleção, zoom, salvar, cancelar e remover.
3. THE Editor_Foto SHALL permitir a operação dos controles de seleção, salvar e cancelar por meio de navegação por teclado.
4. WHEN o Editor_Foto é aberto, THE Editor_Foto SHALL direcionar o foco para o primeiro controle interativo do diálogo.
5. THE Sistema_Perfil SHALL manter o padrão de tela fluida com cards espaçados já adotado na tela "Meu Perfil".
