"""Composição local dos PDFs a partir das fontes editáveis; sem rede ou modelos."""
from pathlib import Path
from xml.sax.saxutils import escape
import re
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle, Flowable, Preformatted
from reportlab.lib.utils import ImageReader
from pypdf import PdfReader

HERE = Path(__file__).resolve().parent
OUT = HERE.parent
ROOT = OUT.parent
FONT = Path('/System/Library/Fonts/Supplemental')
for name, filename in [('Text', 'Arial.ttf'), ('TextBold', 'Arial Bold.ttf'), ('TextItalic', 'Arial Italic.ttf'), ('Mono', 'Courier New.ttf')]:
    pdfmetrics.registerFont(TTFont(name, str(FONT / filename)))
pdfmetrics.registerFontFamily('Text', normal='Text', bold='TextBold', italic='TextItalic', boldItalic='TextBold')
NAVY = colors.HexColor('#142D40')
TEAL = colors.HexColor('#176E70')
MUTED = colors.HexColor('#506272')
PALE = colors.HexColor('#EDF4F5')
LINE = colors.HexColor('#D6E1E5')
W, H = A4
BODY_W = W - 42 * mm
STYLES = {
    'body': ParagraphStyle('body', fontName='Text', fontSize=10.8, leading=15.5, textColor=NAVY, spaceAfter=9),
    'h1': ParagraphStyle('h1', fontName='TextBold', fontSize=23, leading=28, textColor=NAVY, spaceAfter=15),
    'h2': ParagraphStyle('h2', fontName='TextBold', fontSize=15, leading=20, textColor=TEAL, spaceBefore=8, spaceAfter=10),
    'h3': ParagraphStyle('h3', fontName='TextBold', fontSize=12, leading=16, textColor=TEAL, spaceBefore=9, spaceAfter=7),
    'caption': ParagraphStyle('caption', fontName='TextItalic', fontSize=8.8, leading=12, textColor=MUTED, spaceAfter=11),
    'table': ParagraphStyle('table', fontName='Text', fontSize=9, leading=12.3, textColor=NAVY),
    'table_head': ParagraphStyle('table_head', fontName='TextBold', fontSize=9, leading=12.3, textColor=colors.white),
    'code': ParagraphStyle('code', fontName='Mono', fontSize=9, leading=13, textColor=NAVY, backColor=PALE, borderPadding=10, spaceBefore=6, spaceAfter=12),
}


def rich(text):
    text = escape(text)
    text = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', text)
    return re.sub(r'\[([^\]]+)\]\((https://[^\s)]+)\)', r'<link href="\2" color="#176E70"><u>\1</u></link>', text)


class Figure(Flowable):
    def __init__(self, path, width, height, crop=(0, 0, 1, 1)):
        super().__init__()
        self.reader = ImageReader(str(path))
        self.iw, self.ih = self.reader.getSize()
        self.crop = crop
        x0, y0, x1, y1 = crop
        scale = min(width / ((x1 - x0) * self.iw), height / ((y1 - y0) * self.ih))
        self.scale = scale
        self.width = (x1 - x0) * self.iw * scale
        self.height = (y1 - y0) * self.ih * scale
        self.hAlign = 'CENTER'

    def draw(self):
        c = self.canv
        x0, y0, x1, y1 = self.crop
        c.saveState()
        p = c.beginPath()
        p.rect(0, 0, self.width, self.height)
        c.clipPath(p, stroke=0)
        c.drawImage(self.reader, -x0 * self.iw * self.scale, -(1 - y1) * self.ih * self.scale,
                    self.iw * self.scale, self.ih * self.scale, mask='auto')
        c.restoreState()


def image_block(line):
    match = re.fullmatch(r'!\[(.*)\]\((.*)\)', line)
    caption, filename = match.groups()
    path = (HERE / filename).resolve()
    crops = {'ADD01.png': (.08, .34, .94, .55), 'ADD02.png': (.38, .13, .62, .53), 'ADD03.png': (.27, .23, .75, .75)}
    return Figure(path, 125 * mm, 58 * mm, crops.get(path.name, (0, 0, 1, 1))), Paragraph(rich(caption), STYLES['caption'])


