# utils.py - helpers for reading file content
import io
from PyPDF2 import PdfReader
from docx import Document

def read_file_text(filename: str, content_bytes: bytes) -> str:
    lower = filename.lower()
    if lower.endswith('.pdf'):
        return _read_pdf(content_bytes)
    if lower.endswith('.docx') or lower.endswith('.doc'):
        return _read_docx(content_bytes)
    # fallback assuming text
    try:
        return content_bytes.decode('utf-8', errors='ignore')
    except:
        return str(content_bytes)

def _read_pdf(bytestr: bytes) -> str:
    try:
        reader = PdfReader(io.BytesIO(bytestr))
        pages = []
        for p in reader.pages:
            try:
                pages.append(p.extract_text() or '')
            except:
                pages.append('')
        return '\n'.join(pages)
    except Exception as e:
        # fallback: return raw bytes as string
        return bytestr.decode('utf-8', errors='ignore')

def _read_docx(bytestr: bytes) -> str:
    try:
        f = io.BytesIO(bytestr)
        doc = Document(f)
        return '\n'.join([p.text for p in doc.paragraphs])
    except Exception as e:
        return bytestr.decode('utf-8', errors='ignore')
