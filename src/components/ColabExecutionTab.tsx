import React, { useEffect, useMemo, useState } from 'react';
import { COLAB_CELLS, generateIpynbJson } from '../data/colabNotebookData';
import type { ExecutedRunRecord, PreFlightHashCheck } from '../utils/serverExecutionEngine';

interface ColabExecutionTabProps {
  currentUser: { getIdToken(): Promise<string> } | null;
}

type LiveScope = 'all' | 'case01' | 'federal_forms';
type ViewMode = 'summary' | 'comparison' | 'json' | 'notebook';

function download(name: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function ColabExecutionTab({ currentUser }: ColabExecutionTabProps) {
  const [hashes, setHashes] = useState<PreFlightHashCheck[]>([]);
  const [records, setRecords] = useState<ExecutedRunRecord[]>([]);
  const [scope, setScope] = useState<LiveScope>('all');
  const [view, setView] = useState<ViewMode>('summary');
  const [selectedRecordId, setSelectedRecordId] = useState('');
  const [selectedCellId, setSelectedCellId] = useState(COLAB_CELLS[0].id);
  const [isRunning, setIsRunning] = useState(false);
  const [message, setMessage] = useState('Faça login para consultar registros do servidor.');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) return;
    let active = true;
    setError(null);
    currentUser.getIdToken()
      .then((token) => fetch('/api/execute/status', { headers: { Authorization: `Bearer ${token}` } }))
      .then(async (response) => {
        if (!response.ok) throw new Error(`Falha ao consultar status: HTTP ${response.status}`);
        return response.json();
      })
      .then((data) => {
        if (!active) return;
        const nextHashes = Array.isArray(data.hashes) ? data.hashes : [];
        const nextRecords = Array.isArray(data.records) ? data.records : [];
        setHashes(nextHashes);
        setRecords(nextRecords);
        setSelectedRecordId(nextRecords[0]?.run_id ?? '');
        setMessage(nextRecords.length > 0 ? `${nextRecords.length} registros retornados pelo servidor.` : 'Consulta concluída: nenhum registro revalidado disponível.');
      })
      .catch((reason) => {
        if (active) setError(reason instanceof Error ? reason.message : 'Falha ao consultar status.');
      });
    return () => { active = false; };
  }, [currentUser]);

  const selectedRecord = useMemo(
    () => records.find((record) => record.run_id === selectedRecordId) ?? records[0],
    [records, selectedRecordId]
  );
  const selectedCell = COLAB_CELLS.find((cell) => cell.id === selectedCellId) ?? COLAB_CELLS[0];

  const run = async () => {
    if (!currentUser) {
      setError('Autenticação obrigatória para executar modelos.');
      return;
    }
    setIsRunning(true);
    setError(null);
    setMessage('Execução autorizada em andamento.');
    try {
      const token = await currentUser.getIdToken();
      const response = await fetch('/api/execute/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ scope }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
      const nextRecords = Array.isArray(data.records) ? data.records : [];
      setHashes(Array.isArray(data.hashes) ? data.hashes : []);
      setRecords(nextRecords);
      setSelectedRecordId(nextRecords[0]?.run_id ?? '');
      setMessage(`Execução concluída com ${nextRecords.length} registros recebidos.`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Falha na execução autorizada.');
    } finally {
      setIsRunning(false);
    }
  };

  const exportJsonl = () => download('legalvision-results.jsonl', records.map((record) => JSON.stringify(record)).join('\n') + '\n', 'application/x-jsonlines');
  const exportCsv = () => download(
    'legalvision-results.csv',
    ['run_id,case_id,condition,status', ...records.map((record) => [record.run_id, record.case_id, record.condition, record.status].map((value) => JSON.stringify(value)).join(','))].join('\n'),
    'text/csv'
  );
  const exportMarkdown = () => download(
    'legalvision-results.md',
    ['# Registros retornados pelo servidor', '', `Total: ${records.length}`, '', '| Run ID | Caso | Condição | Status |', '| --- | --- | --- | --- |', ...records.map((record) => `| ${record.run_id} | ${record.case_id} | ${record.condition} | ${record.status} |`)].join('\n'),
    'text/markdown'
  );

  return (
    <section className="module-box space-y-5" aria-labelledby="execution-title">
      <div>
        <div className="var3-label">CONNECTED MODE</div>
        <h2 id="execution-title" className="font-oswald text-3xl font-bold">EXECUTION_CONTROL</h2>
        <p>Resultados e métricas aparecem somente quando registros são retornados pelo servidor autenticado.</p>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <label className="text-sm font-semibold">Escopo
          <select className="ml-2 border border-[#1a1a1c] bg-white p-2" value={scope} onChange={(event) => setScope(event.target.value as LiveScope)}>
            <option value="all">Todos</option><option value="case01">CASE01</option><option value="federal_forms">Formulários federais</option>
          </select>
        </label>
        <button className="btn-action" disabled={!currentUser || isRunning} onClick={run} type="button">{isRunning ? 'Running…' : 'Run authenticated batch'}</button>
        <button className="btn-action" onClick={() => download('execucao-piloto-juridico-colab.ipynb', generateIpynbJson(), 'application/json')} type="button">Download notebook</button>
      </div>

      <p className="border border-[#d4dce0] bg-white p-3 text-sm" role="status">{error ?? message}</p>
      <p className="text-sm">Hashes verificados pelo servidor: {hashes.filter((item) => item.verified).length}/{hashes.length}. Registros disponíveis: {records.length}.</p>

      <div className="flex flex-wrap gap-2" aria-label="Visualizações de execução">
        {(['summary', 'comparison', 'json', 'notebook'] as const).map((item) => (
          <button key={item} className={`nav-item ${view === item ? 'active' : ''}`} onClick={() => setView(item)} type="button">{item}</button>
        ))}
      </div>

      {view === 'summary' && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <button disabled={!records.length} onClick={exportJsonl} type="button">Export JSONL</button>
            <button disabled={!records.length} onClick={exportCsv} type="button">Export CSV</button>
            <button disabled={!records.length} onClick={exportMarkdown} type="button">Export Markdown</button>
          </div>
          {records.length === 0 ? <p>Nenhum registro disponível; isso não representa resultado zero.</p> : (
            <div className="overflow-x-auto"><table className="var3-table"><caption className="pb-3 text-left font-semibold">Registros retornados</caption><thead><tr><th>Run ID</th><th>Caso</th><th>Condição</th><th>Status</th></tr></thead><tbody>{records.map((record) => <tr key={record.run_id}><td className="font-mono text-xs">{record.run_id}</td><td>{record.case_id}</td><td>{record.condition}</td><td>{record.status}</td></tr>)}</tbody></table></div>
          )}
        </div>
      )}

      {view === 'comparison' && (
        <div className="overflow-x-auto"><table className="var3-table"><caption className="pb-3 text-left font-semibold">Comparação por condição</caption><thead><tr><th>Condição</th><th>Registros</th><th>Com imagem</th></tr></thead><tbody>{[...new Set(records.map((record) => record.condition))].map((condition) => { const rows = records.filter((record) => record.condition === condition); return <tr key={condition}><td>{condition}</td><td>{rows.length}</td><td>{rows.filter((record) => record.image_attached).length}</td></tr>; })}</tbody></table></div>
      )}

      {view === 'json' && (
        <div className="space-y-3">
          <select className="w-full border p-2" value={selectedRecord?.run_id ?? ''} onChange={(event) => setSelectedRecordId(event.target.value)} disabled={!records.length}>{records.map((record) => <option key={record.run_id} value={record.run_id}>{record.run_id}</option>)}</select>
          <pre className="max-h-[32rem] overflow-auto bg-[#111] p-4 text-xs text-white">{selectedRecord ? selectedRecord.raw_response : 'Nenhum JSON disponível.'}</pre>
        </div>
      )}

      {view === 'notebook' && (
        <div className="grid gap-4 lg:grid-cols-[18rem_1fr]">
          <div>{COLAB_CELLS.map((cell) => <button key={cell.id} className={`nav-item w-full ${selectedCell.id === cell.id ? 'active' : ''}`} onClick={() => setSelectedCellId(cell.id)} type="button">{cell.title}</button>)}</div>
          <div className="space-y-2"><h3 className="font-semibold">{selectedCell.title}</h3><pre className="max-h-[32rem] overflow-auto bg-[#111] p-4 text-xs text-white">{selectedCell.source.join('')}</pre><button onClick={() => navigator.clipboard.writeText(selectedCell.source.join(''))} type="button">Copy cell</button></div>
        </div>
      )}
    </section>
  );
}
