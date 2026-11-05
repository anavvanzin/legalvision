import React from 'react';
import catalog from '../data/datasetCatalog.json';

const downloadClass = 'inline-flex items-center border-2 border-[#1a1a1c] px-4 py-3 font-mono text-xs font-bold uppercase text-[#1a1a1c] hover:bg-[#1a1a1c] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4';

export function OfflineDatasetTab() {
  return (
    <section aria-labelledby="offline-dataset-title" className="space-y-6">
      <div className="module-box space-y-4">
        <div className="var3-label">DATASET EM CONSTRUÇÃO</div>
        <h2 id="offline-dataset-title" className="font-oswald text-3xl font-bold">INVENTÁRIO_AUDITADO</h2>
        <p>O núcleo público contém seis tarefas e doze entradas preparadas, com e sem imagem. Foram realizadas zero inferências. As referências foram propostas por assistentes e aguardam revisão humana.</p>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <caption className="pb-3 text-left font-semibold">Inventário do lote adicional</caption>
            <thead><tr><th scope="col" className="p-2">ID</th><th scope="col" className="p-2">Tarefa</th><th scope="col" className="p-2">Família documental</th></tr></thead>
            <tbody>{catalog.cases.map((item) => (
              <tr key={item.id} className="border-t border-gray-200"><th scope="row" className="p-2 font-mono">{item.id}</th><td className="p-2">{item.task}</td><td className="p-2">{item.family}</td></tr>
            ))}</tbody>
          </table>
        </div>
      </div>

      <div className="module-box space-y-4">
        <h3 className="text-xl font-semibold">Arquivos de preparação</h3>
        <p>O notebook confere o índice e as entradas preparadas. Ele não instala pacotes, baixa fontes nem chama modelos.</p>
        <div className="flex flex-wrap gap-3">
          <a className={downloadClass} href="/dataset-offline-2026-10-27/notebook-aditivo-offline.ipynb" download>Notebook de preparação (.ipynb)</a>
          <a className={downloadClass} href="/dataset-offline-2026-10-27/prepared-inputs.jsonl" download>Entradas preparadas (.jsonl)</a>
          <a className={downloadClass} href="/dataset-offline-2026-10-27/index.json" download>Índice do lote (.json)</a>
        </div>
        <p className="text-sm">As duas condições usam texto idêntico; somente o anexo é retirado. Chamadas futuras precisam de contextos independentes. Fontes, caixas e respostas esperadas permanecem fora destes downloads.</p>
        <p className="border border-amber-500 bg-amber-50 p-3 text-sm text-amber-900">Material de pesquisa em preparação. Este módulo não executa modelos e não apresenta métricas de desempenho.</p>
      </div>

      <div className="module-box space-y-4">
        <h3 className="text-xl font-semibold">Estado do contrato</h3>
        <p>{catalog.caseCount} tarefas · {catalog.preparedInputCount} entradas preparadas · {catalog.conditions.length} condições · 0 inferências</p>
        <p className="text-sm">Referências: <code>{catalog.referenceStatus}</code>. Execução: <code>{catalog.executionStatus}</code>.</p>
      </div>
    </section>
  );
}
