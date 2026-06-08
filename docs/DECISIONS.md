# Decisions

Registre decisoes relevantes do produto, arquitetura e processo.

## D001 - Revisao por multiplas IAs

Status: Aceita

Decisao: nenhuma feature critica deve depender de uma unica IA. Codex implementa e testa, Claude/ChatGPT revisam arquitetura e produto, Ollama audita seguranca e bugs, e o humano decide o merge.

Motivo: reduz vies de uma unica ferramenta e cria uma trilha de revisao mais clara.

## D002 - Qualidade dos dados acima de volume

Status: Aceita

Decisao: a proxima fase prioriza 1 imovel real completo antes de aumentar volume.

Motivo: o primeiro cadastro completo define o padrao de qualidade para todos os proximos imoveis.

## D003 - Upload so depois de seguranca

Status: Aceita

Decisao: upload de fotos fica bloqueado ate a branch de seguranca estar validada.

Motivo: upload abre risco de arquivo malicioso, permissao errada, vazamento e sobrescrita.

## D004 - Branches por responsabilidade

Status: Aceita

Decisao: seguranca, dados, UX, automacao e auth devem ficar em branches separadas sempre que possivel.

Motivo: PRs menores sao mais faceis de testar, revisar e reverter.

## D005 - Segredos somente no servidor

Status: Aceita

Decisao: chaves secretas do Supabase e qualquer `service_role` nunca entram no frontend.

Motivo: qualquer variavel enviada ao browser deve ser tratada como publica.