def parse_page(text):
    lines = text.strip().splitlines()
    story = []
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        if not line:
            i += 1
            continue
        if line.startswith('#'):
            level = len(line) - len(line.lstrip('#'))
            story.append(Paragraph(rich(line[level:].strip()), STYLES[f'h{min(level, 3)}']))
        elif line.startswith('```'):
            code = []
            i += 1
            while i < len(lines) and not lines[i].startswith('```'):
                code.append(lines[i])
                i += 1
            story.append(Preformatted('\n'.join(code), STYLES['code']))
        elif line.startswith('|'):
            rows = []
            while i < len(lines) and lines[i].strip().startswith('|'):
                cells = [v.strip() for v in lines[i].strip().strip('|').split('|')]
                if not all(re.fullmatch(r'[-: ]+', v) for v in cells):
                    rows.append(cells)
                i += 1
            widths = [BODY_W / len(rows[0])] * len(rows[0])
            cells = [[Paragraph(rich(value), STYLES['table_head' if j == 0 else 'table']) for value in row] for j, row in enumerate(rows)]
            table = Table(cells, colWidths=widths, hAlign='LEFT', repeatRows=1)
            table.setStyle(TableStyle([('BACKGROUND', (0, 0), (-1, 0), NAVY), ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, PALE]), ('VALIGN', (0, 0), (-1, -1), 'TOP'), ('LEFTPADDING', (0, 0), (-1, -1), 7), ('RIGHTPADDING', (0, 0), (-1, -1), 7), ('TOPPADDING', (0, 0), (-1, -1), 7), ('BOTTOMPADDING', (0, 0), (-1, -1), 7), ('LINEBELOW', (0, -1), (-1, -1), .5, LINE)]))
            story.extend([table, Spacer(1, 10)])
            continue
        elif line.startswith('!['):
            figure, caption = image_block(line)
            if i + 1 < len(lines) and lines[i + 1].strip().startswith('!['):
                other_figure, other_caption = image_block(lines[i + 1].strip())
                story.append(Table([[figure, other_figure], [caption, other_caption]], colWidths=[BODY_W / 2] * 2, style=[('VALIGN', (0, 0), (-1, -1), 'TOP')]))
                i += 1
            else:
                story.extend([figure, Spacer(1, 6), caption])
        else:
            if line.startswith('- '):
                line = '• ' + line[2:]
            story.append(Paragraph(rich(line), STYLES['body']))
        i += 1
    return story


def footer(c, doc):
    c.setStrokeColor(LINE)
    c.line(21 * mm, H - 15 * mm, W - 21 * mm, H - 15 * mm)
    c.setFillColor(MUTED)
    c.setFont('Text', 8)
    c.drawString(21 * mm, H - 12 * mm, 'INE410159  |  Argumentação jurídica visual')
    c.drawString(21 * mm, 13 * mm, 'Versão de trabalho • 27/10/2026 • revisão humana pendente')
    c.drawRightString(W - 21 * mm, 13 * mm, f'{doc.page} / 14')


def build_report():
    text = (HERE / 'relatorio.md').read_text()
    pages = text.split('<!-- page -->')
    assert len(pages) == 14
    story = []
    for i, page in enumerate(pages):
        if i:
            story.append(PageBreak())
        story.extend(parse_page(page))
    path = OUT / 'relatorio-argumentacao-juridica-visual.pdf'
    doc = SimpleDocTemplate(str(path), pagesize=A4, leftMargin=21 * mm, rightMargin=21 * mm,
                            topMargin=23 * mm, bottomMargin=23 * mm,
                            title='Argumentação jurídica visual — solução de preparação reprodutível',
                            author='Projeto INE410159 — versão para revisão', subject='Relatório técnico de preparação offline; sem resultados de inferência')
    doc.build(story, onFirstPage=footer, onLaterPages=footer)
    return path


