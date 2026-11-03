"use client";

// 最小安全 Markdown 渲染器：只把本站同步的上游文档渲染成 React 元素，
// 全程不走 dangerouslySetInnerHTML，文本一律经 React 转义，天然防 XSS。
// 支持子集：ATX 标题、段落、粗/斜体、行内代码、代码块、引用、分隔线、
// 表格、无序/有序列表（含一层嵌套与任务列表）、链接与图片（图片只显
// alt 说明）。指向同技能 references/*.md 的内部链接经 onOpenRef 回调
// 在站内打开对应文档；其余相对路径（如 .agents/…）按代码样式纯文本呈现。

import React from "react";

interface Props {
  md: string;
  onOpenRef?: (file: string) => void;
}

// ---------- 行内 ----------

const INLINE_RE =
  /(`[^`]+`)|(\*\*[^*]+\*\*)|(__[^_]+__)|(\*[^*\n]+\*)|(!\[[^\]]*\]\([^)\s]+\))|(\[[^\]]+\]\([^)\s]+\))/g;

function renderInline(
  text: string,
  keyPrefix: string,
  onOpenRef?: (file: string) => void
): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  let last = 0;
  let i = 0;
  let m: RegExpExecArray | null;
  INLINE_RE.lastIndex = 0;
  while ((m = INLINE_RE.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const tok = m[0];
    const key = `${keyPrefix}-${i++}`;
    if (m[1]) {
      out.push(<code key={key}>{tok.slice(1, -1)}</code>);
    } else if (m[2] || m[3]) {
      out.push(
        <strong key={key}>
          {renderInline(tok.slice(2, -2), key, onOpenRef)}
        </strong>
      );
    } else if (m[4]) {
      out.push(
        <em key={key}>{renderInline(tok.slice(1, -1), key, onOpenRef)}</em>
      );
    } else if (m[5]) {
      const alt = tok.slice(2, tok.indexOf("]"));
      out.push(
        <em key={key} className="msh-img-alt">
          [{alt || "image"}]
        </em>
      );
    } else if (m[6]) {
      const close = tok.indexOf("]");
      const label = tok.slice(1, close);
      const url = tok.slice(close + 2, -1).trim();
      const refMatch = url.match(/^(?:\.\/)?(?:references\/)?([\w.-]+\.md)(?:#.*)?$/);
      if (refMatch && onOpenRef) {
        out.push(
          <a
            key={key}
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onOpenRef(refMatch[1]);
            }}
          >
            {renderInline(label, key, onOpenRef)}
          </a>
        );
      } else if (/^https?:\/\//.test(url)) {
        out.push(
          <a key={key} href={url} target="_blank" rel="noopener noreferrer nofollow">
            {renderInline(label, key, onOpenRef)}
          </a>
        );
      } else if (url.startsWith("#")) {
        out.push(<span key={key}>{renderInline(label, key, onOpenRef)}</span>);
      } else {
        out.push(
          <code key={key}>{renderInline(label, key, onOpenRef)}</code>
        );
      }
    }
    last = m.index + tok.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

// ---------- 列表 ----------

interface ListItem {
  indent: number;
  ordered: boolean;
  text: string;
  children: ListItem[];
}

function buildListTree(items: Omit<ListItem, "children">[]): ListItem[] {
  const root: ListItem[] = [];
  const stack: { indent: number; list: ListItem[] }[] = [
    { indent: -1, list: root },
  ];
  for (const it of items) {
    const node: ListItem = { ...it, children: [] };
    while (stack.length > 1 && it.indent <= stack[stack.length - 1].indent) {
      stack.pop();
    }
    stack[stack.length - 1].list.push(node);
    stack.push({ indent: it.indent, list: node.children });
  }
  return root;
}

function renderList(
  items: ListItem[],
  keyPrefix: string,
  onOpenRef?: (file: string) => void
): React.ReactNode {
  if (items.length === 0) return null;
  const Tag = items[0].ordered ? "ol" : "ul";
  return (
    <Tag className="msh-list">
      {items.map((it, idx) => {
        const task = it.text.match(/^\[([ xX])\]\s+(.*)$/);
        return (
          <li key={`${keyPrefix}-${idx}`}>
            {task ? (
              <>
                <span className="msh-task">{task[1] === " " ? "☐" : "☑"}</span>{" "}
                {renderInline(task[2], `${keyPrefix}-${idx}`, onOpenRef)}
              </>
            ) : (
              renderInline(it.text, `${keyPrefix}-${idx}`, onOpenRef)
            )}
            {it.children.length > 0 &&
              renderList(it.children, `${keyPrefix}-${idx}`, onOpenRef)}
          </li>
        );
      })}
    </Tag>
  );
}

// ---------- 块级 ----------

function splitRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((c) => c.trim());
}

export default function MarkdownLite({ md, onOpenRef }: Props) {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const blocks: React.ReactNode[] = [];
  let i = 0;
  let bk = 0;
  const key = () => `b${bk++}`;

  while (i < lines.length) {
    const line = lines[i];

    // 代码块
    if (/^```/.test(line)) {
      const buf: string[] = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) buf.push(lines[i++]);
      i++;
      blocks.push(
        <pre key={key()} className="msh-code">
          <code>{buf.join("\n")}</code>
        </pre>
      );
      continue;
    }

    // 空行
    if (line.trim() === "") {
      i++;
      continue;
    }

    // 标题（文档内 H1/H2 统一降为视觉三级，避免与页面 H1 冲突）
    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      const level = heading[1].length;
      const cls = level <= 2 ? "msh-h msh-h2" : level === 3 ? "msh-h msh-h3" : "msh-h msh-h4";
      blocks.push(
        <div key={key()} className={cls}>
          {renderInline(heading[2], key(), onOpenRef)}
        </div>
      );
      i++;
      continue;
    }

    // 分隔线
    if (/^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(line)) {
      blocks.push(<hr key={key()} className="msh-hr" />);
      i++;
      continue;
    }

    // 引用块
    if (/^>\s?/.test(line)) {
      const buf: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        buf.push(lines[i].replace(/^>\s?/, ""));
        i++;
      }
      blocks.push(
        <blockquote key={key()} className="msh-quote">
          {buf
            .join("\n")
            .split(/\n\s*\n/)
            .filter((p) => p.trim())
            .map((p, pi) => (
              <p key={pi}>{renderInline(p.replace(/\n/g, " "), `${key()}-${pi}`, onOpenRef)}</p>
            ))}
        </blockquote>
      );
      continue;
    }

    // 表格
    if (
      line.trim().startsWith("|") &&
      i + 1 < lines.length &&
      /^\|[\s:|-]+\|?$/.test(lines[i + 1].trim())
    ) {
      const header = splitRow(line);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        rows.push(splitRow(lines[i]));
        i++;
      }
      blocks.push(
        <div key={key()} className="msh-table-wrap">
          <table className="msh-table">
            <thead>
              <tr>
                {header.map((c, ci) => (
                  <th key={ci}>{renderInline(c, `${key()}-h${ci}`, onOpenRef)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, ri) => (
                <tr key={ri}>
                  {header.map((_, ci) => (
                    <td key={ci}>
                      {r[ci] ? renderInline(r[ci], `${key()}-${ri}-${ci}`, onOpenRef) : ""}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    // 列表
    if (/^\s*(-|\*|\d+[.)])\s+/.test(line)) {
      const raw: Omit<ListItem, "children">[] = [];
      while (i < lines.length) {
        const m = lines[i].match(/^(\s*)(-|\*|\d+[.)])\s+(.*)$/);
        if (!m) break;
        raw.push({
          indent: m[1].replace(/\t/g, "  ").length,
          ordered: /\d/.test(m[2]),
          text: m[3],
        });
        i++;
      }
      blocks.push(
        <React.Fragment key={key()}>
          {renderList(buildListTree(raw), key(), onOpenRef)}
        </React.Fragment>
      );
      continue;
    }

    // 段落（合并连续普通行）
    const buf: string[] = [line];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !/^(#{1,6}\s|>|```|\s*(-|\*|\d+[.)])\s)/.test(lines[i]) &&
      !lines[i].trim().startsWith("|")
    ) {
      buf.push(lines[i]);
      i++;
    }
    blocks.push(
      <p key={key()} className="msh-p">
        {renderInline(buf.join(" "), key(), onOpenRef)}
      </p>
    );
  }

  return <div className="msh-doc">{blocks}</div>;
}
