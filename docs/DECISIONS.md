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

## D006 - Consolidacao v1.0 iniciada

Status: Aceita

Decisao: o ImovelSP entra em `Consolidacao v1.0`, com `D:\ESTUDOS\PROJETOS\imovel-sp-property-data-clean` como base candidata oficial e governanca v0.1 aprovada.

Motivo: existem multiplos clones locais do ImovelSP, ausencia de fonte unica final e necessidade de congelar features ate consolidar o projeto.

Referencias: `docs/GOVERNANCE.md`, `docs/CONSOLIDATION_EXIT_CRITERIA.md`, `docs/adr/0001-fonte-da-verdade.md`, `docs/adr/0002-congelamento-v1.md`.

## D007 - AUD-001 aprovado e prioridade ajustada

Status: Aceita

Decisao: `AUD-001` esta aprovado como inventario. A prioridade imediata da Consolidacao v1.0 passa a ser classificar e decidir o destino dos 8 commits exclusivos de `D:\ESTUDOS\PROJETOS\imovel-sp-mvp` antes de executar higiene, arquivamento ou integracao das demais worktrees.

Motivo: o inventario invalidou a hipotese inicial de 5 clones independentes e mostrou que existe 1 repositorio Git com 4 worktrees. O maior risco atual e conhecimento relevante fora da base candidata oficial.

Referencias: `docs/audit/AUD-001-clone-inventory.md`, `docs/AUDITORIA_CRITICA.md`.

## D008 - AUD-002 aprovado e risco reclassificado

Status: Aceita

Decisao: `AUD-002` esta aprovado. Nao existe commit exclusivo de `D:\ESTUDOS\PROJETOS\imovel-sp-mvp` que justifique integracao direta na base candidata.

Motivo: os 8 commits exclusivos foram analisados individualmente. O valor util ja foi absorvido por implementacoes superiores na base candidata, e os demais commits representam artefatos, limpeza dependente, configuracao obsoleta ou historico experimental.

Impacto: o risco da Consolidacao v1.0 muda de `conhecimento disperso` para `limpeza e estabilizacao operacional das worktrees`.

Referencias: `docs/audit/AUD-002-imovel-sp-mvp-commit-review.md`, `docs/AUDITORIA_CRITICA.md`.

## D009 - AUD-003 deve tratar worktrees como ativos independentes

Status: Aceita

Decisao: a partir do `AUD-003`, cada worktree do ImovelSP deve ser classificada individualmente em um dos estados: ATIVA, CONGELADA, PRONTA PARA ARQUIVAMENTO ou ARQUIVADA. Nao havera limpeza, arquivamento ou remocao em lote.

Motivo: apos `AUD-001` e `AUD-002`, o risco principal deixou de ser perda de conhecimento e passou a ser estabilizacao operacional das worktrees. A reducao percebida de risco nao deve justificar aceleracao sem evidencia.

Impacto: cada relatorio de auditoria passa a fechar explicitamente resultado produzido, hipoteses confirmadas, hipoteses rejeitadas, risco antes, risco depois e proxima prioridade.

Referencias: `docs/AUDITORIA_CRITICA.md`, `docs/audit/AUD-001-clone-inventory.md`, `docs/audit/AUD-002-imovel-sp-mvp-commit-review.md`.

## D010 - Evolucao da Governanca v0.1 encerrada

Status: Aceita

Decisao: a fase de evolucao da Governanca v0.1 esta encerrada. Durante o restante da Consolidacao v1.0, nao devem ser feitas novas melhorias teoricas em `AGENTS.md`, `docs/GOVERNANCE.md`, `docs/standards/engineering-rules.md` ou `docs/AUDITORIA_CRITICA.md`.

Motivo: a Governanca v0.1 ja demonstrou eficacia operacional em `AUD-001` e `AUD-002`. O risco principal agora e excesso de processo, nao falta de regra. O produto da Consolidacao passa a ser risco concreto eliminado, nao documentacao adicional.

Regra operacional: uma auditoria pode produzir aprendizado para uma auditoria futura, mas nao deve alterar seus proprios criterios durante a execucao. Mudancas de processo relevantes devem virar issue/proposta para uma futura Governanca v0.2, com evidencia concreta.

Impacto: `DECISIONS.md` continua registrando decisoes relevantes, mas documentos de regra ficam congelados ate o fim da Consolidacao v1.0, salvo correcao factual minima ou aprovacao explicita do Owner para uma mudanca de versao.

Referencias: NIST SP 800-128, `docs/GOVERNANCE.md`, `docs/AUDITORIA_CRITICA.md`.

## D011 - Transicao controlada para primeira entrega de produto

Status: Aceita

Decisao: apos a reducao dos principais riscos estruturais identificados na Consolidacao v1.0, o projeto pode iniciar uma primeira entrega de produto pequena e controlada, focada em SEO, busca e UX, sem mudanca de arquitetura, banco de dados ou escopo estrutural.

Motivo: `AUD-001`, `AUD-002`, `AUD-003` e `AUD-004A` reduziram incertezas sobre fonte candidata, worktrees, commits exclusivos e higiene operacional. A Governanca v0.1 foi validada em execucao, e a primeira entrega de produto foi limitada a melhorias sustentadas por documentacao oficial e validacao tecnica.

Regra operacional: nenhuma auditoria futura deve custar mais tempo do que a mudanca que pretende viabilizar. Auditorias devem ser proporcionais ao risco, com foco em evidencia objetiva, validacao e reducao concreta de incerteza.

Impacto: a Consolidacao deixa de ser tratada como processo aberto indefinidamente. As proximas melhorias devem priorizar medicao em producao, dados reais, indexacao, comportamento de busca e conversao antes de novas otimizacoes complexas como full-text search com migration.

Referencias: Next.js Metadata/Sitemap/Robots, Google Search Central SEO Starter Guide, Supabase Full Text Search, WCAG 2.2, `docs/audit/AUD-001-clone-inventory.md`, `docs/audit/AUD-002-imovel-sp-mvp-commit-review.md`, `docs/audit/AUD-003-worktree-state.md`, `docs/audit/AUD-004A-hygiene-inventory.md`.