def poster_paragraph(c, text, x, y, width, size=24, color=NAVY, bold=False):
    style = ParagraphStyle('poster', fontName='TextBold' if bold else 'Text', fontSize=size, leading=size * 1.3, textColor=color, alignment=TA_LEFT)
    p = Paragraph(text, style)
    _, height = p.wrap(width, 4000)
    p.drawOn(c, x, y - height)
    return y - height


def poster_card(c, title, text, x, y, width, height):
    c.setFillColor(PALE)
    c.roundRect(x, y - height, width, height, 14, fill=1, stroke=0)
    cy = poster_paragraph(c, title, x + 26, y - 23, width - 52, 29, TEAL, True)
    end = poster_paragraph(c, text, x + 26, cy - 19, width - 52, 23)
    assert end >= y - height + 18, f'Conteúdo excede cartão: {title}'


def build_poster():
    pw, ph = 594 * mm, 841 * mm
    path = OUT / 'poster-argumentacao-juridica-visual-A1.pdf'
    c = canvas.Canvas(str(path), pagesize=(pw, ph))
    c.setTitle('Argumentação jurídica visual — pôster A1, versão de trabalho')
    c.setAuthor('Projeto INE410159 — versão para revisão')
    m, gap = 65, 44
    cw = (pw - 2 * m - gap) / 2
    c.setFillColor(NAVY)
    c.rect(0, ph - 355, pw, 355, fill=1, stroke=0)
    poster_paragraph(c, 'ARGUMENTAÇÃO JURÍDICA VISUAL', m, ph - 62, pw - 2 * m, 55, colors.white, True)
    poster_paragraph(c, 'Da imagem à premissa: exemplos verificáveis para notebooks', m, ph - 155, pw - 2 * m, 34, colors.white)
    poster_paragraph(c, 'INE410159 • Versão de trabalho • 27 de outubro de 2026', m, ph - 247, pw - 2 * m, 24, colors.HexColor('#C9E6E4'))
    stats_y = ph - 390
    sw = (pw - 2 * m - 2 * gap) / 3
    for i, (number, label) in enumerate([('6', 'tarefas preparadas'), ('12', 'entradas com / sem imagem'), ('0', 'inferências nesta continuação')]):
        x = m + i * (sw + gap)
        c.setFillColor(TEAL)
        c.roundRect(x, stats_y - 142, sw, 142, 12, fill=1, stroke=0)
        poster_paragraph(c, number, x + 22, stats_y - 12, sw - 44, 49, colors.white, True)
        poster_paragraph(c, label, x + 22, stats_y - 83, sw - 44, 21, colors.white)
    y = ph - 577
    x1, x2 = m, m + cw + gap
    poster_card(c, 'PROBLEMA', 'Uma palavra impressa não demonstra um ato realizado. Ler uma seta exige vinculá-la ao painel correto. O conjunto distingue observação, contexto e conclusão permitida pela regra.', x1, y, cw, 238)
    poster_card(c, 'SOLUÇÃO PREPARADA', 'Fontes oficiais → imagens neutras → contexto + argumento incompleto + regra → contrato formal.<br/><br/>O notebook lê arquivos, confere SHA-256 e prepara entradas. As referências ficam em uma pasta exclusiva de avaliação.', x1, y - 268, cw, 322)
    poster_card(c, 'TRÊS FAMÍLIAS, SEIS TAREFAS', '<b>ADD01 / ADD06 — AO88B:</b> alternativas impressas e caixas de seleção vazias.<br/><br/><b>ADD02 / ADD03 — Reino Unido:</b> associação seta–painel e distinção entre permanência e não retorno.<br/><br/><b>ADD04 / ADD05 — Brasil:</b> uma diagonal versus duas diagonais cruzadas sobre E.', x1, y - 620, cw, 416)
    poster_card(c, 'CONTROLE SEM IMAGEM', 'O texto é idêntico nas duas condições. Somente o anexo visual é retirado.<br/><br/>Sem evidência visual, o contrato exige abstenção. Cada condição futura precisa de chamada independente, sem histórico compartilhado.', x1, y - 1066, cw, 330)
    # Brazilian stimuli retain their original pixels and attribution; displayed as figures only.
    cy = poster_paragraph(c, 'PAR VISUAL BRASILEIRO', x2, y - 7, cw, 29, TEAL, True)
    size = (cw - 30) / 2
    image_y = cy - 24 - size
    for i, case_id in enumerate(['ADD04', 'ADD05']):
        xx = x2 + i * (size + 30)
        c.drawImage(str(ROOT / 'model-input/images' / f'{case_id}.png'), xx, image_y, size, size, preserveAspectRatio=True, mask='auto')
        poster_paragraph(c, case_id, xx, image_y - 10, size, 22, TEAL, True)
    poster_paragraph(c, 'Recortes do MBST, 2ª ed., 2007, p. 141 e 151. Mesmas dimensões; sem código, legenda ou redesenho. As categorias decorrem de regra operacional fornecida.', x2, image_y - 51, cw, 21)
    poster_card(c, 'VERIFICAÇÃO LOCAL', 'Três grupos de testes passaram:<br/>• arquivos, hashes e referências;<br/>• doze entradas e ZIP byte a byte;<br/>• preparação e recusas de entradas inválidas.<br/><br/>Isso verifica o pacote, não o desempenho jurídico de um modelo.', x2, y - 620, cw, 390)
    poster_card(c, 'LIMITES DA EVIDÊNCIA', 'Referências propostas por assistentes, com revisão humana pendente. Fontes da mesma família não são observações independentes.<br/><br/>Não há treinamento, checkpoint próprio, acurácia ou decisão sobre fatos reais nesta entrega.', x2, y - 1040, cw, 356)
    foot_y = 344
    c.setStrokeColor(LINE)
    c.line(m, foot_y + 24, pw - m, foot_y + 24)
    poster_paragraph(c, 'ARTEFATOS E REFERÊNCIAS', m, foot_y, pw - 2 * m, 24, TEAL, True)
    text = ('Dataset local: somente-model-input.zip • Código: <link href="https://github.com/anavvanzin/legal-visual-argumentation" color="#176E70">github.com/anavvanzin/legal-visual-argumentation</link><br/>'
            'Fontes: AO88B / District of Wyoming; Department for Transport, Know your traffic signs (OGL v3.0); CONTRAN, MBST Volume I (2007).<br/>'
            'Referências metodológicas: Jaume, Ekenel e Thiran, FUNSD (2019); Mathew, Karatzas e Jawahar, DocVQA (2021).<br/>'
            'Antes da submissão: confirmar autoria, URL do dataset, Google Apresentações e vídeo no YouTube. Nenhum upload foi realizado.')
    style = ParagraphStyle('foot', fontName='Text', fontSize=19, leading=27, textColor=MUTED)
    p = Paragraph(text, style)
    _, height = p.wrap(pw - 2 * m, 1000)
    p.drawOn(c, m, foot_y - 48 - height)
    assert foot_y - 48 - height >= 55
    c.showPage()
    c.save()
    return path


if __name__ == '__main__':
    report = build_report()
    poster = build_poster()
    rr, pr = PdfReader(report), PdfReader(poster)
    assert len(rr.pages) == 14, f'Relatório com {len(rr.pages)} páginas; revisar paginação.'
    assert len(pr.pages) == 1
    assert not any(tag in pr.pages[0].extract_text() for tag in ('<br', '<b>', '</b>'))
    assert abs(float(pr.pages[0].mediabox.width) - 594 * mm) < 1
    assert all((p.extract_text() or '').strip() for p in rr.pages)
    assert sum(len(p.get('/Annots', [])) for p in rr.pages) >= 12
    print({'report_pages': len(rr.pages), 'poster_pages': len(pr.pages), 'poster_mm': [594, 841], 'report_bytes': report.stat().st_size, 'poster_bytes': poster.stat().st_size})
